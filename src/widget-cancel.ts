import iframely from './iframely';
import { findParentByClass } from './utils';
import type { IframelyWidget } from './types';

export function boot(): void {
	iframely.on('message', (widget, message) => {
		if (message.method === 'cancelWidget') {
			iframely.cancelWidget(widget);
		}
	});

	iframely.cancelWidget = (widget?: IframelyWidget) => {
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
		// Re-creating a link if people had it as <a>text</a> is now deprecated (see in deprecated.js)
		// New use: iframely.on('cancel', function(url, parentNode, text) {...} );

		parentNode!.removeChild(naNode);
	};
}
