import iframely from './iframely';
// Circular with utils.ts — safe: getWidget is only called from the message
// listener, long after both modules have evaluated. Keep the namespace
// import and keep cross-module use deferred (never at top level).
import * as utils from './utils';
import type { FindIframeOptions, IframelyMessage } from './types';

function receiveMessage(
	callback: (e: MessageEvent, message: IframelyMessage | undefined) => void
): void {
	window.addEventListener(
		'message',
		(e: MessageEvent) => {
			let message: IframelyMessage | undefined;
			try {
				if (typeof e.data === 'string') {
					message = JSON.parse(e.data);
				} else if (typeof e.data === 'object') {
					message = e.data;
				}
			} catch {
				if (typeof e.data === 'string') {
					const m = e.data.match(/heightxPYMx(\d+)/);
					if (m) {
						message = {
							method: 'resize',
							height: parseInt(m[1]) + 1,
							domains: 'all'
						};
					}
				}
			}

			callback(e, message);
		},
		false
	);
}

function findIframeByContentWindow(
	iframes: ArrayLike<HTMLIFrameElement>,
	contentWindow: FindIframeOptions['contentWindow']
): HTMLIFrameElement | undefined {
	let foundIframe;
	for (let i = 0; i < iframes.length && !foundIframe; i++) {
		const iframe = iframes[i];
		if (iframe.contentWindow === contentWindow) {
			foundIframe = iframe;
		}
	}
	return foundIframe;
}

function findIframeInElement(
	element: Document | Element | ShadowRoot,
	options: FindIframeOptions
): HTMLIFrameElement | undefined {
	let foundIframe, iframes;

	if (options.src) {
		iframes = element.querySelectorAll<HTMLIFrameElement>(
			'iframe[src*="' + options.src.replace(/^https?:/, '') + '"]'
		);
		foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
	}

	if (!foundIframe) {
		iframes = options.domains
			? element.querySelectorAll<HTMLIFrameElement>(
					'iframe[src*="' +
						(options.domains || iframely.DOMAINS).join('"], iframe[src*="') +
						'"]'
				)
			: element.querySelectorAll('iframe');
		foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
	}

	return foundIframe;
}

function findIframeInShadowRoots(
	element: Document | Element | ShadowRoot,
	options: FindIframeOptions
): HTMLIFrameElement | undefined {
	let foundIframe;
	const className = '.' + (iframely.config.shadow || iframely.SHADOW);
	const shadowRoots = element.querySelectorAll(className);
	for (let i = 0; i < shadowRoots.length && !foundIframe; i++) {
		const shadowRoot = shadowRoots[i].shadowRoot;
		if (shadowRoot) {
			foundIframe = findIframeInElement(shadowRoot, options);
			if (!foundIframe) {
				foundIframe = findIframeInShadowRoots(shadowRoot, options);
			}
		}
	}
	return foundIframe;
}

export function boot(): void {
	// Do not override existing.
	if (!iframely.findIframe) {
		iframely.findIframe = (options) => {
			let foundIframe = findIframeInElement(document, options);
			if (!foundIframe) {
				foundIframe = findIframeInShadowRoots(document, options);
			}
			return foundIframe;
		};
	}

	receiveMessage((e, message) => {
		if (message && (message.method || message.type || message.context)) {
			const foundIframe = iframely.findIframe({
				contentWindow: e.source,
				src: message.src || message.context,
				domains: message.domains !== 'all' && iframely.DOMAINS.concat(iframely.CDN)
			});

			if (foundIframe) {
				const widget = utils.getWidget(foundIframe);
				if (widget && message.url) {
					widget.url = message.url;
				}
				iframely.trigger('message', widget, message);
			}
		}
	});
}

export function postMessage(
	message: IframelyMessage | string,
	target_url?: string,
	target?: Window | null
): void {
	if (typeof message === 'object') {
		message.context = document.location.href;
	}

	const data = JSON.stringify(message);

	target_url = target_url || '*';

	target = target || window.parent; // default to parent

	// Call postMessage with a targetOrigin set appropriately,
	// based on the target_url parameter.
	target.postMessage(data, target_url.replace(/([^:]+:\/\/[^/]+).*/, '$1'));
}
