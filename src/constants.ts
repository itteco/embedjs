import type { Iframely } from './types';

export type IframelyConstants = Pick<
	Iframely,
	| 'VERSION'
	| 'ASPECT_WRAPPER_CLASS'
	| 'MAXWIDTH_WRAPPER_CLASS'
	| 'LOADER_CLASS'
	| 'DOMAINS'
	| 'CDN'
	| 'BASE_RE'
	| 'ID_RE'
	| 'SCRIPT_RE'
	| 'CDN_RE'
	| 'SUPPORTED_QUERY_STRING'
	| 'SUPPORTED_THEMES'
	| 'LAZY_IFRAME_SHOW_TIMEOUT'
	| 'LAZY_IFRAME_FADE_TIMEOUT'
	| 'CLEAR_WRAPPER_STYLES_TIMEOUT'
	| 'RECOVER_HREFS_ON_CANCEL'
	| 'SHADOW'
	| 'SUPPORT_IFRAME_LOADING_ATTR'
>;

// The public constants that const.ts installs on the singleton in the
// browser and that the server stub exposes so isomorphic code can read them
// during SSR. A factory rather than a shared object: every caller gets fresh
// arrays and regexes, so the server stub (one module instance shared across
// requests) never aliases state a page could mutate.
export function createConstants(): IframelyConstants {
	const DOMAINS = ['cdn.iframe.ly', 'iframe.ly', 'if-cdn.com', 'iframely.net'];

	return {
		VERSION: 1,

		ASPECT_WRAPPER_CLASS: 'iframely-responsive',
		MAXWIDTH_WRAPPER_CLASS: 'iframely-embed',
		LOADER_CLASS: 'iframely-loader',

		DOMAINS,
		CDN: DOMAINS[0], // default domain, user or script src can change CDN

		BASE_RE: /^(?:https?:)?\/\/[^/]+/i,
		ID_RE: /^(?:https?:)?\/\/[^/]+\/(\w+-?\w+)(?:\?.*)?$/,
		SCRIPT_RE: /^(?:https?:|file:\/)?\/\/[^/]+(?:.+)?\/(?:embed|iframely)\.js(?:[^/]+)?$/i,
		CDN_RE: /^(?:https?:)?\/\/([^/]+)\/(?:embed|iframely)\.js(?:[^/]+)?$/i,

		SUPPORTED_QUERY_STRING: [
			'api_key',
			'key',
			'iframe',
			'html5',
			'playerjs',
			'align',
			'language',
			'media',
			'maxwidth',
			'maxheight',
			'lazy',
			'import',
			'parent',
			'shadow',
			'click_to_play',
			'autoplay',
			'mute',
			'card',
			'consent',
			'theme',
			/^_.+/
		],

		SUPPORTED_THEMES: ['auto', 'light', 'dark'],

		LAZY_IFRAME_SHOW_TIMEOUT: 3000,
		LAZY_IFRAME_FADE_TIMEOUT: 200,
		CLEAR_WRAPPER_STYLES_TIMEOUT: 3000,

		RECOVER_HREFS_ON_CANCEL: false,

		SHADOW: 'iframely-shadow',

		// Feature-detect <iframe loading="lazy">. Browsers without it (Safari < 16.4,
		// Firefox < 121) fall back to the server-side lazy=1 mode; on the server
		// there is no DOM, hence false. Kept as a public flag because integrators
		// may override it.
		SUPPORT_IFRAME_LOADING_ATTR:
			typeof HTMLIFrameElement !== 'undefined' && 'loading' in HTMLIFrameElement.prototype
	};
}
