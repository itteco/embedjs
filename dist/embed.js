/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/webpack/buildin/global.js":
/*!*************************************************!*\
  !*** ../node_modules/webpack/buildin/global.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || Function(\"return this\")() || (1, eval)(\"this\");\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack:///../node_modules/webpack/buildin/global.js?");

/***/ }),

/***/ "./ahref.js":
/*!******************!*\
  !*** ./ahref.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var utils = __webpack_require__(/*! ./utils */ \"./utils.js\");\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\niframely.on('load', function(container, href) {\n    if (container && container.nodeName && typeof href === 'string') {\n        var a = document.createElement('a');\n        a.setAttribute('href', href);\n        container.appendChild(a);\n        iframely.trigger('load', a);\n    }\n});\n\niframely.on('load', function(el) {\n\n    if (!el && !iframely.import) { \n\n        var elements = document.querySelectorAll('a[data-iframely-url]:not([data-import-uri])');\n        for(var i = 0; i < elements.length; i++) {\n            iframely.trigger('load', elements[i]);\n        }\n    }\n    \n});\n\niframely.on('load', function(el) {\n\n    if (el && el.nodeName === 'A' && (el.getAttribute('data-iframely-url') || el.getAttribute('href')) && !el.hasAttribute('data-import-uri')) {\n        unfurl(el);\n    }\n    \n});\n\nfunction unfurl(el) {\n    if (!el.getAttribute('data-iframely-url') && !el.getAttribute('href')) {\n        return; // isn't valid\n    }\n    var src;\n\n    var dataIframelyUrl = el.getAttribute('data-iframely-url');\n    if (dataIframelyUrl && /^((?:https?:)?\\/\\/[^/]+)\\/\\w+/i.test(dataIframelyUrl)) {\n        src = utils.getEndpoint(dataIframelyUrl, {\n            v: iframely.VERSION,\n            app: 1\n        });\n    } else if ((iframely.config.api_key || iframely.config.key) && iframely.CDN) {\n        src = utils.getEndpoint('/api/iframe', {\n            url: el.getAttribute('href'),\n            v: iframely.VERSION,\n            app: 1\n        }, iframely.SUPPORTED_QUERY_STRING);\n    } else {\n        console.warn('Iframely cannot build embeds: api key is required as query-string of embed.js');\n    }\n\n    if (!src) {\n        el.removeAttribute('data-iframely-url');    \n    } else {\n\n        var iframe = document.createElement('iframe');\n\n        iframe.setAttribute('allowfullscreen', '');\n        iframe.setAttribute('allow', 'autoplay; encrypted-media');\n\n        if (el.hasAttribute('data-img')) {\n            iframe.setAttribute('data-img', el.getAttribute('data-img'));\n        }\n\n        var isLazy = el.hasAttribute('data-lazy') || el.hasAttribute('data-img') || /&lazy=1/.test(src) || iframely.config.lazy;\n\n        var wrapper = utils.getIframeWrapper(el, true);\n            \n        if (wrapper) {\n\n            // Delete all in aspect wrapper.\n            while (wrapper.aspectWrapper.lastChild) {\n                wrapper.aspectWrapper.removeChild(wrapper.aspectWrapper.lastChild);\n            }\n\n        } else {\n            wrapper = utils.addDefaultWrappers(el);\n\n            var parentNode = el.parentNode;\n            parentNode.removeChild(el);\n        }\n\n        wrapper.aspectWrapper.appendChild(iframe);\n\n        if (isLazy) {\n            \n            // send to lazy iframe flow\n            iframe.setAttribute('data-iframely-url', src);\n            iframely.trigger('load', iframe);\n\n        } else {\n\n            iframe.setAttribute('src', src);\n            iframely.trigger('iframe-ready', iframe);\t\t\t\n        }\n\n\n    }\n\n\n}\n\n//# sourceURL=webpack:///./ahref.js?");

/***/ }),

/***/ "./const.js":
/*!******************!*\
  !*** ./const.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\niframely.VERSION = 1;\n\niframely.ASPECT_WRAPPER_CLASS = 'iframely-responsive';\niframely.MAXWIDTH_WRAPPER_CLASS = 'iframely-embed';\niframely.LOADER_CLASS = 'iframely-loader';\n\niframely.DOMAINS = ['cdn.iframe.ly', 'iframe.ly', 'if-cdn.com', 'iframely.net'];\niframely.CDN = iframely.CDN || iframely.DOMAINS[0]; // default domain, user or script src can change CDN\n\niframely.BASE_RE = /^(?:https?:)?\\/\\/[^/]+/i;\niframely.ID_RE = /^(?:https?:)?\\/\\/[^/]+\\/(\\w+)(?:\\?.*)?$/;\niframely.SCRIPT_RE = /^(?:https?:|file:\\/)?\\/\\/[^/]+(?:.+)?\\/(?:embed|iframely)\\.js(?:[^/]+)?$/i;\niframely.CDN_RE = /^(?:https?:)?\\/\\/([^/]+)\\/(?:embed|iframely)\\.js(?:[^/]+)?$/i;\n\niframely.SUPPORTED_QUERY_STRING = ['api_key', 'key', 'iframe', 'html5', 'playerjs', 'align', 'language', 'media', 'maxwidth', 'lazy', 'import'];\n\niframely.LAZY_IFRAME_SHOW_TIMEOUT = 3000;\niframely.LAZY_IFRAME_FADE_TIMEOUT = 200;\niframely.CLEAR_WRAPPER_STYLES_TIMEOUT = 3000;\n\n//# sourceURL=webpack:///./const.js?");

/***/ }),

/***/ "./deprecated.js":
/*!***********************!*\
  !*** ./deprecated.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\n// deprecated. Helper function only, for the reverse compatibility.\niframely.widgets = iframely.widgets || {};\niframely.widgets.load = iframely.load;\n\nif (!iframely.events) {\n    iframely.events = {};\n    iframely.events.on = iframely.on;\n    iframely.events.trigger = iframely.trigger;\n}\n\n//# sourceURL=webpack:///./deprecated.js?");

/***/ }),

/***/ "./dom-ready.js":
/*!**********************!*\
  !*** ./dom-ready.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// TODO: rename core.js to ready.js?\n\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\nvar DOMReady = function(f) {\n    if (document.readyState === 'complete' || document.readyState === 'interactive') {\n        // Run always (in case of async script).\n        setTimeout(f, 0);\n    }\n    document['addEventListener'] ? document['addEventListener']('DOMContentLoaded', f) : window.attachEvent('onload', f);\n};\n\nDOMReady(function() {\n\n    // Called each time on script load\n    iframely.trigger('load');\n});\n\n//# sourceURL=webpack:///./dom-ready.js?");

/***/ }),

/***/ "./events.js":
/*!*******************!*\
  !*** ./events.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(global) {var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\nvar nextTick = (function(window, prefixes, i, fnc) {\n    while (!fnc && i < prefixes.length) {\n        fnc = window[prefixes[i++] + 'equestAnimationFrame'];\n    }\n    return (fnc && fnc.bind(window)) || window.setImmediate || function(fnc) {window.setTimeout(fnc, 0);};\n})(typeof window !== 'undefined' ? window : global, 'r webkitR mozR msR oR'.split(' '), 0);\n\nvar callbacksStack = {};\niframely.on = function(event, cb) {\n    var events = callbacksStack[event] = callbacksStack[event] || [];\n    events.push(cb);\n};\n\nfunction trigger(event, async, args) {\n    var events = callbacksStack[event] || [];\n    events.forEach(function(cb) {\n        if (async) {\n            nextTick(function() {\n                cb.apply(iframely, args);\n            });\n        } else {\n            cb.apply(iframely, args);\n        }\n    });\n\n    if (event === 'init') {\n        // everything inited, let's clear the callstack, just in case\n        // TODO: not good.\n        callbacksStack[event] = [];\n    }\n}\n\niframely.trigger = function(event) {\n    var args = Array.prototype.slice.call(arguments, 1);\n    trigger(event, false, args);\n};\n\niframely.triggerAsync = function(event) {\n    var args = Array.prototype.slice.call(arguments, 1);\n    trigger(event, true, args);\n};\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ \"../node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./events.js?");

/***/ }),

/***/ "./iframely.js":
/*!*********************!*\
  !*** ./iframely.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var iframely = window.iframely = window.iframely || {};\niframely.config = iframely.config || {};\n\nmodule.exports = iframely;\n\n//# sourceURL=webpack:///./iframely.js?");

/***/ }),

/***/ "./import.js":
/*!*******************!*\
  !*** ./import.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var utils = __webpack_require__(/*! ./utils */ \"./utils.js\");\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\n// widgetsCache is used from inside import doc for js callbacks and custom features\nvar widgetsCache = {};\n\niframely.on('load', function(el) {\n\n    // load once, if import is not in process and only if query-string from script src has not disabled import\n    if (!el && iframely.config.import !== false             \n            && isImportAble()\n            && !iframely.import) {\n\n        var elements = document.querySelectorAll('a[data-iframely-url]:not([data-import-uri])');\n        if (elements.length > 1) {\n            makeImportAPICall(elements);\n        }\n    }\n\n});\n\n\niframely.on('load', function(template) {\n\n    if (template && template.nodeName === 'TEMPLATE' && template.hasAttribute('data-uri')) {\n        var els = widgetsCache[template.getAttribute('data-uri')];\n        // alternatively, could as well do querySelectorAll('a[data-iframely-url][data-import=\"' + template.getAttribute('data-uri') + '\"')\n\n        if (els) {\n            for (var i = 0; i < els.length; i++) {\n                loadTemplate(template, els[i]);\n            }\n        }\n        delete widgetsCache[template.getAttribute('data-uri')];\n    }\n});\n\n\nfunction makeImportAPICall(elements) {\n\n    var link = document.createElement('link');\n\n    var uris = [];\n    var ids = [];\n    \n    var import_options = null; // will be populated from first element; or will remain as null if no params in elements...\n\n    // couple helper functions first\n\n    function pushElement(uri, el) {\n        if (!widgetsCache[uri]) {\n            widgetsCache[uri] = [];\n        }\n\n        widgetsCache[uri].push(el);\n    }\n\n    function queueElement(el) {\n        var src = el.getAttribute('data-iframely-url');\n\n        var mId = src.match(iframely.ID_RE);\n        var id = mId && mId[1];\n\n        var options = utils.parseQueryString(src, iframely.SUPPORTED_QUERY_STRING.concat('url'));\n\n        var url = options.url; // can be undefined for IDs\n        delete options.url;\n\n        // skip import on import=0, playerjs=1\n        var skipImport = options.import === '0' || options.import === 'false' \n                    || options.playerjs === '1' || options.playerjs === 'true';\n\n        // or if link's query-string params or CDN are different from the others\n        if (!skipImport) {\n            var mBase = src.match(iframely.BASE_RE);\n            options.CDN = mBase && mBase[0]; // will fall back to iframely.CDN in getEndpoint('/import...' ...)\n\n            // set import options from the first el in import\n            // that includes api keys \n            if (!import_options) {\n                import_options = options;\n\n            // else check that this el's options are the same as the first one's in import\n            } else if (JSON.stringify(options, Object.keys(options).sort()) \n                    !== JSON.stringify(import_options, Object.keys(import_options).sort())) {\n\n                skipImport = true;\n            }\n\n\n        }\n\n\n        if (skipImport) {\n            // Usual build if no uri and app=1s.\n            iframely.trigger('load', el);\n\n        } else if (id) {\n            el.setAttribute('data-import-uri', id);\n            if (ids.indexOf(id) === -1) {\n                ids.push(id);\n            }\n            pushElement(id, el);\n\n        } else {\n\n            if (!url) {\n                url = el.getAttribute('href');\n            }\n\n            var key = import_options.key || import_options.api_key || iframely.config.api_key || iframely.config.key;\n\n            if (key && url) {\n\n                el.setAttribute('data-import-uri', url);\n                if (uris.indexOf(url) === -1) {\n                    uris.push(url);\n                }\n                pushElement(url, el);\n            } else {\n                // Usual build if no uri.\n                iframely.trigger('load', el);\n            }\n        }\n    }\n\n\n    // start actual filling up of import request\n\n    for(var i = 0; i < elements.length; i++) {\n        var el = elements[i];\n        if (!el.getAttribute('data-import-uri') && el.hasAttribute('data-iframely-url')) {\n            queueElement(el);\n        }\n    }\n\n    if ((uris.length > 0 || ids.length > 0)) {\n\n        link.rel = 'import';\n\n        import_options = import_options || {};\n        import_options.touch = iframely.isTouch();\n        import_options.flash = hasFlash();\n        import_options.app = 1;\n\n        if (uris.length > 0) {\n            import_options.uri = uris;\n        }\n\n        if (ids.length > 0) {\n            import_options.ids = ids.join('&');\n        }\n\n        import_options.v = iframely.VERSION;\n\n        link.href = utils.getEndpoint('/api/import', import_options, iframely.SUPPORTED_QUERY_STRING);\n\n        link.onload = function() {\n            loadTemplates(link);\n        };\n\n        link.onerror = function() {\n            // Error loading import. No import this time.\n            importReady();\n        };\n\n        document.head.appendChild(link);\n        iframely.import = link;\n\n    } else {\n        importReady();\n        iframely.trigger('load');\n    }\n}\n\n\nfunction loadTemplates(link) {\n\n    var doc = link['import'];\n    \n    iframely.trigger('template-loaded', doc);\n\n    var items = doc ? doc.querySelectorAll('template[data-uri]') : [];\n    for (var i = 0; i < items.length; i++) {\n        iframely.trigger('load', items[i]);\n    }\n\n    importReady();\n}\n\nfunction loadTemplate(template, el) {\n    var needCancelWidget = template.hasAttribute('data-cancel');\n    var shadow = template.hasAttribute('data-shadow');\n    var hasRenderedEvent = template.hasAttribute('data-render-event');\n\n    var wrapper = utils.getIframeWrapper(el, true);\n\n    if (needCancelWidget) {\n\n        iframely.cancelWidget(wrapper || {maxWidthWrapper: el});\n\n    } else {\n\n        var widget = document.importNode(template.content, true);\n\n        var parent, replacedEl;\n\n        if (wrapper && !hasRenderedEvent) {\n            // Inline widget will replace 'aspectWrapper' but keep 'maxWidthWrapper' as 'iframely-embed' to fix centering, etc.\n            // If has rendered event - keep wrapper and remove attrs later by event.\n            parent = wrapper.aspectWrapper.parentNode;\n            replacedEl = wrapper.aspectWrapper;\n\n            // Clear custom attributes.\n            wrapper.maxWidthWrapper.removeAttribute('style');\n        } else {\n            // No wrapper or keep wrapper for later removal.\n            parent = el.parentNode;\n            replacedEl = el;\n        }\n\n        if (shadow) {\n\n            var shadowContainer = document.createElement('div');\n            var shadowRoot = shadowContainer.createShadowRoot();\n            shadowRoot.appendChild(widget);\n\n            var widgetOptions = {\n                shadowRoot: shadowRoot,\n                shadowContainer: shadowContainer,\n                container: parent,\n                sourceTemplate: template,\n                importDoc: iframely.import['import']\n            };\n            \n            iframely.trigger('import-shadow-widget-before-render', widgetOptions);\n            \n            parent.insertBefore(shadowContainer, replacedEl);\n\n            iframely.trigger('import-shadow-widget-after-render', widgetOptions);\n            \n        } else {\n\n            parent.insertBefore(widget, replacedEl);\n        }\n\n        parent.removeChild(replacedEl);\n\n        if (hasRenderedEvent) {\n            setTimeout(function() {\n                clearWrapperStylesAndClass(parent);\n            }, iframely.CLEAR_WRAPPER_STYLES_TIMEOUT);\n        }\n    }\n}\n\n\nfunction importReady() {\n\n    delete iframely.import;\n\n    // clean up all, let other loaders have a go\n    var failed_elements = document.querySelectorAll('a[data-iframely-url][data-import-uri]');\n    for(var i = 0; i < failed_elements.length; i++) {\n        failed_elements[i].removeAttribute('data-import-uri');\n        iframely.trigger('load', failed_elements[i]);\n    }\n}\n\niframely.isTouch = function() {\n    return 'ontouchstart' in window        // works on most browsers\n        || navigator.maxTouchPoints;       // works on IE10/11 and Surface\n};\n\nfunction hasFlash() {\n\n    var _hasFlash = false;\n\n    try {\n        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');\n        if (fo) {\n            _hasFlash = true;\n        } else {\n            _hasFlash = false;\n        }\n    } catch (e) {\n        if (navigator.mimeTypes\n            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined\n            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {\n            _hasFlash = true;\n        } else {\n            _hasFlash = false;\n        }\n    }\n\n    return _hasFlash;\n}\n\nfunction isImportAble() {\n\n    return 'import' in document.createElement('link')\n        && (iframely.debug || document.location.protocol !== 'file:')  // Skip import on file:///\n        && 'registerElement' in document\n        && 'content' in document.createElement('template')\n        && !iframely.config.playerjs && !iframely.config.lazy;\n        // && !navigator.userAgent.toLowerCase().indexOf('firefox') > -1;\n        // TODO: test in Firefox 63\n}\n\nfunction clearWrapperStylesAndClass(el) {\n    var aspectWrapper = el;\n    var parents = 0;\n    while(aspectWrapper && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS) {\n        aspectWrapper = aspectWrapper.parentNode;\n        parents++;\n        if (parents > 4) {\n            // Do not search further 4 parents.\n            aspectWrapper = null;\n        }\n    }\n    var maxWidthWrapper = aspectWrapper && aspectWrapper.parentNode;\n    if (maxWidthWrapper && maxWidthWrapper.getAttribute('class') === iframely.MAXWIDTH_WRAPPER_CLASS) {\n        // Remove wrapper specific data. Leave only 'iframely-embed' parent class.\n        aspectWrapper.removeAttribute('style');\n        aspectWrapper.removeAttribute('class');\n        maxWidthWrapper.removeAttribute('style');\n    }\n}\n\niframely.on('import-widget-ready', clearWrapperStylesAndClass);\n\n// used in server templates\n\nif (!iframely.addEventListener) {\n    iframely.addEventListener = function(elem, type, eventHandle) {\n        if (!elem) { return; }\n        if ( elem.addEventListener ) {\n            elem.addEventListener( type, eventHandle, false );\n        } else if ( elem.attachEvent ) {\n            elem.attachEvent( 'on' + type, eventHandle );\n        } else {\n            elem['on' + type] = eventHandle;\n        }\n    };\n}\n\nif (!iframely.newUID) {\n    iframely.newUID = function() {\n        return '' + Math.round(Math.random() * new Date().getTime());\n    };\n}\n\n//# sourceURL=webpack:///./import.js?");

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./dom-ready */ \"./dom-ready.js\");\n\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\nif (!iframely._loaded) {\n\n    iframely._loaded = true;\n\n    __webpack_require__(/*! ./const */ \"./const.js\");\n    __webpack_require__(/*! ./events */ \"./events.js\");\n    // require('./utils');\n    __webpack_require__(/*! ./intersection */ \"./intersection.js\");\n    __webpack_require__(/*! ./import */ \"./import.js\");\n    __webpack_require__(/*! ./ahref */ \"./ahref.js\");\n    __webpack_require__(/*! ./lazy-img-placeholder */ \"./lazy-img-placeholder.js\");\n    __webpack_require__(/*! ./lazy-iframe */ \"./lazy-iframe.js\");\n    // require('./messaging');\n    __webpack_require__(/*! ./widget-cancel */ \"./widget-cancel.js\");\n    __webpack_require__(/*! ./widget-resize */ \"./widget-resize.js\");\n    __webpack_require__(/*! ./widget-click */ \"./widget-click.js\");\n    __webpack_require__(/*! ./deprecated */ \"./deprecated.js\");\n\n    iframely.trigger('init'); \n}\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./intersection.js":
/*!*************************!*\
  !*** ./intersection.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var messaging = __webpack_require__(/*! ./messaging */ \"./messaging.js\");\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\nvar options = {\n    rootMargin: '1000px 1000px 1000px 1000px'\n    // threshold: 0\n};\n\n// only one observer instance is enough;\nvar observer;\n\nfunction getObserver() {\n    return observer || new IntersectionObserver(callback, options);\n}    \n\nfunction callback(entries) {\n    entries.forEach(function(entry) {\n        \n        messaging.postMessage({\n            method: 'intersection',\n            entry: {\n                isIntersecting: entry.isIntersecting\n            }\n        }, '*', entry.target.contentWindow);\n\n        if (entry.isIntersecting) {\n            getObserver().unobserve(entry.target);\n        }\n    });\n}\n\nif ('IntersectionObserver' in window &&\n    'IntersectionObserverEntry' in window) {\n\n    iframely.on('init', function() {\n\n        iframely.extendOptions({\n            intersection: 1\n        });\n    \n    });\n\n    iframely.on('message', function(widget, message) {\n        if (message.method === 'send-intersections' && widget.iframe) {\n            getObserver().observe(widget.iframe);\n        }\n    });\n}\n\n\n//# sourceURL=webpack:///./intersection.js?");

/***/ }),

/***/ "./lazy-iframe.js":
/*!************************!*\
  !*** ./lazy-iframe.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var utils = __webpack_require__(/*! ./utils */ \"./utils.js\");\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\n// Need 'load' handler here instead of on('init') - we load lazy iframes only when DOM ready.\niframely.on('load', function(el) {    \n\n    if (!el) { // initial load\n\n        var elements = document.querySelectorAll('iframe[data-iframely-url]');\n        for(var i = 0; i < elements.length; i++) {\n            iframely.trigger('load', elements[i]);\n        }    \n    }\n    \n});\n\niframely.on('load', function(el) {\n\n    if (el && el.nodeName === 'IFRAME'\n        && el.hasAttribute('data-iframely-url')\n        && !el.hasAttribute('data-img')\n        && !el.getAttribute('src')) {\n\n        loadLazyIframe(el);\n    }\n    \n});\n\n\nfunction loadLazyIframe(el) {\n\n    var widget = utils.getIframeWidget(el);\n    var src = el.getAttribute('data-iframely-url');\n\n    if (widget && src) { \n\n        src = utils.getEndpoint(src, {\n            lazy: iframely.config.intersection,\n            v: iframely.VERSION,\n            app: 1 // for example, will fall back to summary card if media is not longer available\n        });\n\n    } \n\n    el.setAttribute('src', src);\n    el.removeAttribute('data-iframely-url');\n\n    iframely.trigger('iframe-ready', el);\n}\n\n//# sourceURL=webpack:///./lazy-iframe.js?");

/***/ }),

/***/ "./lazy-img-placeholder.js":
/*!*********************************!*\
  !*** ./lazy-img-placeholder.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var utils = __webpack_require__(/*! ./utils */ \"./utils.js\");\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\niframely.on('load', function(el) {\n\n    if (el && el.nodeName === 'IFRAME'\n        && el.hasAttribute('data-iframely-url')\n        && el.hasAttribute('data-img')\n        && !el.getAttribute('src')) {\n\n        el.removeAttribute('data-img');\n\n        var widget = utils.getIframeWidget(el);\n        var src = el.getAttribute('data-iframely-url');\n\n        addPlaceholderThumbnail(widget, src);\n\n        src = utils.addQueryString(src, {img: 1});\n        el.setAttribute('data-iframely-url', src);\n\n        new WaitingWidget(widget);\n\n        iframely.trigger('load', el);\n\n    }\n});\n\niframely.on('message', function(widget, message) {\n\n    var waitingWidget;\n\n    if (message.method === 'widgetRendered') {\n        hidePlaceholderThumbnail(widget);\n\n        waitingWidget = findWaitingWidget(widget);\n        waitingWidget && waitingWidget.deactivate();\n    }\n\n    if (message.method === 'begin-waiting-widget-render') {\n        waitingWidget = findWaitingWidget(widget);\n        waitingWidget && waitingWidget.clearLoadingTimeout();\n    }\n\n    if (message.method === 'end-waiting-widget-render') {\n        waitingWidget = findWaitingWidget(widget);\n        waitingWidget && waitingWidget.registerLoadingTimeout();\n    }\n});\n\n\nfunction addPlaceholderThumbnail(widget, href) {\n\n    var thumbHref;\n\n    // need to run through getEndpoint at least to avoid file:///\n    if (href.match(/\\/api\\/iframe/)) {\n        var query = utils.parseQueryString(href);\n        thumbHref = utils.getEndpoint(href.match(/^(.+)\\/api\\/iframe/i)[1] + '/api/thumbnail', {\n            url: query.url,\n            api_key: query.api_key,\n            key: query.key\n        });\n    } else if (href.match(/^(?:https?:)?\\/\\/[^/]+\\/[a-zA-Z0-9]+(?:\\?.*)?$/)) {\n        thumbHref = utils.getEndpoint(href.replace(/^((?:https?:)?\\/\\/[^/]+\\/[a-zA-Z0-9]+)((?:\\?.*)?)$/, '$1/thumbnail'));\n    } else {\n        return;\n    }\n\n    var thumb = document.createElement('div');\n    // Parent div not always has ASPECT_WRAPPER_CLASS. Need explicit inline styles.\n    utils.setStyles(thumb, {\n        position: 'absolute',\n        width: '100%',\n        height: '100%',\n        backgroundImage: \"url('\" + thumbHref + \"')\",\n        backgroundSize: 'cover',\n        backgroundPosition: 'center'\n    });\n\n    var iframelyLoaderDiv = document.createElement('div');\n    iframelyLoaderDiv.setAttribute('class', iframely.LOADER_CLASS);\n    thumb.appendChild(iframelyLoaderDiv);\n\n    var paddingTop = iframely.getElementComputedStyle(widget.aspectWrapper, 'padding-top');\n    var paddingBottom = iframely.getElementComputedStyle(widget.aspectWrapper, 'padding-bottom');\n\n    var paddingTopMatch = paddingTop.match(/^(\\d+)px$/);\n    var paddingTopInt = paddingTopMatch && parseInt(paddingTopMatch[1]);\n\n    if (paddingTopInt && paddingBottom) {\n\n        var thumbWrapper = document.createElement('div');\n\n        utils.setStyles(thumbWrapper, {\n            top: '-' + paddingTop,\n            width: '100%',\n            height: 0,\n            position: 'relative',\n            paddingBottom: paddingBottom\n        }); \n\n        thumbWrapper.appendChild(thumb);\n\n        widget.aspectWrapper.appendChild(thumbWrapper);\n\n    } else {\n\n        widget.aspectWrapper.appendChild(thumb);\n    }\n}\n\nfunction getNthNonTextChildNode(nth, element) {\n    var count = 0;\n    for(var i = 0; i < element.childNodes.length; i++) {\n        var el = element.childNodes[i];\n        if (el.nodeType === Node.TEXT_NODE) {\n            // Nop.\n        } else if (el.nodeType === Node.ELEMENT_NODE) {\n            if (nth === count) {\n                return el;\n            }\n            count++;\n        }\n    }\n}\n\nfunction nonTextChildCount(element) {\n    var count = 0;\n    for(var i = 0; i < element.childNodes.length; i++) {\n        var el = element.childNodes[i];\n        if (el.nodeType === Node.TEXT_NODE) {\n            var text = el.textContent || el.innerText;\n            text = text.replace(/\\s|\\n/g, '');\n            if (text) {\n                // Do not skip text node with text.\n                count++;\n            }\n        } else if (el.nodeType === Node.ELEMENT_NODE) {\n            count++;\n        }\n    }\n    return count;\n}\n\nfunction hidePlaceholderThumbnail(widget) {\n    var thumb = widget.aspectWrapper && nonTextChildCount(widget.aspectWrapper) > 1 && getNthNonTextChildNode(1, widget.aspectWrapper);\n    if (thumb && thumb.nodeName === 'DIV') {\n        widget.aspectWrapper.removeChild(thumb);\n    }\n}\n\n//===\n\n// Working WaitingWidgets' collection.\n\nvar waitingWidgets = [];\n\nfunction findWaitingWidgetIdx(widget) {\n    var i = 0;\n    while(i < waitingWidgets.length && waitingWidgets[i].widget.iframe !== widget.iframe) {\n        i++;\n    }\n    if (i < waitingWidgets.length && waitingWidgets[i].widget.iframe === widget.iframe) {\n        return i;\n    }\n}\n\nfunction findWaitingWidget(widget) {\n    var idx = findWaitingWidgetIdx(widget);\n    if (idx || idx === 0) {\n        return waitingWidgets[idx];\n    }\n}\n\nfunction removeWaitingWidget(widget) {\n    var idx = findWaitingWidgetIdx(widget);\n    if (idx || idx === 0) {\n        waitingWidgets.splice(idx, 1);\n    }\n}\n\n//===\n\n// WaitingWidget proto.\n\nfunction WaitingWidget(widget) {\n    this.widget = widget;\n    this.loadCount = 0;\n\n    var iframe = widget.iframe;\n\n    var that = this;\n    function iframeOnLoad() {\n        // Bind method to self.\n        that.iframeOnLoad();\n    }\n\n    iframe['addEventListener'] ? iframe['addEventListener']('load', iframeOnLoad) : iframe.attachEvent('onload', iframeOnLoad);\n\n    this.registerLoadingTimeout();\n\n    waitingWidgets.push(this);\n}\n\nWaitingWidget.prototype.iframeOnLoad = function() {\n\n    this.loadCount++;\n\n    // Skip first load of hosted widget OR timeout call.\n    if (this.loadCount !== 2) {\n        return;\n    }\n\n    this.deactivate();\n\n    var that = this;\n    setTimeout(function() {\n        hidePlaceholderThumbnail(that.widget);\n    }, iframely.LAZY_IFRAME_FADE_TIMEOUT);\n};\n\nWaitingWidget.prototype.deactivate = function() {\n    this.clearLoadingTimeout();\n    removeWaitingWidget(this);\n};\n\nWaitingWidget.prototype.clearLoadingTimeout = function() {\n    this.timeoutId && clearTimeout(this.timeoutId);\n    this.timeoutId = null;\n};\n\nWaitingWidget.prototype.registerLoadingTimeout = function() {\n    if (this.timeoutId) {\n        return;\n    }\n    var that = this;\n    this.timeoutId = setTimeout(function() {\n        that.iframeOnLoad();\n    }, iframely.LAZY_IFRAME_SHOW_TIMEOUT);\n};\n\n//# sourceURL=webpack:///./lazy-img-placeholder.js?");

/***/ }),

/***/ "./messaging.js":
/*!**********************!*\
  !*** ./messaging.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\nvar utils = __webpack_require__(/*! ./utils */ \"./utils.js\");\n\nfunction receiveMessage(callback) {\n\n    function cb(e) {\n        var message;\n        try {\n            message = JSON.parse(e.data);\n        } catch (ex) {\n        }\n\n        callback(e, message);\n    }\n\n    // browser supports window.postMessage\n    if (window['postMessage']) {\n        if (window['addEventListener']) {\n            window[callback ? 'addEventListener' : 'removeEventListener']('message', cb, !1);\n        } else {\n            window[callback ? 'attachEvent' : 'detachEvent']('onmessage', cb);\n        }\n    }\n}\n\nfunction findIframeByContentWindow(iframes, contentWindow) {\n    var foundIframe;\n    for(var i = 0; i < iframes.length && !foundIframe; i++) {\n        var iframe = iframes[i];\n        if (iframe.contentWindow === contentWindow) {\n            foundIframe = iframe;\n        }\n    }\n    return foundIframe;\n}\n\nfunction findIframe(options) {\n\n    var foundIframe, iframes;\n\n    if (options.src) {\n        iframes = document.querySelectorAll('iframe[src*=\"' + options.src.replace(/^https?:/, '') + '\"]');\n        foundIframe = findIframeByContentWindow(iframes, options.contentWindow);\n    }\n\n    if (!foundIframe) {\n        iframes = options.domains ?\n            document.querySelectorAll('iframe[src*=\"' + (options.domains || iframely.DOMAINS).join('\"], iframe[src*=\"') + '\"]')\n            : document.getElementsByTagName('iframe');\n        foundIframe = findIframeByContentWindow(iframes, options.contentWindow);\n    }\n\n    return foundIframe;\n}\n\n\nreceiveMessage(function(e, message) {\n\n    if (message && message.method) {\n\n        var foundIframe = findIframe({\n            contentWindow: e.source,\n            src: message.context,\n            domains: iframely.DOMAINS.concat(iframely.CDN)\n        });\n\n        if (foundIframe) {\n            var widget = utils.getIframeWidget(foundIframe);\n            iframely.trigger('message', widget, message);\n        }\n    }\n    \n});\n\n\nexports.postMessage = function(message, target_url, target) {\n    \n    if (window['postMessage']) {\n\n        if (typeof message === 'object') {\n            message.context = document.location.href;\n        }\n\n        message = JSON.stringify(message);\n\n        target_url = target_url || '*';\n\n        target = target || window.parent;  // default to parent\n\n        // the browser supports window.postMessage, so call it with a targetOrigin\n        // set appropriately, based on the target_url parameter.\n        target['postMessage'](message, target_url.replace( /([^:]+:\\/\\/[^/]+).*/, '$1'));\n    }\n};\n\n//# sourceURL=webpack:///./messaging.js?");

/***/ }),

/***/ "./utils.js":
/*!******************!*\
  !*** ./utils.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\nvar messaging = __webpack_require__(/*! ./messaging */ \"./messaging.js\");\n\niframely.on('init', function() {\n\n\n    iframely.extendOptions(parseQueryStringFromScriptSrc());\n    // if it's hosted from elsewhere - we don't support customizing via query-string. \n    // iframely.CDN will be default one unless changed by user (?cdn= or iframely.CDN= )\n\n    defineDefaultStyles();\n\n    requestSizeOfExistingIframes(iframely.DOMAINS.concat(iframely.CDN.replace(/^https?:\\/\\//, '')));\n    \n});\n\niframely.load = function() {\n    var args = Array.prototype.slice.call(arguments);\n    args.unshift('load');\n    iframely.trigger.apply(this, args);\n};\n\nvar getIframeWrapper = exports.getIframeWrapper = function(iframe, checkClass) {\n\n    var aspectWrapper = iframe.parentNode;\n\n    if (!aspectWrapper\n        || aspectWrapper.nodeName !== 'DIV'\n        || nonTextChildCount(aspectWrapper) > 2 /* 2 is lazy-cover */\n        || (checkClass && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS)\n        || (!checkClass && aspectWrapper.style.position !== 'relative' && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS)) {\n        return;\n    }\n\n    var maxWidthWrapper = aspectWrapper.parentNode;\n\n    if (!maxWidthWrapper\n        || maxWidthWrapper.nodeName !== 'DIV'\n        || nonTextChildCount(maxWidthWrapper) > 1\n        || (checkClass && maxWidthWrapper.getAttribute('class') !== iframely.MAXWIDTH_WRAPPER_CLASS)\n        || (!checkClass && maxWidthWrapper.getAttribute('class') && !maxWidthWrapper.getAttribute('class').match(/iframely/i) /* users can modify class */)\n    ) {\n        return;\n    }\n\n    return {\n        aspectWrapper: aspectWrapper,\n        maxWidthWrapper: maxWidthWrapper\n    };\n};\n\nexports.addDefaultWrappers = function(el) {\n    var parentNode = el.parentNode;\n\n    var maxWidthWrapper = document.createElement('div');\n    maxWidthWrapper.className = iframely.MAXWIDTH_WRAPPER_CLASS;\n\n    var aspectWrapper = document.createElement('div');\n    aspectWrapper.className = iframely.ASPECT_WRAPPER_CLASS;\n\n    maxWidthWrapper.appendChild(aspectWrapper);\n\n    parentNode.insertBefore(maxWidthWrapper, el);\n\n    return {\n        aspectWrapper: aspectWrapper,\n        maxWidthWrapper: maxWidthWrapper\n    };\n};\n\nexports.getIframeWidget = function(iframe) {\n    var wrapper = getIframeWrapper(iframe);\n    if (!wrapper) {\n        return;\n    }\n    return {\n        iframe: iframe,\n        aspectWrapper: wrapper.aspectWrapper,\n        maxWidthWrapper: wrapper.maxWidthWrapper\n    };\n};\n\niframely.getElementComputedStyle = function(el, style) {\n    return window.getComputedStyle && window.getComputedStyle(el).getPropertyValue(style);\n};\n\nexports.setStyles = function(el, styles) {\n    if (el) { // let's check it's still defined, just in case\n        Object.keys(styles).forEach(function(key) {\n\n            var value = styles[key];\n            if (typeof value === 'number' || (typeof value === 'string' && /^(\\d+)?\\.?(\\d+)?$/.test(value))) {\n                value = value + 'px';\n            }\n\n            if (!window.getComputedStyle ||\n                // don't change CSS values in pixels, such as height:0\n                (iframely.getElementComputedStyle(el, key) != value\n                // && don't set default aspect ratio if it's defined in CSS anyway\n                && !(el.className == 'iframely-responsive' && key === 'paddingBottom' && !el.style[key] && /^56\\.2\\d+%$/.test(value)))) {\n\n                el.style[key] = value || ''; // remove style that is no longer needed\n            }\n        });\n    }\n};\n\nfunction defineDefaultStyles() {\n\n    var iframelyStylesId = 'iframely-styles';\n    var styles = document.getElementById(iframelyStylesId);\n\n    if (!styles) {\n        // copy-paste default styles from https://iframely.com/docs/omit-css\n        var iframelyStyles = '.iframely-responsive{top:0;left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;box-sizing:content-box;}.iframely-responsive>*{top:0;left:0;width:100%;height:100%;position:absolute;border:0;box-sizing:content-box;}';\n\n        styles = document.createElement('style');\n        styles.id = iframelyStylesId;\n        styles.type = 'text/css';\n        if (styles.styleSheet) {\n            // IE.\n            styles.styleSheet.cssText = iframelyStyles;\n        } else {\n            styles.innerHTML = iframelyStyles;\n        }\n        document.getElementsByTagName('head')[0].appendChild(styles);\n    }\n}\n\n\nvar addQueryString = exports.addQueryString = function(href, options) {\n\n    var query_string = '';\n\n    Object.keys(options).forEach(function(key) {\n        var value = options[key];\n\n        // array is used e.g. for import: uris and ids\n        if (Object.prototype.toString.call(value) === '[object Array]') {\n\n            var values = value.map(function(uri) {\n                return key + '=' + encodeURIComponent(uri);\n            });\n            query_string += '&' + values.join('&');            \n\n        } else if (typeof value !== 'undefined' && href.indexOf(key + '=') === -1 ) { // set explicitely in options, skip undefines\n\n            if (value === true) {\n                value = 1;\n            }\n\n            if (value === false) {\n                value = 0;\n            }            \n\n            query_string += '&' + key + '=' + encodeURIComponent(value);\n        }\n\n    });\n\n    return href + (query_string !== '' ? (href.indexOf('?') > -1 ? '&' : '?') + query_string.replace(/^&/, '') : '');\n};\n\nexports.getEndpoint = function(src, options, config_params) {\n\n    var endpoint = src;\n\n    if (!/^(https?:)?\\/\\//i.test(src)) {\n        endpoint = (options.CDN || iframely.CDN) + endpoint;\n        delete options.CDN;\n    }\n\n    if (!/^(?:https?:)?\\/\\//i.test(endpoint)) {\n        endpoint = '//' + endpoint;\n    }    \n\n    if (options) {\n        endpoint = addQueryString(endpoint, options);\n    }\n\n    // get additional params from config\n    if (config_params && config_params.length) {\n\n        var more_options = {};\n        for (var i = 0; i < config_params.length; i++) {\n            if (typeof iframely.config[config_params[i]] !== 'undefined') {\n                more_options[config_params[i]] = iframely.config[config_params[i]];\n            }\n        }\n\n        endpoint = addQueryString(endpoint, more_options);\n    }\n\n\n    if (/^(https?:)?\\/\\//i.test(endpoint) && !endpoint.match(/^(https?:)?\\/\\//i)[1] && document.location.protocol === 'file:') {        \n        endpoint = 'http:' + endpoint;\n    }\n\n    return endpoint;\n};\n\n// helper method to init more options through js code\niframely.extendOptions = function(options) {\n\n    options && Object.keys(options).forEach(function(key) {\n        var new_value = (\n            options[key] === 0 || options[key] === '0' || options[key] === false || options[key] === 'false'\n                ? false : (options[key] === 1 || options[key] === '1' || options[key] === true || options[key] === 'true'\n                    ? true : options[key]));\n\n        if (iframely.config[key] !== false) { // set new value only when undefined or not previously disabled\n            iframely.config[key] = new_value;\n        }\n    });\n\n};  \n\nfunction parseQueryStringFromScriptSrc() {\n\n    // Extract global iframely params.\n    var scripts = document.querySelectorAll('script[src*=\"embed.js\"], script[src*=\"iframely.js\"]');\n\n    for(var i = 0; i < scripts.length; i++) {\n        var src = scripts[i].getAttribute('src').replace(/&amp;/gi, '&');\n\n        if (iframely.SCRIPT_RE.test(src)) { // found the script on custom origin or default Iframely CDN\n\n            var options = parseQueryString(src, iframely.SUPPORTED_QUERY_STRING.concat('cdn'));\n\n            var m2 = src.match(iframely.CDN_RE);\n            if (m2 || options.cdn) { // ignore non-Iframely hosts such as s.imgur.com/min/embed.js\n                iframely.CDN =  options.cdn || m2[1];\n            }\n\n            if (Object.keys(options).length > 0) {\n                // give preferrence to CDN from scripts that have query-string. \n                // CDN is most critical for embeds with empty data-iframely-url\n                // and those should have at least ?api_key... in script src\n\n                return options;\n            } // or keep searching\n        }\n    }\n    // should have exited by now if any querystring found...\n    return {};\n}\n\nfunction requestSizeOfExistingIframes(domains) {\n\n    var iframes = document.querySelectorAll('iframe[src*=\"' + (domains || iframely.DOMAINS).join('\"], iframe[src*=\"') + '\"]');\n    for(var i = 0; i < iframes.length; i++) {\n        var iframe = iframes[i];\n        var src = iframe.src;\n        if (src.match(/^(https?:)?\\/\\/[^/]+\\/api\\/iframe\\?.+/)\n            || src.match(/^(https?:)?\\/\\/[^/]+\\/\\w+(\\?.*)?$/)) {\n            messaging.postMessage({\n                method: 'getSize'\n            }, '*', iframe.contentWindow);\n        }\n    }\n}        \n\nfunction nonTextChildCount(element) {\n    var count = 0;\n    for(var i = 0; i < element.childNodes.length; i++) {\n        var el = element.childNodes[i];\n        if (el.nodeType === Node.TEXT_NODE) {\n            var text = el.textContent || el.innerText;\n            text = text.replace(/\\s|\\n/g, '');\n            if (text) {\n                // Do not skip text node with text.\n                count++;\n            }\n        } else if (el.nodeType === Node.ELEMENT_NODE) {\n            count++;\n        }\n    }\n    return count;\n}\n\nvar parseQueryString = exports.parseQueryString = function(url, allowed_query_string) {\n    var query = url.match(/\\?(.+)/i);\n    if (query) {\n        query = query[1];\n        var data = query.split('&');\n        var result = {};\n        for(var i=0; i<data.length; i++) {\n            var item = data[i].split('=');\n            if (!allowed_query_string || allowed_query_string.indexOf(item[0]) > -1) {\n                result[item[0]] = decodeURIComponent(item[1]);\n            }\n        }\n        return result;\n    } else {\n        return {};\n    }\n};\n\n//# sourceURL=webpack:///./utils.js?");

/***/ }),

/***/ "./widget-cancel.js":
/*!**************************!*\
  !*** ./widget-cancel.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\niframely.on('message', function(widget, message) {\n    if (message.method === 'cancelWidget') {   \n        iframely.cancelWidget(widget);\n    }\n});\n\niframely.cancelWidget = function(widget) {\n\n    if (!widget) {\n        console.warn('iframely.cancelWidget called without widget param');\n        return;\n    }\n\n    function findParent(el, className) {\n        var found = false;\n        while(!found && el.parentNode) {\n            el = el.parentNode;\n            found = el.className && el.className.split(' ').indexOf(className) >= 0;\n        }\n        return found && el;\n    }\n\n    var parentNode = widget.maxWidthWrapper && widget.maxWidthWrapper.parentNode;\n    var naNode = widget.maxWidthWrapper;\n\n    // Try remove by parentClass first.\n    if (iframely.config && iframely.config.parent) {\n        // Remove by parent class.\n        var parentElement = findParent(widget.maxWidthWrapper, iframely.config.parent);\n\n        if (parentElement) {\n            parentNode = parentElement.parentNode;\n            naNode = parentElement;\n        }\n    }\n\n    parentNode.removeChild(naNode);\n\n    // TODO: let's forget about the need to re-create a link if people had it as <a>text</a>, not empty one\n    // If we need to return that logic, we'll simply create another <a> with params from `widget`\n};\n\n//# sourceURL=webpack:///./widget-cancel.js?");

/***/ }),

/***/ "./widget-click.js":
/*!*************************!*\
  !*** ./widget-click.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\niframely.on('message', function(widget, message) {\n    if (message.method === 'open-href') {\n        iframely.trigger('open-href', message.href);\n    }\n});\n\niframely.on('open-href', function(href) {\n\n    iframely.triggerAsync('click', href);\n\n    if (href.indexOf(window.location.origin) === 0) {\n        // Redirect top on same origin.\n        window.location.href = href;\n    } else {\n        // Open new tab on another origin.\n        window.open(href, '_blank');\n    }\n});\n\n//# sourceURL=webpack:///./widget-click.js?");

/***/ }),

/***/ "./widget-resize.js":
/*!**************************!*\
  !*** ./widget-resize.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var utils = __webpack_require__(/*! ./utils */ \"./utils.js\");\nvar iframely = __webpack_require__(/*! ./iframely */ \"./iframely.js\");\n\niframely.on('message', function(widget, message) {\n\n    if (message.method === 'setIframelyWidgetSize' || message.method === 'resize' || message.method === 'setIframelyEmbedData') {   \n\n        var frame_styles = {};\n        if (message.data && message.data.media && message.data.media.frame_style) {\n\n            message.data.media.frame_style.split(';').forEach(function(str) {\n\n                if(str.trim() !== '' && str.indexOf(':') > -1) {\n                    var props = str.split(':');\n                    if (props.length === 2) {\n                        frame_styles[props[0].trim()] = props[1].trim();\n                    }\n                }\n            });\n\n            widgetDecorate(widget, frame_styles);\n        }\n\n        var media = message.data && message.data.media || {height: message.height};\n\n        widgetResize(widget, media);\n    }\n});\n\nfunction widgetDecorate(widget, styles) {\n\n    if (styles && widget && widget.iframe) {\n\n        if (styles['border-radius']) {\n            // fix for Chrome?\n            styles.overflow = 'hidden';\n            utils.setStyles(widget.aspectWrapper, styles);\n        } else {\n            utils.setStyles(widget.iframe, styles);\n        }\n    }\n}\n\nfunction widgetResize(widget, media) {\n\n    if (media && Object.keys(media).length > 0 && widget) {\n\n        var oldIframeHeight = window.getComputedStyle && window.getComputedStyle(widget.iframe).getPropertyValue('height');\n\n        utils.setStyles(widget.maxWidthWrapper, {\n            'max-width': media['max-width'],\n            'min-width': media['min-width'],\n            width: media.width\n        });\n\n        if (media.scrolling && widget.iframe) {\n            widget.iframe.setAttribute('scrolling', media.scrolling);\n        }\n\n        // TODO: can be not defined if default value and no height and width.\n        var aspectRatio = media['aspect-ratio'];\n\n        utils.setStyles(widget.aspectWrapper, {\n            paddingBottom: aspectRatio ? (Math.round(1000 * 100 / aspectRatio) / 1000 + '%') : 0, // if fixed-size, it will get set to 0\n            paddingTop: aspectRatio && media['padding-bottom'], // if a fixed-height padding at the bottom of responsive div is required\n            height: aspectRatio ? 0 : media.height // if defined\n        });\n\n        var currentHeight = window.getComputedStyle && window.getComputedStyle(widget.iframe).getPropertyValue('height');\n\n        if (oldIframeHeight && oldIframeHeight !== currentHeight) {\n            iframely.triggerAsync('heightChanged', widget.iframe, oldIframeHeight, currentHeight);\n        }\n\n    }\n}\n\n//# sourceURL=webpack:///./widget-resize.js?");

/***/ })

/******/ });