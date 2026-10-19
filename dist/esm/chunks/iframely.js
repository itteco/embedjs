//#region src/constants.ts
function createConstants() {
	const DOMAINS = [
		"cdn.iframe.ly",
		"iframe.ly",
		"if-cdn.com",
		"iframely.net"
	];
	return {
		VERSION: 1,
		ASPECT_WRAPPER_CLASS: "iframely-responsive",
		MAXWIDTH_WRAPPER_CLASS: "iframely-embed",
		LOADER_CLASS: "iframely-loader",
		DOMAINS,
		CDN: DOMAINS[0],
		BASE_RE: /^(?:https?:)?\/\/[^/]+/i,
		ID_RE: /^(?:https?:)?\/\/[^/]+\/(\w+-?\w+)(?:\?.*)?$/,
		SCRIPT_RE: /^(?:https?:|file:\/)?\/\/[^/]+(?:.+)?\/(?:embed|iframely)\.js(?:[^/]+)?$/i,
		CDN_RE: /^(?:https?:)?\/\/([^/]+)\/(?:embed|iframely)\.js(?:[^/]+)?$/i,
		SUPPORTED_QUERY_STRING: [
			"api_key",
			"key",
			"iframe",
			"html5",
			"playerjs",
			"align",
			"language",
			"media",
			"maxwidth",
			"maxheight",
			"lazy",
			"import",
			"parent",
			"shadow",
			"click_to_play",
			"autoplay",
			"mute",
			"card",
			"consent",
			"theme",
			/^_.+/
		],
		SUPPORTED_THEMES: [
			"auto",
			"light",
			"dark"
		],
		LAZY_IFRAME_SHOW_TIMEOUT: 3e3,
		LAZY_IFRAME_FADE_TIMEOUT: 200,
		CLEAR_WRAPPER_STYLES_TIMEOUT: 3e3,
		RECOVER_HREFS_ON_CANCEL: false,
		SHADOW: "iframely-shadow",
		SUPPORT_IFRAME_LOADING_ATTR: typeof HTMLIFrameElement !== "undefined" && "loading" in HTMLIFrameElement.prototype
	};
}
//#endregion
//#region src/iframely.ts
function createServerStub() {
	const noop = () => {};
	return {
		...createConstants(),
		config: {},
		on: noop,
		trigger: noop,
		triggerAsync: noop,
		load: noop,
		unload: noop,
		configure: noop,
		extendOptions: noop,
		setTheme: noop,
		cancelWidget: noop,
		openHref: noop,
		addEventListener: noop,
		isTouch: () => false,
		findIframe: () => void 0,
		getElementComputedStyle: () => void 0,
		buildOptionsForm: noop,
		widgets: { load: noop },
		events: {
			on: noop,
			trigger: noop
		}
	};
}
var iframely = typeof window === "undefined" ? createServerStub() : window.iframely = window.iframely || {};
iframely.config = iframely.config || {};
//#endregion
export { createConstants as n, iframely as t };
