import iframely from './iframely.js';
// Circular with messaging.ts — safe: postMessage is only used inside
// functions called after both modules have evaluated. Keep the namespace
// import and keep cross-module use deferred (never at top level).
import * as messaging from './messaging.js';
import type { IframelyWidget } from './types.js';

const ABSOLUTE_URL_RE = /^(?:https?:)?\/\//i;

// Hosts whose iframes this library manages: the Iframely domains plus the
// configured CDN (which may carry a protocol when assigned directly).
export function knownDomains(): string[] {
	return iframely.DOMAINS.concat(normalizeCdn(iframely.CDN));
}

// 'https://my.cdn.example/' -> 'my.cdn.example'. getEndpoint() adds the
// protocol-relative '//' itself, and iframes are matched by host.
function normalizeCdn(cdn: string): string {
	return cdn
		.trim()
		.replace(/^(?:https?:)?\/\//i, '')
		.replace(/\/+$/, '');
}

// `cdn` is not a config value but the host of the iframes (iframely.CDN):
// endpoints are built on it and iframes are recognised by it. Empty and
// disabled values are ignored. Returns whether the value was applied.
function setCdn(value: unknown): boolean {
	const cdn = typeof value === 'string' ? normalizeCdn(value) : '';
	if (cdn && cdn !== '0' && cdn !== 'false') {
		iframely.CDN = cdn;
		return true;
	}
	return false;
}

// An element node, also from another realm (an iframe's document), where
// `instanceof Element` would fail. 'load' targets may be fragments too.
export function isElement(node: unknown): node is Element {
	return !!node && (node as Node).nodeType === Node.ELEMENT_NODE;
}

// The subtree a 'load' scans for markup to build: the document for load(),
// the node itself for load(container) — any element other than an <a> or an
// <iframe>, or a document fragment / shadow root. Undefined when the load
// targets one widget: an <a>, an <iframe>, (container, url), or an import
// widget object.
export function loadRoot(el?: unknown, href?: unknown): ParentNode | undefined {
	if (!el) {
		return document;
	}
	if (href !== undefined || typeof el !== 'object') {
		return undefined;
	}
	const node = el as Node;
	if (
		(node.nodeType === Node.ELEMENT_NODE &&
			node.nodeName !== 'A' &&
			node.nodeName !== 'IFRAME') ||
		node.nodeType === Node.DOCUMENT_NODE ||
		node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
	) {
		return node as unknown as ParentNode;
	}
	return undefined;
}

// Selector matching the iframes served from any of the domains.
function iframeSelector(domains: string[]): string {
	return domains.map((domain) => 'iframe[src*="' + domain + '"]').join(', ');
}

export function boot(): void {
	iframely.on('init', () => {
		// A pre-set `window.iframely = { config: { cdn } }` applies like
		// configure({ cdn }); a script src ?cdn= below still wins, but the
		// host the script is served from (the fallback CDN) does not.
		let cdnConfigured = false;
		if (iframely.config.cdn !== undefined) {
			cdnConfigured = setCdn(iframely.config.cdn);
			delete iframely.config.cdn;
		}
		iframely.configure(parseQueryStringFromScriptSrc(cdnConfigured));
		// if it's hosted from elsewhere - we don't support customizing via query-string.
		// iframely.CDN will be default one unless changed by user (?cdn= or iframely.CDN= )

		defineDefaultStyles();

		// Set theme for existing iframes.
		if (iframely.config.theme) {
			iframely.setTheme(iframely.config.theme);
		}

		requestSizeOfExistingIframes(knownDomains());
	});

	iframely.load = (...args: any[]) => {
		iframely.trigger('load', ...args);
	};

	// load() and load(container) also ask the managed iframes already in
	// scope for their size, e.g. API HTML with a direct iframe src rendered
	// into a container.
	iframely.on('load', (el?: unknown, href?: unknown) => {
		const root = loadRoot(el, href);
		if (root) {
			requestSizeOfExistingIframes(knownDomains(), root);
		}
	});

	// Inverse of load(): removes the widgets this library built from the
	// document (or from a container). Import/shadow widgets are not covered,
	// and consumed <a data-iframely-url> anchors are not restored —
	// re-rendering the original markup is the host page's job.
	iframely.unload = (el?: Element) => {
		const root = el || document;
		const selector = iframeSelector(knownDomains()) + ', iframe[data-iframely-url]';
		root.querySelectorAll<HTMLIFrameElement>(selector).forEach((iframe) => {
			const widget = getWidget(iframe);
			if (widget) {
				// Lets modules release per-widget state (observers, timeouts).
				iframely.trigger('unload-widget', widget);
				// Like cancelWidget: a configured `parent` wrapper goes with the
				// widget. unload(container) only takes one inside the container:
				// the container itself and what is above it belong to the caller.
				const customParent =
					iframely.config.parent &&
					findParentByClass(widget.maxWidthWrapper, String(iframely.config.parent));
				const removable =
					customParent && (!el || (customParent !== el && el.contains(customParent)));
				(removable ? customParent : widget.maxWidthWrapper).remove();
			}
		});
		iframely.trigger('unload', el);
	};

	iframely.getElementComputedStyle = (el, style) =>
		window.getComputedStyle(el).getPropertyValue(style);

	// helper method to init more config options through js code
	iframely.configure = (options) => {
		if (!options) {
			return;
		}

		Object.keys(options).forEach((key) => {
			// Script src query strings and code both end up here; values are scalars.
			const value: any = options[key];
			if (key === 'cdn') {
				setCdn(value);
				return;
			}
			const normalized = [0, '0', false, 'false'].includes(value)
				? false
				: [1, '1', true, 'true'].includes(value)
					? true
					: value;

			// Set the new value only when undefined or not previously disabled.
			if (iframely.config[key] !== false) {
				iframely.config[key] = normalized;
			}
		});
	};
}

export function getIframeWrapper(
	iframe: Element,
	checkClass?: boolean
): { aspectWrapper: HTMLElement; maxWidthWrapper: HTMLElement } | undefined {
	const aspectWrapper = iframe.parentElement;

	if (
		!aspectWrapper ||
		aspectWrapper.nodeName !== 'DIV' ||
		nonTextChildCount(aspectWrapper) > 2 /* 2 is lazy-cover */ ||
		(checkClass && aspectWrapper.className !== iframely.ASPECT_WRAPPER_CLASS) ||
		(!checkClass &&
			aspectWrapper.style.position !== 'relative' &&
			aspectWrapper.className !== iframely.ASPECT_WRAPPER_CLASS)
	) {
		return;
	}

	const maxWidthWrapper = aspectWrapper.parentElement;

	if (
		!maxWidthWrapper ||
		maxWidthWrapper.nodeName !== 'DIV' ||
		nonTextChildCount(maxWidthWrapper) > 1 ||
		(checkClass &&
			maxWidthWrapper.className &&
			!maxWidthWrapper.classList.contains(iframely.MAXWIDTH_WRAPPER_CLASS)) ||
		(!checkClass &&
			maxWidthWrapper.className &&
			!/iframely/i.test(maxWidthWrapper.className)) /* users can modify class */
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
	const maxWidthWrapper = document.createElement('div');
	maxWidthWrapper.className = iframely.MAXWIDTH_WRAPPER_CLASS;

	const aspectWrapper = document.createElement('div');
	aspectWrapper.className = iframely.ASPECT_WRAPPER_CLASS;

	maxWidthWrapper.appendChild(aspectWrapper);
	el.parentNode!.insertBefore(maxWidthWrapper, el);

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
	if (!el) {
		// let's check it's still defined, just in case
		return;
	}
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

export function applyNonce(element: HTMLElement): void {
	if (iframely.config.nonce) {
		element.nonce = iframely.config.nonce;
	}
}

function defineDefaultStyles(): void {
	const iframelyStylesId = 'iframely-styles';

	if (!document.getElementById(iframelyStylesId)) {
		// copy-paste default styles from https://iframely.com/docs/omit-css
		// box-sizing:border-box - need for iOS Safari .
		const styles = document.createElement('style');
		styles.id = iframelyStylesId;
		applyNonce(styles);
		styles.textContent =
			'.iframely-responsive{top:0;left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;box-sizing:border-box;}.iframely-responsive>*{top:0;left:0;width:100%;height:100%;position:absolute;border:0;box-sizing:border-box;}';
		document.head.appendChild(styles);
	}
}

export function addQueryString(href: string, options: Record<string, any>): string {
	const params: string[] = [];

	Object.keys(options).forEach((key) => {
		let value = options[key];

		// array is used e.g. for import: uris and ids
		if (Array.isArray(value)) {
			value.forEach((item) => params.push(key + '=' + encodeURIComponent(item)));
		} else if (typeof value !== 'undefined' && href.indexOf(key + '=') === -1) {
			// set explicitly in options, skip undefines

			// Do not convert boolean for _option.
			if (typeof value === 'boolean' && key.charAt(0) !== '_') {
				value = value ? 1 : 0;
			}

			params.push(key + '=' + encodeURIComponent(value));
		}
	});

	return params.length ? href + (href.indexOf('?') > -1 ? '&' : '?') + params.join('&') : href;
}

export function getEndpoint(
	src: string,
	options?: Record<string, any>,
	config_params?: (string | RegExp)[]
): string {
	let endpoint = src;

	if (!ABSOLUTE_URL_RE.test(src)) {
		endpoint = ((options && options.CDN) || iframely.CDN) + endpoint;
		if (options) {
			delete options.CDN;
		}
	}

	if (!ABSOLUTE_URL_RE.test(endpoint)) {
		endpoint = '//' + endpoint;
	}

	if (options) {
		endpoint = addQueryString(endpoint, options);
	}

	// get additional params from config
	if (config_params && config_params.length) {
		const more_options: Record<string, any> = {};
		Object.keys(iframely.config).forEach((key) => {
			if (containsString(config_params, key)) {
				more_options[key] = iframely.config[key];
			}
		});
		endpoint = addQueryString(endpoint, more_options);
	}

	// A protocol-relative url on a page that is not http(s) (file:, etc.)
	// would resolve against that protocol; pin it to https.
	if (endpoint.startsWith('//') && !/^https?:$/.test(document.location.protocol)) {
		endpoint = 'https:' + endpoint;
	}

	return endpoint;
}

// `cdnConfigured`: the page configured a CDN explicitly, so the host a script
// is served from must not replace it.
function parseQueryStringFromScriptSrc(cdnConfigured: boolean): Record<string, string> {
	// Extract global iframely params.
	const scripts = document.querySelectorAll(
		'script[src*="embed.js"], script[src*="iframely.js"]'
	);

	for (const script of scripts) {
		const src = script.getAttribute('src')!.replace(/&amp;/gi, '&');

		if (iframely.SCRIPT_RE.test(src)) {
			// found the script on custom origin or default Iframely CDN

			const options = parseQueryString(
				src,
				iframely.SUPPORTED_QUERY_STRING.concat('cdn', 'cancel', 'nonce')
			);

			// ?cdn= reaches iframely.CDN through configure() with the returned
			// options; otherwise the script's own host is the CDN.
			const m2 = src.match(iframely.CDN_RE);
			if (m2 && !options.cdn && !cdnConfigured) {
				// ignore non-Iframely hosts such as s.imgur.com/min/embed.js
				iframely.CDN = m2[1];
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

function requestSizeOfExistingIframes(domains: string[], root: ParentNode = document): void {
	root.querySelectorAll<HTMLIFrameElement>(iframeSelector(domains)).forEach((iframe) => {
		const src = iframe.src;
		if (
			/^(https?:)?\/\/[^/]+\/api\/iframe\?.+/.test(src) ||
			/^(https?:)?\/\/[^/]+\/\w+(\?.*)?$/.test(src)
		) {
			messaging.postMessage({ method: 'getSize' }, '*', iframe.contentWindow);
		}
	});
}

// Nearest ancestor carrying the class name, or false. Used by cancelWidget
// and unload() to honor the `parent` config: a host wrapper around the
// library's own wrappers that should go away together with the widget.
export function findParentByClass(el: Element, className: string): Element | false {
	let parent = el.parentElement;
	while (parent && !parent.classList.contains(className)) {
		parent = parent.parentElement;
	}
	return parent || false;
}

// Child elements plus text nodes that are not only whitespace.
export function nonTextChildCount(element: Element): number {
	let count = 0;
	element.childNodes.forEach((node) => {
		if (
			node.nodeType === Node.ELEMENT_NODE ||
			(node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim())
		) {
			count++;
		}
	});
	return count;
}

function containsString(list: (string | RegExp)[], findValue: string): boolean {
	return list.some(
		(value) => value === findValue || (value instanceof RegExp && value.test(findValue))
	);
}

export function parseQueryString(
	url: string,
	allowed_query_string?: (string | RegExp)[]
): Record<string, string> {
	const result: Record<string, string> = {};
	const query = url.slice(url.indexOf('?') + 1);
	if (query === url || !query) {
		// No '?' at all, or nothing after it.
		return result;
	}
	query.split('&').forEach((pair) => {
		// Split at the first '=' only: a value may contain more. A key without
		// '=' gets ''. '+' stays literal (not form encoding): raw urls carry it.
		const eq = pair.indexOf('=');
		const key = eq === -1 ? pair : pair.slice(0, eq);
		const value = eq === -1 ? '' : pair.slice(eq + 1);
		if (!allowed_query_string || containsString(allowed_query_string, key)) {
			result[key] = safeDecode(value);
		}
	});
	return result;
}

// decodeURIComponent throws on a stray '%'; keep such a value as written.
function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function createScript(): HTMLScriptElement {
	const script = document.createElement('script');
	applyNonce(script);
	return script;
}
