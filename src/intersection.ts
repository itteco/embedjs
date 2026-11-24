import iframely from './iframely.js';
import * as messaging from './messaging.js';
import type { IframelyWidget } from './types.js';

interface IntersectionOptions {
	threshold?: number | number[];
	margin?: number;
}

// One observer per distinct options, with the iframes it observes: the
// browser does not expose an observer's targets.
interface ObserverEntry {
	observer: IntersectionObserver;
	targets: Set<Element>;
}

const observers: Record<string, ObserverEntry> = {};

function getObserver(options: IntersectionOptions): ObserverEntry {
	const optionsKey = JSON.stringify(options);
	let record = observers[optionsKey];
	if (!record) {
		const observer = new IntersectionObserver((entries) => {
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

		record = observers[optionsKey] = { observer: observer, targets: new Set() };
	}
	return record;
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
		// widget is undefined when the iframe has no wrapper structure.
		if (message.method === 'send-intersections' && widget && widget.iframe) {
			let options = message.options;

			if (!options) {
				options = {
					margin: 1000
				};
			}

			const entry = getObserver(options);
			entry.observer.observe(widget.iframe);
			entry.targets.add(widget.iframe);
		}
	});

	// Observers hold strong references to their targets: release a widget's
	// iframe when it is unloaded.
	iframely.on('unload-widget', (widget: IframelyWidget) => {
		Object.values(observers).forEach((entry) => {
			entry.observer.unobserve(widget.iframe);
			entry.targets.delete(widget.iframe);
		});
	});

	// A full unload also releases the iframes that left the document some
	// other way, and drops the observers that have nothing left to observe.
	// Iframes unload() does not remove (widgets inside shadow roots) are still
	// in the document and keep their observer.
	iframely.on('unload', (el?: Element) => {
		if (!el) {
			Object.keys(observers).forEach((key) => {
				const entry = observers[key];
				entry.targets.forEach((iframe) => {
					if (!iframe.isConnected) {
						entry.observer.unobserve(iframe);
						entry.targets.delete(iframe);
					}
				});
				if (!entry.targets.size) {
					entry.observer.disconnect();
					delete observers[key];
				}
			});
		}
	});
}
