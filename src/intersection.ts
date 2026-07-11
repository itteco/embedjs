import iframely from './iframely';
import * as messaging from './messaging';
import type { IframelyWidget } from './types';

interface IntersectionOptions {
	threshold?: number | number[];
	margin?: number;
}

const observers: Record<string, IntersectionObserver> = {};

function getObserver(options: IntersectionOptions): IntersectionObserver {
	const optionsKey = JSON.stringify(options);
	let observer = observers[optionsKey];
	if (!observer) {
		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				messaging.postMessage(
					{
						method: 'intersection',
						entry: {
							isIntersecting: entry.isIntersecting
						},
						options: options
					},
					'*',
					(entry.target as HTMLIFrameElement).contentWindow
				);
			});
		}, getObserverOptions(options));

		observers[optionsKey] = observer;
	}
	return observer;
}

function getObserverOptions(options: IntersectionOptions): IntersectionObserverInit {
	const result: IntersectionObserverInit = {};
	if (options && options.threshold) {
		result.threshold = options.threshold;
	}
	if (options && options.margin) {
		result.rootMargin =
			options.margin +
			'px ' +
			options.margin +
			'px ' +
			options.margin +
			'px ' +
			options.margin +
			'px';
	}
	return result;
}

export function boot(): void {
	iframely.on('init', () => {
		iframely.configure({
			intersection: 1
		});
	});

	iframely.on('message', (widget, message) => {
		if (message.method === 'send-intersections' && widget.iframe) {
			let options = message.options;

			if (!options) {
				options = {
					margin: 1000
				};
			}

			getObserver(options).observe(widget.iframe);
		}
	});

	// Observers hold strong references to their targets: release a widget's
	// iframe when it is unloaded, and drop all observers on a full unload.
	iframely.on('unload-widget', (widget: IframelyWidget) => {
		Object.values(observers).forEach((observer) => observer.unobserve(widget.iframe));
	});

	iframely.on('unload', (el?: Element) => {
		if (!el) {
			Object.keys(observers).forEach((key) => {
				observers[key].disconnect();
				delete observers[key];
			});
		}
	});
}
