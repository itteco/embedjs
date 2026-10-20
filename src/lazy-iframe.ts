import iframely from './iframely.js';
import * as utils from './utils.js';

export function boot(): void {
	// Need 'load' handler here instead of on('init') - we load lazy iframes only when DOM ready.
	iframely.on('load', (el?: Element) => {
		if (!el) {
			// initial load

			const elements = document.querySelectorAll('iframe[data-iframely-url]');
			for (let i = 0; i < elements.length; i++) {
				iframely.trigger('load', elements[i]);
			}
		}
	});

	iframely.on('load', (el?: Element) => {
		if (
			el &&
			el.nodeName === 'IFRAME' &&
			el.hasAttribute('data-iframely-url') &&
			!el.hasAttribute('data-img') &&
			!el.getAttribute('src')
		) {
			loadLazyIframe(el as HTMLIFrameElement);
		}
	});
}

function loadLazyIframe(el: HTMLIFrameElement): void {
	const widget = utils.getWidget(el);
	let src = el.getAttribute('data-iframely-url');
	const dataImg = el.hasAttribute('data-img-created') || el.hasAttribute('data-img');
	const nativeLazyLoad = !dataImg && iframely.SUPPORT_IFRAME_LOADING_ATTR;

	if (widget && src) {
		const options: Record<string, any> = {
			v: iframely.VERSION,
			app: 1, // for example, will fall back to summary card if media is not longer available
			theme: iframely.config.theme
		};

		if (!nativeLazyLoad && iframely.config.intersection) {
			options.lazy = 1;
		}

		src = utils.getEndpoint(src, options);
	}

	if (nativeLazyLoad) {
		el.setAttribute('loading', 'lazy');
	}

	if (dataImg && iframely.SUPPORT_IFRAME_LOADING_ATTR) {
		// Disable lazy load with `data-img`.
		el.setAttribute('loading', 'edge');
	}

	el.setAttribute('src', src || '');
	el.removeAttribute('data-iframely-url');

	iframely.trigger('iframe-ready', el);
}
