import iframely from './iframely.js';
import { findParentByClass } from './utils.js';
import type { IframelyWidget } from './types.js';

export function boot(): void {
	iframely.on('message', (widget, message) => {
		if (message.method === 'cancelWidget') {
			iframely.cancelWidget(widget);
		}
	});

	iframely.cancelWidget = (widget) => {
		if (!widget) {
			console.warn('iframely.cancelWidget called without widget param');
			return;
		}

		let parentNode = widget.maxWidthWrapper && widget.maxWidthWrapper.parentNode;
		let naNode: Element = widget.maxWidthWrapper;

		// Try remove by parentClass first.
		if (iframely.config && iframely.config.parent) {
			// Remove by parent class.
			const parentElement = findParentByClass(
				widget.maxWidthWrapper,
				String(iframely.config.parent)
			);

			if (parentElement) {
				parentNode = parentElement.parentNode;
				naNode = parentElement;
			}
		}

		if (widget.url) {
			const text = widget.iframe && widget.iframe.textContent;

			iframely.triggerAsync('cancel', widget.url, parentNode, text, naNode.nextSibling);
		}

		// Like unload(): lets modules release per-widget state (observers, timeouts).
		// An import link cancelled before it was built has no aspectWrapper.
		iframely.trigger('unload-widget', widget as IframelyWidget);

		naNode.remove();
	};

	// The default reaction to a cancelled widget: put a plain link back where
	// it was, when the original <a> had text (ahref.ts copies it into the
	// iframe). RECOVER_HREFS_ON_CANCEL extends that to links without text,
	// with the URL as the text. Always on; a page's own 'cancel' listener
	// runs in addition to it.
	iframely.on(
		'cancel',
		(url: string, parentNode: Node | null, text: string | null, nextSibling: Node | null) => {
			if (iframely.RECOVER_HREFS_ON_CANCEL && !text) {
				text = url;
			}

			if (url && parentNode && text && text !== '') {
				const a = document.createElement('a');
				a.setAttribute('href', url);
				a.setAttribute('target', '_blank');
				a.setAttribute('rel', 'noopener');
				a.textContent = text;
				if (nextSibling) {
					parentNode.insertBefore(a, nextSibling);
				} else {
					parentNode.appendChild(a);
				}
			}
		}
	);
}
