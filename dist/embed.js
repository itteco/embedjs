(function() {


//#region src/iframely.ts
	var iframely = window.iframely = window.iframely || {};
	iframely.config = iframely.config || {};

//#endregion
//#region src/dom-ready.ts
	var DOMReady = (f) => {
		if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(f, 0);
		document.addEventListener("DOMContentLoaded", f);
	};
	DOMReady(() => {
		if (typeof iframely.config.autorun === "undefined" || iframely.config.autorun !== false) iframely.trigger("load");
	});

//#endregion
//#region src/const.ts
	function boot$14() {
		iframely.VERSION = 1;
		iframely.ASPECT_WRAPPER_CLASS = "iframely-responsive";
		iframely.MAXWIDTH_WRAPPER_CLASS = "iframely-embed";
		iframely.LOADER_CLASS = "iframely-loader";
		iframely.DOMAINS = [
			"cdn.iframe.ly",
			"iframe.ly",
			"if-cdn.com",
			"iframely.net"
		];
		iframely.CDN = iframely.CDN || iframely.DOMAINS[0];
		iframely.BASE_RE = /^(?:https?:)?\/\/[^/]+/i;
		iframely.ID_RE = /^(?:https?:)?\/\/[^/]+\/(\w+-?\w+)(?:\?.*)?$/;
		iframely.SCRIPT_RE = /^(?:https?:|file:\/)?\/\/[^/]+(?:.+)?\/(?:embed|iframely)\.js(?:[^/]+)?$/i;
		iframely.CDN_RE = /^(?:https?:)?\/\/([^/]+)\/(?:embed|iframely)\.js(?:[^/]+)?$/i;
		iframely.SUPPORTED_QUERY_STRING = [
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
		];
		iframely.SUPPORTED_THEMES = [
			"auto",
			"light",
			"dark"
		];
		iframely.LAZY_IFRAME_SHOW_TIMEOUT = 3e3;
		iframely.LAZY_IFRAME_FADE_TIMEOUT = 200;
		iframely.CLEAR_WRAPPER_STYLES_TIMEOUT = 3e3;
		iframely.RECOVER_HREFS_ON_CANCEL = false;
		iframely.SHADOW = "iframely-shadow";
		iframely.SUPPORT_IFRAME_LOADING_ATTR = true;
	}

//#endregion
//#region src/events.ts
	var nextTick = (fn) => {
		window.requestAnimationFrame(fn);
	};
	var callbacksStack = {};
	function trigger(event, async, args) {
		(callbacksStack[event] || []).forEach((cb) => {
			if (async) nextTick(() => {
				cb.apply(iframely, args);
			});
			else cb.apply(iframely, args);
		});
		if (event === "init") callbacksStack[event] = [];
	}
	function boot$13() {
		iframely.on = (event, cb) => {
			(callbacksStack[event] = callbacksStack[event] || []).push(cb);
		};
		iframely.trigger = (event, ...args) => {
			trigger(event, false, args);
		};
		iframely.triggerAsync = (event, ...args) => {
			trigger(event, true, args);
		};
	}

//#endregion
//#region src/messaging.ts
	function receiveMessage(callback) {
		window.addEventListener("message", (e) => {
			let message;
			try {
				if (typeof e.data === "string") message = JSON.parse(e.data);
				else if (typeof e.data === "object") message = e.data;
			} catch {
				if (typeof e.data === "string") {
					const m = e.data.match(/heightxPYMx(\d+)/);
					if (m) message = {
						method: "resize",
						height: parseInt(m[1]) + 1,
						domains: "all"
					};
				}
			}
			callback(e, message);
		}, false);
	}
	function findIframeByContentWindow(iframes, contentWindow) {
		let foundIframe;
		for (let i = 0; i < iframes.length && !foundIframe; i++) {
			const iframe = iframes[i];
			if (iframe.contentWindow === contentWindow) foundIframe = iframe;
		}
		return foundIframe;
	}
	function findIframeInElement(element, options) {
		let foundIframe, iframes;
		if (options.src) {
			iframes = element.querySelectorAll("iframe[src*=\"" + options.src.replace(/^https?:/, "") + "\"]");
			foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
		}
		if (!foundIframe) {
			iframes = options.domains ? element.querySelectorAll("iframe[src*=\"" + (options.domains || iframely.DOMAINS).join("\"], iframe[src*=\"") + "\"]") : element.querySelectorAll("iframe");
			foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
		}
		return foundIframe;
	}
	function findIframeInShadowRoots(element, options) {
		let foundIframe;
		const className = "." + (iframely.config.shadow || iframely.SHADOW);
		const shadowRoots = element.querySelectorAll(className);
		for (let i = 0; i < shadowRoots.length && !foundIframe; i++) {
			const shadowRoot = shadowRoots[i].shadowRoot;
			if (shadowRoot) {
				foundIframe = findIframeInElement(shadowRoot, options);
				if (!foundIframe) foundIframe = findIframeInShadowRoots(shadowRoot, options);
			}
		}
		return foundIframe;
	}
	function boot$12() {
		if (!iframely.findIframe) iframely.findIframe = (options) => {
			let foundIframe = findIframeInElement(document, options);
			if (!foundIframe) foundIframe = findIframeInShadowRoots(document, options);
			return foundIframe;
		};
		receiveMessage((e, message) => {
			if (message && (message.method || message.type || message.context)) {
				const foundIframe = iframely.findIframe({
					contentWindow: e.source,
					src: message.src || message.context,
					domains: message.domains !== "all" && iframely.DOMAINS.concat(iframely.CDN)
				});
				if (foundIframe) {
					const widget = getWidget(foundIframe);
					if (widget && message.url) widget.url = message.url;
					iframely.trigger("message", widget, message);
				}
			}
		});
	}
	function postMessage(message, target_url, target) {
		if (typeof message === "object") message.context = document.location.href;
		const data = JSON.stringify(message);
		target_url = target_url || "*";
		target = target || window.parent;
		target.postMessage(data, target_url.replace(/([^:]+:\/\/[^/]+).*/, "$1"));
	}

//#endregion
//#region src/utils.ts
	function boot$11() {
		iframely.on("init", () => {
			iframely.extendOptions(parseQueryStringFromScriptSrc());
			defineDefaultStyles();
			if (iframely.config.theme) iframely.setTheme(iframely.config.theme);
			requestSizeOfExistingIframes(iframely.DOMAINS.concat(iframely.CDN.replace(/^https?:\/\//, "")));
		});
		iframely.load = function(...args) {
			iframely.trigger("load", ...args);
		};
		iframely.getElementComputedStyle = (el, style) => {
			return window.getComputedStyle(el).getPropertyValue(style);
		};
		iframely.extendOptions = (options) => {
			if (!options) return;
			Object.keys(options).forEach((key) => {
				const new_value = options[key] === 0 || options[key] === "0" || options[key] === false || options[key] === "false" ? false : options[key] === 1 || options[key] === "1" || options[key] === true || options[key] === "true" ? true : options[key];
				if (iframely.config[key] !== false) iframely.config[key] = new_value;
			});
		};
	}
	function getIframeWrapper(iframe, checkClass) {
		const aspectWrapper = iframe.parentNode;
		if (!aspectWrapper || aspectWrapper.nodeName !== "DIV" || nonTextChildCount$1(aspectWrapper) > 2 || checkClass && aspectWrapper.getAttribute("class") !== iframely.ASPECT_WRAPPER_CLASS || !checkClass && aspectWrapper.style.position !== "relative" && aspectWrapper.getAttribute("class") !== iframely.ASPECT_WRAPPER_CLASS) return;
		const maxWidthWrapper = aspectWrapper.parentNode;
		if (!maxWidthWrapper || maxWidthWrapper.nodeName !== "DIV" || nonTextChildCount$1(maxWidthWrapper) > 1 || checkClass && maxWidthWrapper.getAttribute("class") && maxWidthWrapper.getAttribute("class").split(" ").indexOf(iframely.MAXWIDTH_WRAPPER_CLASS) === -1 || !checkClass && maxWidthWrapper.getAttribute("class") && !maxWidthWrapper.getAttribute("class").match(/iframely/i)) return;
		return {
			aspectWrapper,
			maxWidthWrapper
		};
	}
	function addDefaultWrappers(el) {
		const parentNode = el.parentNode;
		const maxWidthWrapper = document.createElement("div");
		maxWidthWrapper.className = iframely.MAXWIDTH_WRAPPER_CLASS;
		const aspectWrapper = document.createElement("div");
		aspectWrapper.className = iframely.ASPECT_WRAPPER_CLASS;
		maxWidthWrapper.appendChild(aspectWrapper);
		parentNode.insertBefore(maxWidthWrapper, el);
		return {
			aspectWrapper,
			maxWidthWrapper
		};
	}
	function getWidget(iframe) {
		const wrapper = getIframeWrapper(iframe);
		if (!wrapper) return;
		const widget = {
			iframe,
			aspectWrapper: wrapper.aspectWrapper,
			maxWidthWrapper: wrapper.maxWidthWrapper
		};
		const src = iframe.getAttribute("src");
		if (iframe.nodeName === "A" && iframe.hasAttribute("href")) widget.url = iframe.getAttribute("href");
		else if (src && /url=/.test(src)) {
			const qs = parseQueryString(src);
			if (qs.url) widget.url = qs.url;
		}
		return widget;
	}
	function setStyles(el, styles) {
		if (el) Object.keys(styles).forEach((key) => {
			let value = styles[key];
			if (typeof value === "number" || typeof value === "string" && /^(\d+)?\.?(\d+)$/.test(value)) value = value + "px";
			const elStyle = el.style;
			const currentValue = elStyle[key];
			if (iframely.getElementComputedStyle(el, key) != value && !(el.className == "iframely-responsive" && key === "paddingBottom" && !currentValue && /^56\.2\d+%$/.test(value)) && !(key === "max-width" && value === "keep")) elStyle[key] = value || "";
		});
	}
	function applyNonce(element) {
		if (iframely.config.nonce) element.nonce = iframely.config.nonce;
	}
	function defineDefaultStyles() {
		const iframelyStylesId = "iframely-styles";
		let styles = document.getElementById(iframelyStylesId);
		if (!styles) {
			const iframelyStyles = ".iframely-responsive{top:0;left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;box-sizing:border-box;}.iframely-responsive>*{top:0;left:0;width:100%;height:100%;position:absolute;border:0;box-sizing:border-box;}";
			styles = document.createElement("style");
			styles.id = iframelyStylesId;
			applyNonce(styles);
			styles.innerHTML = iframelyStyles;
			document.getElementsByTagName("head")[0].appendChild(styles);
		}
	}
	function addQueryString(href, options) {
		let query_string = "";
		Object.keys(options).forEach((key) => {
			let value = options[key];
			if (Array.isArray(value)) {
				const values = value.map((uri) => key + "=" + encodeURIComponent(uri));
				query_string += "&" + values.join("&");
			} else if (typeof value !== "undefined" && href.indexOf(key + "=") === -1) {
				if (typeof value === "boolean" && key.charAt(0) !== "_") value = value ? 1 : 0;
				query_string += "&" + key + "=" + encodeURIComponent(value);
			}
		});
		return href + (query_string !== "" ? (href.indexOf("?") > -1 ? "&" : "?") + query_string.replace(/^&/, "") : "");
	}
	function getEndpoint(src, options, config_params) {
		let endpoint = src;
		if (!/^(https?:)?\/\//i.test(src)) {
			endpoint = (options && options.CDN || iframely.CDN) + endpoint;
			if (options) delete options.CDN;
		}
		if (!/^(?:https?:)?\/\//i.test(endpoint)) endpoint = "//" + endpoint;
		if (options) endpoint = addQueryString(endpoint, options);
		if (config_params && config_params.length) {
			const more_options = {};
			const iframely_config_keys = Object.keys(iframely.config);
			for (let i = 0; i < iframely_config_keys.length; i++) {
				const key = iframely_config_keys[i];
				if (containsString(config_params, key)) more_options[key] = iframely.config[key];
			}
			endpoint = addQueryString(endpoint, more_options);
		}
		if (/^(https?:)?\/\//i.test(endpoint) && !endpoint.match(/^(https?:)?\/\//i)[1] && document.location.protocol !== "http:" && document.location.protocol !== "https:") endpoint = "https:" + endpoint;
		return endpoint;
	}
	function parseQueryStringFromScriptSrc() {
		const scripts = document.querySelectorAll("script[src*=\"embed.js\"], script[src*=\"iframely.js\"]");
		for (let i = 0; i < scripts.length; i++) {
			const src = scripts[i].getAttribute("src").replace(/&amp;/gi, "&");
			if (iframely.SCRIPT_RE.test(src)) {
				const options = parseQueryString(src, iframely.SUPPORTED_QUERY_STRING.concat("cdn", "cancel", "nonce"));
				const m2 = src.match(iframely.CDN_RE);
				if (m2 || options.cdn) iframely.CDN = options.cdn || m2[1];
				if (options.cancel) {
					if (options.cancel === "0" || options.cancel === "false") iframely.RECOVER_HREFS_ON_CANCEL = true;
					delete options.cancel;
				}
				if (Object.keys(options).length > 0) return options;
			}
		}
		return {};
	}
	function requestSizeOfExistingIframes(domains) {
		const iframes = document.querySelectorAll("iframe[src*=\"" + (domains || iframely.DOMAINS).join("\"], iframe[src*=\"") + "\"]");
		for (let i = 0; i < iframes.length; i++) {
			const iframe = iframes[i];
			const src = iframe.src;
			if (src.match(/^(https?:)?\/\/[^/]+\/api\/iframe\?.+/) || src.match(/^(https?:)?\/\/[^/]+\/\w+(\?.*)?$/)) postMessage({ method: "getSize" }, "*", iframe.contentWindow);
		}
	}
	function nonTextChildCount$1(element) {
		let count = 0;
		for (let i = 0; i < element.childNodes.length; i++) {
			const el = element.childNodes[i];
			if (el.nodeType === Node.TEXT_NODE) {
				if ((el.textContent || "").replace(/\s|\n/g, "")) count++;
			} else if (el.nodeType === Node.ELEMENT_NODE) count++;
		}
		return count;
	}
	function containsString(list, findValue) {
		let value, i = 0;
		while (i < list.length) {
			value = list[i];
			if (value == findValue) return true;
			if (value instanceof RegExp && value.test(findValue)) return true;
			i++;
		}
		return false;
	}
	function parseQueryString(url, allowed_query_string) {
		const query = url.match(/\?(.+)/i);
		if (query) {
			const data = query[1].split("&");
			const result = {};
			for (let i = 0; i < data.length; i++) {
				const item = data[i].split("=");
				if (!allowed_query_string || containsString(allowed_query_string, item[0])) result[item[0]] = decodeURIComponent(item[1]);
			}
			return result;
		} else return {};
	}
	function createScript() {
		const script = document.createElement("script");
		applyNonce(script);
		return script;
	}

//#endregion
//#region src/intersection.ts
	var observers = {};
	function getObserver(options) {
		const optionsKey = JSON.stringify(options);
		let observer = observers[optionsKey];
		if (!observer) {
			observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					postMessage({
						method: "intersection",
						entry: { isIntersecting: entry.isIntersecting },
						options
					}, "*", entry.target.contentWindow);
				});
			}, getObserverOptions(options));
			observers[optionsKey] = observer;
		}
		return observer;
	}
	function getObserverOptions(options) {
		const result = {};
		if (options && options.threshold) result.threshold = options.threshold;
		if (options && options.margin) result.rootMargin = options.margin + "px " + options.margin + "px " + options.margin + "px " + options.margin + "px";
		return result;
	}
	function boot$10() {
		iframely.on("init", () => {
			iframely.extendOptions({ intersection: 1 });
		});
		iframely.on("message", (widget, message) => {
			if (message.method === "send-intersections" && widget.iframe) {
				let options = message.options;
				if (!options) options = { margin: 1e3 };
				getObserver(options).observe(widget.iframe);
			}
		});
	}

//#endregion
//#region src/theme.ts
	function setThemeInIframe(iframe, theme) {
		postMessage({
			method: "setTheme",
			data: theme
		}, "*", iframe.contentWindow);
	}
	function setThemeInAllIframes(parent, theme) {
		const iframes = parent.getElementsByTagName("iframe");
		for (let i = 0; i < iframes.length; i++) setThemeInIframe(iframes[i], theme);
	}
	function boot$9() {
		iframely.setTheme = (theme, container) => {
			if (theme && iframely.SUPPORTED_THEMES.indexOf(theme) > -1) if (container) if (container.tagName === "IFRAME") setThemeInIframe(container, theme);
			else setThemeInAllIframes(container, theme);
			else {
				iframely.extendOptions({ theme });
				setThemeInAllIframes(document, theme);
				iframely.trigger("set-theme", theme);
			}
			else console.warn("Using iframely.setTheme with not supported theme: \"" + theme + "\". Supported themes are: " + iframely.SUPPORTED_THEMES.join(", "));
		};
	}

//#endregion
//#region src/import.ts
	var widgetsCache = {};
	function boot$8() {
		iframely.on("load", (el) => {
			if (!el && iframely.config.import !== false && isImportAble() && !iframely.import) {
				const elements = document.querySelectorAll("a[data-iframely-url]:not([data-import-uri])");
				if (elements.length > 1) makeImportAPICall(elements);
			}
		});
		iframely.on("load", (widget, importOptions) => {
			if (widget && !(widget instanceof Element) && widget.uri && (widget.html || widget.cancel)) {
				const els = widgetsCache[widget.uri];
				if (els) for (let i = 0; i < els.length; i++) loadImportWidget(widget, els[i], importOptions);
				delete widgetsCache[widget.uri];
			}
		});
		iframely.buildImportWidgets = (importOptions) => {
			iframely.trigger("import-loaded", importOptions);
			importOptions.widgets.forEach((widget) => {
				iframely.trigger("load", widget, importOptions);
			});
			importReady();
		};
		iframely.isTouch = () => {
			return "ontouchstart" in window || navigator.maxTouchPoints > 0;
		};
		iframely.on("import-widget-ready", clearWrapperStylesAndClass);
		if (!iframely.addEventListener) iframely.addEventListener = (elem, type, eventHandle) => {
			if (!elem) return;
			elem.addEventListener(type, eventHandle, false);
		};
	}
	function makeImportAPICall(elements) {
		const script = createScript();
		const uris = [];
		const ids = [];
		let import_options = null;
		function pushElement(uri, el) {
			if (!widgetsCache[uri]) widgetsCache[uri] = [];
			widgetsCache[uri].push(el);
		}
		function queueElement(el) {
			const src = el.getAttribute("data-iframely-url");
			const mId = src.match(iframely.ID_RE);
			const id = mId && mId[1];
			const options = parseQueryString(src, iframely.SUPPORTED_QUERY_STRING.concat("url"));
			let url = options.url;
			delete options.url;
			let skipImport = options.import === "0" || options.import === "false" || options.playerjs === "1" || options.playerjs === "true";
			if (!skipImport) {
				const mBase = src.match(iframely.BASE_RE);
				options.CDN = mBase && mBase[0];
				if (!import_options) import_options = options;
				else if (JSON.stringify(options, Object.keys(options).sort()) !== JSON.stringify(import_options, Object.keys(import_options).sort())) skipImport = true;
			}
			if (skipImport) iframely.trigger("load", el);
			else if (id) {
				el.setAttribute("data-import-uri", id);
				if (ids.indexOf(id) === -1) ids.push(id);
				pushElement(id, el);
			} else {
				if (!url) url = el.getAttribute("href");
				if ((import_options.key || import_options.api_key || iframely.config.api_key || iframely.config.key) && url) {
					el.setAttribute("data-import-uri", url);
					if (uris.indexOf(url) === -1) uris.push(url);
					pushElement(url, el);
				} else iframely.trigger("load", el);
			}
		}
		for (let i = 0; i < elements.length; i++) {
			const el = elements[i];
			if (!el.getAttribute("data-import-uri") && el.hasAttribute("data-iframely-url")) queueElement(el);
		}
		if (uris.length > 0 || ids.length > 0) {
			import_options = import_options || {};
			import_options.touch = iframely.isTouch();
			import_options.flash = false;
			import_options.app = 1;
			if (iframely.config.theme) import_options.theme = iframely.config.theme;
			if (uris.length > 0) import_options.uri = uris;
			if (ids.length > 0) import_options.ids = ids.join("&");
			import_options.v = iframely.VERSION;
			script.src = getEndpoint("/api/import/v2", import_options, iframely.SUPPORTED_QUERY_STRING);
			script.onerror = () => {
				importReady();
			};
			document.head.appendChild(script);
			iframely.import = script;
		} else {
			importReady();
			iframely.trigger("load");
		}
	}
	function loadImportWidget(widgetOptions, el, importOptions) {
		const needCancelWidget = widgetOptions.cancel;
		const shadow = widgetOptions.shadow;
		const hasRenderedEvent = widgetOptions.renderEvent;
		const wrapper = getIframeWrapper(el, true);
		if (needCancelWidget) iframely.cancelWidget(getWidget(el) || {
			maxWidthWrapper: el,
			iframe: el,
			url: el.getAttribute("href")
		});
		else {
			const widget = document.createElement("div");
			widget.innerHTML = widgetOptions.html;
			let parent, replacedEl;
			if (wrapper && !hasRenderedEvent) {
				parent = wrapper.aspectWrapper.parentNode;
				replacedEl = wrapper.aspectWrapper;
				wrapper.maxWidthWrapper.removeAttribute("style");
			} else {
				parent = el.parentNode;
				replacedEl = el;
			}
			if (shadow) {
				const shadowContainer = document.createElement("div");
				const shadowRoot = shadowContainer.attachShadow({ mode: "open" });
				shadowRoot.appendChild(widget);
				const shadowWidgetOptions = {
					shadowRoot,
					shadowContainer,
					container: parent,
					context: widgetOptions.context,
					stylesIds: widgetOptions.stylesIds,
					stylesDict: importOptions.commonShadowStyles
				};
				iframely.trigger("import-shadow-widget-before-render", shadowWidgetOptions);
				parent.insertBefore(shadowContainer, replacedEl);
				iframely.trigger("import-shadow-widget-after-render", shadowWidgetOptions);
			} else {
				parent.insertBefore(widget, replacedEl);
				exec_body_scripts(widget);
			}
			parent.removeChild(replacedEl);
			if (hasRenderedEvent) setTimeout(() => {
				clearWrapperStylesAndClass(parent);
			}, iframely.CLEAR_WRAPPER_STYLES_TIMEOUT);
		}
	}
	function importReady() {
		delete iframely.import;
		const failed_elements = document.querySelectorAll("a[data-iframely-url][data-import-uri]");
		for (let i = 0; i < failed_elements.length; i++) {
			failed_elements[i].removeAttribute("data-import-uri");
			iframely.trigger("load", failed_elements[i]);
		}
	}
	function isImportAble() {
		return !!(document.location && (iframely.debug || document.location.protocol === "http:" || document.location.protocol === "https:") && !iframely.config.playerjs && !iframely.config.lazy);
	}
	function clearWrapperStylesAndClass(el) {
		let aspectWrapper = el;
		let parents = 0;
		while (aspectWrapper && (!aspectWrapper.getAttribute("class") || aspectWrapper.getAttribute("class").split(" ").indexOf(iframely.ASPECT_WRAPPER_CLASS) === -1)) {
			aspectWrapper = aspectWrapper.parentNode;
			parents++;
			if (parents > 4) aspectWrapper = null;
		}
		const maxWidthWrapper = aspectWrapper && aspectWrapper.parentNode;
		if (maxWidthWrapper && maxWidthWrapper.getAttribute("class") && maxWidthWrapper.getAttribute("class").split(" ").indexOf(iframely.MAXWIDTH_WRAPPER_CLASS) > -1) {
			aspectWrapper.removeAttribute("style");
			aspectWrapper.removeAttribute("class");
			maxWidthWrapper.removeAttribute("style");
		}
	}
	function exec_body_scripts(body_el) {
		function nodeName(elem, name) {
			return !!elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
		}
		function evalScript(elem) {
			const data = elem.text || elem.textContent || elem.innerHTML || "";
			const script = createScript();
			script.type = "text/javascript";
			for (let i = 0; i < elem.attributes.length; i++) {
				const attr = elem.attributes[i];
				script.setAttribute(attr.name, attr.value);
			}
			script.appendChild(document.createTextNode(data));
			body_el.appendChild(script);
		}
		const scripts = [];
		const children_nodes = body_el.childNodes;
		for (let i = 0; children_nodes[i]; i++) {
			const child = children_nodes[i];
			if (nodeName(child, "script") && (!child.type || child.type.toLowerCase() === "text/javascript" || child.type.toLowerCase() === "application/javascript")) {
				scripts.push(child);
				body_el.removeChild(child);
			} else if (child.nodeType === Node.ELEMENT_NODE) exec_body_scripts(child);
		}
		for (let i = 0; i < scripts.length; i++) {
			const script = scripts[i];
			if (script.parentNode) script.parentNode.removeChild(script);
			evalScript(script);
		}
	}

//#endregion
//#region src/ahref.ts
	function boot$7() {
		iframely.on("load", (container, href) => {
			if (container && container.nodeName && typeof href === "string") {
				const a = document.createElement("a");
				a.setAttribute("href", href);
				container.appendChild(a);
				iframely.trigger("load", a);
			}
		});
		iframely.on("load", (el) => {
			if (!el && !iframely.import) {
				const elements = document.querySelectorAll("a[data-iframely-url]:not([data-import-uri])");
				for (let i = 0; i < elements.length; i++) iframely.trigger("load", elements[i]);
			}
		});
		iframely.on("load", (el) => {
			if (el && el.nodeName === "A" && (el.getAttribute("data-iframely-url") || el.getAttribute("href")) && !el.hasAttribute("data-import-uri")) unfurl(el);
		});
	}
	function unfurl(el) {
		if (!el.getAttribute("data-iframely-url") && !el.getAttribute("href")) return;
		let src;
		const dataIframelyUrl = el.getAttribute("data-iframely-url");
		if (dataIframelyUrl && /^((?:https?:)?\/\/[^/]+)\/\w+/i.test(dataIframelyUrl)) src = getEndpoint(dataIframelyUrl, {
			v: iframely.VERSION,
			app: 1,
			theme: iframely.config.theme
		});
		else if ((iframely.config.api_key || iframely.config.key) && iframely.CDN) {
			if (!el.getAttribute("href")) {
				console.warn("Iframely cannot build embeds: \"href\" attribute missing in", el);
				return;
			}
			src = getEndpoint("/api/iframe", {
				url: el.getAttribute("href"),
				v: iframely.VERSION,
				app: 1,
				theme: iframely.config.theme
			}, iframely.SUPPORTED_QUERY_STRING);
		} else console.warn("Iframely cannot build embeds: api key is required as query-string of embed.js");
		if (!src) el.removeAttribute("data-iframely-url");
		else {
			const iframe = document.createElement("iframe");
			iframe.setAttribute("allowfullscreen", "");
			iframe.setAttribute("allow", "autoplay *; encrypted-media *; ch-prefers-color-scheme *");
			if (el.hasAttribute("data-img")) iframe.setAttribute("data-img", el.getAttribute("data-img"));
			const isLazy = el.hasAttribute("data-lazy") || el.hasAttribute("data-img") || /&lazy=1/.test(src) || iframely.config.lazy;
			const text = el.textContent;
			if (text && text !== "") iframe.textContent = text;
			let wrapper = getIframeWrapper(el, true);
			if (wrapper) while (wrapper.aspectWrapper.lastChild) wrapper.aspectWrapper.removeChild(wrapper.aspectWrapper.lastChild);
			else {
				wrapper = addDefaultWrappers(el);
				el.parentNode.removeChild(el);
			}
			wrapper.aspectWrapper.appendChild(iframe);
			if (isLazy) {
				iframe.setAttribute("data-iframely-url", src);
				iframely.trigger("load", iframe);
			} else {
				iframe.setAttribute("src", src);
				iframely.trigger("iframe-ready", iframe);
			}
		}
	}

//#endregion
//#region src/lazy-img-placeholder.ts
	function boot$6() {
		iframely.on("load", (el) => {
			if (el && el.nodeName === "IFRAME" && el.hasAttribute("data-iframely-url") && el.hasAttribute("data-img") && !el.getAttribute("src")) {
				const dataImg = el.getAttribute("data-img");
				el.removeAttribute("data-img");
				el.setAttribute("data-img-created", "");
				const widget = getWidget(el);
				let src = el.getAttribute("data-iframely-url");
				if (widget) {
					addPlaceholderThumbnail(widget, src, dataImg);
					src = addQueryString(src, { img: 1 });
					el.setAttribute("data-iframely-url", src);
					new WaitingWidget(widget);
				}
				iframely.trigger("load", el);
			}
		});
		iframely.on("message", (widget, message) => {
			if (!widget) return;
			let waitingWidget;
			if (message.method === "widgetRendered") {
				hidePlaceholderThumbnail(widget);
				waitingWidget = findWaitingWidget(widget);
				waitingWidget?.deactivate();
			}
			if (message.method === "begin-waiting-widget-render") {
				waitingWidget = findWaitingWidget(widget);
				waitingWidget?.clearLoadingTimeout();
			}
			if (message.method === "end-waiting-widget-render") {
				waitingWidget = findWaitingWidget(widget);
				waitingWidget?.registerLoadingTimeout();
			}
		});
	}
	function addPlaceholderThumbnail(widget, href, imageUrl) {
		let thumbHref;
		if (imageUrl && /^(https?:)?\/\//.test(imageUrl)) thumbHref = imageUrl;
		else {
			const query = parseQueryString(href);
			const _params = {};
			for (const param in query) if (param.indexOf("_") === 0) _params[param] = query[param];
			if (query.media) _params.media = query.media;
			if (href.match(/\/api\/iframe/)) thumbHref = getEndpoint(href.match(/^(.+)\/api\/iframe/i)[1] + "/api/thumbnail", Object.assign({
				url: query.url,
				api_key: query.api_key,
				key: query.key
			}, _params));
			else if (href.match(iframely.ID_RE)) thumbHref = getEndpoint(href.replace(/^((?:https?:)?\/\/[^/]+\/(\w+-?\w+))(?:\?.*)?$/, "$1/thumbnail"), _params);
			else return;
		}
		const thumb = document.createElement("div");
		setStyles(thumb, {
			position: "absolute",
			width: "100%",
			height: "100%",
			backgroundImage: "url('" + thumbHref + "')",
			backgroundSize: "cover",
			backgroundPosition: "center"
		});
		const iframelyLoaderDiv = document.createElement("div");
		iframelyLoaderDiv.setAttribute("class", iframely.LOADER_CLASS);
		thumb.appendChild(iframelyLoaderDiv);
		const paddingTop = iframely.getElementComputedStyle(widget.aspectWrapper, "padding-top");
		const paddingBottom = iframely.getElementComputedStyle(widget.aspectWrapper, "padding-bottom");
		const paddingTopMatch = paddingTop && paddingTop.match(/^(\d+)px$/);
		if (paddingTopMatch && parseInt(paddingTopMatch[1]) && paddingBottom) {
			const thumbWrapper = document.createElement("div");
			setStyles(thumbWrapper, {
				top: "-" + paddingTop,
				width: "100%",
				height: 0,
				position: "relative",
				paddingBottom
			});
			thumbWrapper.appendChild(thumb);
			widget.aspectWrapper.appendChild(thumbWrapper);
		} else widget.aspectWrapper.appendChild(thumb);
	}
	function getNthNonTextChildNode(nth, element) {
		let count = 0;
		for (let i = 0; i < element.childNodes.length; i++) {
			const el = element.childNodes[i];
			if (el.nodeType === Node.ELEMENT_NODE) {
				if (nth === count) return el;
				count++;
			}
		}
	}
	function nonTextChildCount(element) {
		let count = 0;
		for (let i = 0; i < element.childNodes.length; i++) {
			const el = element.childNodes[i];
			if (el.nodeType === Node.TEXT_NODE) {
				if ((el.textContent || "").replace(/\s|\n/g, "")) count++;
			} else if (el.nodeType === Node.ELEMENT_NODE) count++;
		}
		return count;
	}
	function hidePlaceholderThumbnail(widget) {
		const thumb = widget.aspectWrapper && nonTextChildCount(widget.aspectWrapper) > 1 && getNthNonTextChildNode(1, widget.aspectWrapper);
		if (thumb && thumb.nodeName === "DIV") widget.aspectWrapper.removeChild(thumb);
	}
	var waitingWidgets = [];
	function findWaitingWidgetIdx(widget) {
		let i = 0;
		while (i < waitingWidgets.length && waitingWidgets[i].widget.iframe !== widget.iframe) i++;
		if (i < waitingWidgets.length && waitingWidgets[i].widget.iframe === widget.iframe) return i;
	}
	function findWaitingWidget(widget) {
		const idx = findWaitingWidgetIdx(widget);
		if (idx || idx === 0) return waitingWidgets[idx];
	}
	function removeWaitingWidget(widget) {
		const idx = findWaitingWidgetIdx(widget);
		if (idx || idx === 0) waitingWidgets.splice(idx, 1);
	}
	var WaitingWidget = class {
		widget;
		loadCount = 0;
		timeoutId = null;
		constructor(widget) {
			this.widget = widget;
			iframely.addEventListener(widget.iframe, "load", () => {
				this.iframeOnLoad();
			});
			this.registerLoadingTimeout();
			waitingWidgets.push(this);
		}
		iframeOnLoad() {
			this.loadCount++;
			if (this.loadCount !== 2) return;
			this.deactivate();
			setTimeout(() => {
				hidePlaceholderThumbnail(this.widget);
			}, iframely.LAZY_IFRAME_FADE_TIMEOUT);
		}
		deactivate() {
			this.clearLoadingTimeout();
			removeWaitingWidget(this.widget);
		}
		clearLoadingTimeout() {
			if (this.timeoutId) clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		registerLoadingTimeout() {
			if (this.timeoutId) return;
			this.timeoutId = setTimeout(() => {
				this.iframeOnLoad();
			}, iframely.LAZY_IFRAME_SHOW_TIMEOUT);
		}
	};

//#endregion
//#region src/lazy-iframe.ts
	function boot$5() {
		iframely.on("load", (el) => {
			if (!el) {
				const elements = document.querySelectorAll("iframe[data-iframely-url]");
				for (let i = 0; i < elements.length; i++) iframely.trigger("load", elements[i]);
			}
		});
		iframely.on("load", (el) => {
			if (el && el.nodeName === "IFRAME" && el.hasAttribute("data-iframely-url") && !el.hasAttribute("data-img") && !el.getAttribute("src")) loadLazyIframe(el);
		});
	}
	function loadLazyIframe(el) {
		const widget = getWidget(el);
		let src = el.getAttribute("data-iframely-url");
		const dataImg = el.hasAttribute("data-img-created") || el.hasAttribute("data-img");
		const nativeLazyLoad = !dataImg && iframely.SUPPORT_IFRAME_LOADING_ATTR;
		if (widget && src) {
			const options = {
				v: iframely.VERSION,
				app: 1,
				theme: iframely.config.theme
			};
			if (!nativeLazyLoad && iframely.config.intersection) options.lazy = 1;
			src = getEndpoint(src, options);
		}
		if (nativeLazyLoad) el.setAttribute("loading", "lazy");
		if (dataImg && iframely.SUPPORT_IFRAME_LOADING_ATTR) el.setAttribute("loading", "edge");
		el.setAttribute("src", src || "");
		el.removeAttribute("data-iframely-url");
		iframely.trigger("iframe-ready", el);
	}

//#endregion
//#region src/widget-cancel.ts
	function boot$4() {
		iframely.on("message", (widget, message) => {
			if (message.method === "cancelWidget") iframely.cancelWidget(widget);
		});
		iframely.cancelWidget = (widget) => {
			if (!widget) {
				console.warn("iframely.cancelWidget called without widget param");
				return;
			}
			function findParent(el, className) {
				let found = false;
				while (!found && el.parentNode) {
					el = el.parentNode;
					found = !!el.className && typeof el.className === "string" && el.className.split(" ").indexOf(className) >= 0;
				}
				return found && el;
			}
			let parentNode = widget.maxWidthWrapper && widget.maxWidthWrapper.parentNode;
			let naNode = widget.maxWidthWrapper;
			if (iframely.config && iframely.config.parent) {
				const parentElement = findParent(widget.maxWidthWrapper, String(iframely.config.parent));
				if (parentElement) {
					parentNode = parentElement.parentNode;
					naNode = parentElement;
				}
			}
			if (widget.url) {
				const text = widget.iframe && widget.iframe.textContent;
				iframely.triggerAsync("cancel", widget.url, parentNode, text, naNode.nextSibling);
			}
			parentNode.removeChild(naNode);
		};
	}

//#endregion
//#region src/widget-resize.ts
	var resetWrapperBorderStyles = {
		border: "",
		"border-radius": "",
		"box-shadow": "",
		overflow: ""
	};
	var resetIframeBorderStyles = {
		border: "0",
		"border-radius": "",
		"box-shadow": "",
		overflow: ""
	};
	function boot$3() {
		iframely.on("message", (widget, message) => {
			if (message.method === "setIframelyWidgetSize" || message.method === "resize" || message.method === "setIframelyEmbedData" || message.type === "embed-size" || message.context === "iframe.resize") {
				let frame_styles = null;
				if (message.data && message.data.media && message.data.media.frame_style) {
					message.data.media.frame_style.split(";").forEach((str) => {
						if (str.trim() !== "" && str.indexOf(":") > -1) {
							const props = str.split(":");
							if (props.length === 2) {
								frame_styles = frame_styles || {};
								frame_styles[props[0].trim()] = props[1].trim();
							}
						}
					});
					widgetDecorate(widget, frame_styles);
				} else if (message.method === "setIframelyEmbedData") widgetDecorate(widget, null);
				let media = message.data && message.data.media;
				if (!media && message.height) media = {
					height: message.height,
					"max-width": "keep"
				};
				widgetResize(widget, media);
			}
		});
	}
	function widgetDecorate(widget, styles) {
		if (styles && widget && widget.iframe) if (styles["border-radius"]) {
			styles.overflow = "hidden";
			setStyles(widget.aspectWrapper, styles);
		} else setStyles(widget.iframe, styles);
		else if (!styles && widget && widget.iframe) {
			setStyles(widget.aspectWrapper, resetWrapperBorderStyles);
			setStyles(widget.iframe, resetIframeBorderStyles);
		}
	}
	function getTotalBorderWidth(widget) {
		const frameStylesBorder = widget.iframe && widget.iframe.style.border || widget.aspectWrapper && widget.aspectWrapper.style.border;
		const borderMatch = frameStylesBorder && frameStylesBorder.match(/(\d+)px/);
		if (borderMatch) return parseInt(borderMatch[1]) * 2;
		return 0;
	}
	function widgetResize(widget, media) {
		if (media && Object.keys(media).length > 0 && widget) {
			const borderWidth = getTotalBorderWidth(widget);
			const oldIframeHeight = window.getComputedStyle(widget.iframe).getPropertyValue("height");
			let maxWidth = media["max-width"];
			if (typeof maxWidth === "number") maxWidth += borderWidth;
			setStyles(widget.maxWidthWrapper, {
				"max-width": maxWidth,
				"min-width": media["min-width"] && media["min-width"] + borderWidth,
				width: media.width && media.width + borderWidth
			});
			if (media.scrolling && widget.iframe) widget.iframe.setAttribute("scrolling", media.scrolling);
			const aspectRatio = media["aspect-ratio"];
			if (aspectRatio || media.height) setStyles(widget.aspectWrapper, {
				paddingBottom: aspectRatio ? Math.round(1e3 * 100 / aspectRatio) / 1e3 + "%" : 0,
				paddingTop: aspectRatio && media["padding-bottom"],
				height: aspectRatio ? 0 : media.height && media.height + borderWidth
			});
			const currentHeight = window.getComputedStyle(widget.iframe).getPropertyValue("height");
			if (oldIframeHeight && oldIframeHeight !== currentHeight) iframely.triggerAsync("heightChanged", widget.iframe, oldIframeHeight, currentHeight);
		}
	}

//#endregion
//#region src/widget-click.ts
	function boot$2() {
		iframely.on("message", (widget, message) => {
			if (message.method === "open-href" || message.method === "click") iframely.trigger(message.method, message.href);
		});
		if (!iframely.openHref) iframely.openHref = (href) => {
			if (href.indexOf(window.location.origin) === 0) window.location.href = href;
			else window.open(href, "_blank", "noopener");
		};
		iframely.on("open-href", (href) => {
			iframely.triggerAsync("click", href);
			iframely.openHref(href);
		});
	}

//#endregion
//#region src/widget-options.ts
	function boot$1() {
		iframely.on("message", (widget, message) => {
			if (message.method === "setIframelyEmbedOptions") iframely.trigger("options", widget, message.data);
		});
	}

//#endregion
//#region src/deprecated.ts
	function boot() {
		iframely.widgets = iframely.widgets || {};
		iframely.widgets.load = iframely.load;
		if (!iframely.events) {
			iframely.events = {};
			iframely.events.on = iframely.on;
			iframely.events.trigger = iframely.trigger;
		}
		iframely.on("cancel", (url, parentNode, text, nextSibling) => {
			if (iframely.RECOVER_HREFS_ON_CANCEL && !text) text = url;
			if (url && parentNode && text && text !== "") {
				const a = document.createElement("a");
				a.setAttribute("href", url);
				a.setAttribute("target", "_blank");
				a.setAttribute("rel", "noopener");
				a.textContent = text;
				if (nextSibling) parentNode.insertBefore(a, nextSibling);
				else parentNode.appendChild(a);
			}
		});
	}

//#endregion
//#region src/index.ts
	if (!iframely._loaded) {
		iframely._loaded = true;
		boot$14();
		boot$13();
		boot$11();
		boot$12();
		boot$10();
		boot$9();
		boot$8();
		boot$7();
		boot$6();
		boot$5();
		boot$4();
		boot$3();
		boot$2();
		boot$1();
		boot();
		iframely.trigger("init");
	}

//#endregion
})();