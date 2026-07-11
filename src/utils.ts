import iframely from './iframely';
// Circular with messaging.ts — safe: postMessage is only used inside
// functions called after both modules have evaluated. Keep the namespace
// import and keep cross-module use deferred (never at top level).
import * as messaging from './messaging';
import type { IframelyWidget } from './types';

export function boot(): void {
	iframely.on('init', () => {
		iframely.extendOptions(parseQueryStringFromScriptSrc());
		// if it's hosted from elsewhere - we don't support customizing via query-string.
		// iframely.CDN will be default one unless changed by user (?cdn= or iframely.CDN= )

		defineDefaultStyles();

		// Set theme for existing iframes.
		if (iframely.config.theme) {
			iframely.setTheme(iframely.config.theme);
		}

		requestSizeOfExistingIframes(
			iframely.DOMAINS.concat(iframely.CDN.replace(/^https?:\/\//, ''))
		);
	});

	iframely.load = function (...args: any[]) {
		iframely.trigger('load', ...args);
	};

	iframely.getElementComputedStyle = (el, style) => {
		return window.getComputedStyle(el).getPropertyValue(style);
	};

	// helper method to init more options through js code
	iframely.extendOptions = (options) => {
		if (!options) {
			return;
		}

		Object.keys(options).forEach((key) => {
			const new_value =
				options[key] === 0 ||
				options[key] === '0' ||
				options[key] === false ||
				options[key] === 'false'
					? false
					: options[key] === 1 ||
						  options[key] === '1' ||
						  options[key] === true ||
						  options[key] === 'true'
						? true
						: options[key];

			if (iframely.config[key] !== false) {
				// set new value only when undefined or not previously disabled
				iframely.config[key] = new_value;
			}
		});
	};
}

export function getIframeWrapper(
	iframe: Element,
	checkClass?: boolean
): { aspectWrapper: HTMLElement; maxWidthWrapper: HTMLElement } | undefined {
	const aspectWrapper = iframe.parentNode as HTMLElement | null;

	if (
		!aspectWrapper ||
		aspectWrapper.nodeName !== 'DIV' ||
		nonTextChildCount(aspectWrapper) > 2 /* 2 is lazy-cover */ ||
		(checkClass && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS) ||
		(!checkClass &&
			aspectWrapper.style.position !== 'relative' &&
			aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS)
	) {
		return;
	}

	const maxWidthWrapper = aspectWrapper.parentNode as HTMLElement | null;

	if (
		!maxWidthWrapper ||
		maxWidthWrapper.nodeName !== 'DIV' ||
		nonTextChildCount(maxWidthWrapper) > 1 ||
		(checkClass &&
			maxWidthWrapper.getAttribute('class') &&
			maxWidthWrapper
				.getAttribute('class')!
				.split(' ')
				.indexOf(iframely.MAXWIDTH_WRAPPER_CLASS) === -1) ||
		(!checkClass &&
			maxWidthWrapper.getAttribute('class') &&
			!maxWidthWrapper.getAttribute('class')!.match(/iframely/i)) /* users can modify class */
	) {
		return;
	}

	return {
		aspectWrapper: aspectWrapper,
		maxWidthWrapper: maxWidthWrapper
	};
}

export function addDefaultWrappers(el: Element): {
	aspectWrapper: HTMLElement;
	maxWidthWrapper: HTMLElement;
} {
	const parentNode = el.parentNode!;

	const maxWidthWrapper = document.createElement('div');
	maxWidthWrapper.className = iframely.MAXWIDTH_WRAPPER_CLASS;

	const aspectWrapper = document.createElement('div');
	aspectWrapper.className = iframely.ASPECT_WRAPPER_CLASS;

	maxWidthWrapper.appendChild(aspectWrapper);

	parentNode.insertBefore(maxWidthWrapper, el);

	return {
		aspectWrapper: aspectWrapper,
		maxWidthWrapper: maxWidthWrapper
	};
}

export function getWidget(iframe: Element): IframelyWidget | undefined {
	const wrapper = getIframeWrapper(iframe);
	if (!wrapper) {
		return;
	}
	const widget: IframelyWidget = {
		iframe: iframe, // can actually be ahref
		aspectWrapper: wrapper.aspectWrapper,
		maxWidthWrapper: wrapper.maxWidthWrapper
	};
	const src = iframe.getAttribute('src');
	if (iframe.nodeName === 'A' && iframe.hasAttribute('href')) {
		widget.url = iframe.getAttribute('href')!;
	} else if (src && /url=/.test(src)) {
		const qs = parseQueryString(src);
		if (qs.url) {
			widget.url = qs.url;
		}
	}
	return widget;
}

export function setStyles(
	el: HTMLElement | undefined | null,
	styles: Record<string, string | number | undefined>
): void {
	if (el) {
		// let's check it's still defined, just in case
		Object.keys(styles).forEach((key) => {
			let value: any = styles[key];
			if (
				typeof value === 'number' ||
				(typeof value === 'string' && /^(\d+)?\.?(\d+)$/.test(value))
			) {
				value = value + 'px';
			}

			const elStyle = el.style as any;
			const currentValue = elStyle[key];

			// don't change CSS values in pixels, such as height:0
			if (
				iframely.getElementComputedStyle(el, key) != value &&
				// && don't set default aspect ratio if it's defined in CSS anyway
				!(
					el.className == 'iframely-responsive' &&
					key === 'paddingBottom' &&
					!currentValue &&
					/^56\.2\d+%$/.test(value)
				) &&
				// && do not change max-width if new value === 'keep'.
				!(key === 'max-width' && value === 'keep')
			) {
				elStyle[key] = value || ''; // remove style that is no longer needed
			}
		});
	}
}

export function applyNonce(element: HTMLElement): void {
	if (iframely.config.nonce) {
		element.nonce = iframely.config.nonce;
	}
}

function defineDefaultStyles(): void {
	const iframelyStylesId = 'iframely-styles';
	let styles = document.getElementById(iframelyStylesId);

	if (!styles) {
		// copy-paste default styles from https://iframely.com/docs/omit-css
		// box-sizing:border-box - need for iOS Safari .
		const iframelyStyles =
			'.iframely-responsive{top:0;left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;box-sizing:border-box;}.iframely-responsive>*{top:0;left:0;width:100%;height:100%;position:absolute;border:0;box-sizing:border-box;}';

		styles = document.createElement('style');
		styles.id = iframelyStylesId;
		applyNonce(styles);
		styles.innerHTML = iframelyStyles;
		document.getElementsByTagName('head')[0].appendChild(styles);
	}
}

export function addQueryString(href: string, options: Record<string, any>): string {
	let query_string = '';

	Object.keys(options).forEach((key) => {
		let value = options[key];

		// array is used e.g. for import: uris and ids
		if (Array.isArray(value)) {
			const values = value.map((uri) => key + '=' + encodeURIComponent(uri));
			query_string += '&' + values.join('&');
		} else if (typeof value !== 'undefined' && href.indexOf(key + '=') === -1) {
			// set explicitely in options, skip undefines

			// Do not convert boolean for _option.
			if (typeof value === 'boolean' && key.charAt(0) !== '_') {
				value = value ? 1 : 0;
			}

			query_string += '&' + key + '=' + encodeURIComponent(value);
		}
	});

	return (
		href +
		(query_string !== ''
			? (href.indexOf('?') > -1 ? '&' : '?') + query_string.replace(/^&/, '')
			: '')
	);
}

export function getEndpoint(
	src: string,
	options?: Record<string, any>,
	config_params?: (string | RegExp)[]
): string {
	let endpoint = src;

	if (!/^(https?:)?\/\//i.test(src)) {
		endpoint = ((options && options.CDN) || iframely.CDN) + endpoint;
		if (options) {
			delete options.CDN;
		}
	}

	if (!/^(?:https?:)?\/\//i.test(endpoint)) {
		endpoint = '//' + endpoint;
	}

	if (options) {
		endpoint = addQueryString(endpoint, options);
	}

	// get additional params from config
	if (config_params && config_params.length) {
		const more_options: Record<string, any> = {};

		const iframely_config_keys = Object.keys(iframely.config);
		for (let i = 0; i < iframely_config_keys.length; i++) {
			const key = iframely_config_keys[i];
			if (containsString(config_params, key)) {
				more_options[key] = iframely.config[key];
			}
		}

		endpoint = addQueryString(endpoint, more_options);
	}

	if (
		/^(https?:)?\/\//i.test(endpoint) && // Path is url.
		!endpoint.match(/^(https?:)?\/\//i)![1] && // No http protocol specified.
		document.location.protocol !== 'http:' && // Document in `file:` or other protocol.
		document.location.protocol !== 'https:'
	) {
		endpoint = 'https:' + endpoint;
	}

	return endpoint;
}

function parseQueryStringFromScriptSrc(): Record<string, string> {
	// Extract global iframely params.
	const scripts = document.querySelectorAll(
		'script[src*="embed.js"], script[src*="iframely.js"]'
	);

	for (let i = 0; i < scripts.length; i++) {
		const src = scripts[i].getAttribute('src')!.replace(/&amp;/gi, '&');

		if (iframely.SCRIPT_RE.test(src)) {
			// found the script on custom origin or default Iframely CDN

			const options = parseQueryString(
				src,
				iframely.SUPPORTED_QUERY_STRING.concat('cdn', 'cancel', 'nonce')
			);

			const m2 = src.match(iframely.CDN_RE);
			if (m2 || options.cdn) {
				// ignore non-Iframely hosts such as s.imgur.com/min/embed.js
				iframely.CDN = options.cdn || m2![1];
			}

			if (options.cancel) {
				if (options.cancel === '0' || options.cancel === 'false') {
					iframely.RECOVER_HREFS_ON_CANCEL = true;
				}
				delete options.cancel;
			}

			if (Object.keys(options).length > 0) {
				// give preferrence to CDN from scripts that have query-string.
				// CDN is most critical for embeds with empty data-iframely-url
				// and those should have at least ?api_key... in script src

				return options;
			} // or keep searching
		}
	}
	// should have exited by now if any querystring found...
	return {};
}

function requestSizeOfExistingIframes(domains?: string[]): void {
	const iframes = document.querySelectorAll<HTMLIFrameElement>(
		'iframe[src*="' + (domains || iframely.DOMAINS).join('"], iframe[src*="') + '"]'
	);
	for (let i = 0; i < iframes.length; i++) {
		const iframe = iframes[i];
		const src = iframe.src;
		if (
			src.match(/^(https?:)?\/\/[^/]+\/api\/iframe\?.+/) ||
			src.match(/^(https?:)?\/\/[^/]+\/\w+(\?.*)?$/)
		) {
			messaging.postMessage(
				{
					method: 'getSize'
				},
				'*',
				iframe.contentWindow
			);
		}
	}
}

function nonTextChildCount(element: Element): number {
	let count = 0;
	for (let i = 0; i < element.childNodes.length; i++) {
		const el = element.childNodes[i];
		if (el.nodeType === Node.TEXT_NODE) {
			const text = (el.textContent || '').replace(/\s|\n/g, '');
			if (text) {
				// Do not skip text node with text.
				count++;
			}
		} else if (el.nodeType === Node.ELEMENT_NODE) {
			count++;
		}
	}
	return count;
}

function containsString(list: (string | RegExp)[], findValue: string): boolean {
	let value,
		i = 0;
	while (i < list.length) {
		value = list[i];

		if (value == findValue) {
			return true;
		}

		if (value instanceof RegExp && value.test(findValue)) {
			return true;
		}

		i++;
	}
	return false;
}

export function parseQueryString(
	url: string,
	allowed_query_string?: (string | RegExp)[]
): Record<string, string> {
	const query = url.match(/\?(.+)/i);
	if (query) {
		const data = query[1].split('&');
		const result: Record<string, string> = {};
		for (let i = 0; i < data.length; i++) {
			const item = data[i].split('=');
			if (!allowed_query_string || containsString(allowed_query_string, item[0])) {
				result[item[0]] = decodeURIComponent(item[1]);
			}
		}
		return result;
	} else {
		return {};
	}
}

export function createScript(): HTMLScriptElement {
	const script = document.createElement('script');
	applyNonce(script);
	return script;
}
