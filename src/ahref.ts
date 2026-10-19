import iframely from './iframely.js';
import * as utils from './utils.js';

export function boot(): void {
	iframely.on('load', (container?: Element, href?: string) => {
		if (container && container.nodeName && typeof href === 'string') {
			const a = document.createElement('a');
			a.setAttribute('href', href);
			container.appendChild(a);
			iframely.trigger('load', a);
		}
	});

	iframely.on('load', (el?: Element) => {
		if (!el && !iframely.import) {
			const elements = document.querySelectorAll(
				'a[data-iframely-url]:not([data-import-uri])'
			);
			for (let i = 0; i < elements.length; i++) {
				iframely.trigger('load', elements[i]);
			}
		}
	});

	iframely.on('load', (el?: Element) => {
		if (
			el &&
			el.nodeName === 'A' &&
			(el.getAttribute('data-iframely-url') || el.getAttribute('href')) &&
			!el.hasAttribute('data-import-uri')
		) {
			unfurl(el as HTMLAnchorElement);
		}
	});
}

function unfurl(el: HTMLAnchorElement): void {
	if (!el.getAttribute('data-iframely-url') && !el.getAttribute('href')) {
		return; // isn't valid
	}
	let src;

	const dataIframelyUrl = el.getAttribute('data-iframely-url');
	if (dataIframelyUrl && /^((?:https?:)?\/\/[^/]+)\/\w+/i.test(dataIframelyUrl)) {
		src = utils.getEndpoint(dataIframelyUrl, {
			v: iframely.VERSION,
			app: 1,
			theme: iframely.config.theme
		});
	} else if ((iframely.config.api_key || iframely.config.key) && iframely.CDN) {
		if (!el.getAttribute('href')) {
			console.warn('Iframely cannot build embeds: "href" attribute missing in', el);
			return;
		}

		src = utils.getEndpoint(
			'/api/iframe',
			{
				url: el.getAttribute('href'),
				v: iframely.VERSION,
				app: 1,
				theme: iframely.config.theme
			},
			iframely.SUPPORTED_QUERY_STRING
		);
	} else {
		console.warn(
			'Iframely cannot build embeds: api key is required as query-string of embed.js'
		);
	}

	if (!src) {
		el.removeAttribute('data-iframely-url');
	} else {
		const iframe = document.createElement('iframe');

		iframe.setAttribute('allowfullscreen', '');
		iframe.setAttribute('allow', 'autoplay *; encrypted-media *; ch-prefers-color-scheme *');

		if (el.hasAttribute('data-img')) {
			iframe.setAttribute('data-img', el.getAttribute('data-img')!);
		}

		const isLazy =
			el.hasAttribute('data-lazy') ||
			el.hasAttribute('data-img') ||
			/&lazy=1/.test(src) ||
			iframely.config.lazy;

		// support restoring failed links by its text
		const text = el.textContent;

		if (text && text !== '') {
			iframe.textContent = text;
		}

		let wrapper = utils.getIframeWrapper(el, true);

		if (wrapper) {
			// Delete all in aspect wrapper.
			while (wrapper.aspectWrapper.lastChild) {
				wrapper.aspectWrapper.removeChild(wrapper.aspectWrapper.lastChild);
			}
		} else {
			wrapper = utils.addDefaultWrappers(el);

			el.parentNode!.removeChild(el);
		}

		wrapper.aspectWrapper.appendChild(iframe);

		if (isLazy) {
			// send to lazy iframe flow
			iframe.setAttribute('data-iframely-url', src);
			iframely.trigger('load', iframe);
		} else {
			iframe.setAttribute('src', src);
			iframely.trigger('iframe-ready', iframe);
		}
	}
}
