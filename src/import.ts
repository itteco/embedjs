import iframely from './iframely';
import * as utils from './utils';

// widgetsCache is used from inside import doc for js callbacks and custom features
const widgetsCache: Record<string, Element[]> = {};

export function boot(): void {
	iframely.on('load', (el?: Element) => {
		// load once, if import is not in process and only if query-string from script src has not disabled import
		if (!el && iframely.config.import !== false && isImportAble() && !iframely.import) {
			const elements = document.querySelectorAll(
				'a[data-iframely-url]:not([data-import-uri])'
			);
			if (elements.length > 1) {
				makeImportAPICall(elements);
			}
		}
	});

	iframely.on(
		'load',
		(widget: Record<string, any> | Element | undefined, importOptions: Record<string, any>) => {
			if (
				widget &&
				!(widget instanceof Element) &&
				widget.uri &&
				(widget.html || widget.cancel)
			) {
				const els = widgetsCache[widget.uri];
				// alternatively, could as well do querySelectorAll('a[data-iframely-url][data-import="' + template.getAttribute('data-uri') + '"')

				if (els) {
					for (let i = 0; i < els.length; i++) {
						loadImportWidget(widget, els[i], importOptions);
					}
				}

				delete widgetsCache[widget.uri];
			}
		}
	);

	iframely.buildImportWidgets = (importOptions: Record<string, any>) => {
		// A response arriving after unload() cancelled the pending import (a
		// <script> removed from the document may still execute) must not
		// rebuild widgets or re-trigger loads.
		if (!iframely.import) {
			return;
		}

		iframely.trigger('import-loaded', importOptions);

		importOptions.widgets.forEach((widget: Record<string, any>) => {
			iframely.trigger('load', widget, importOptions);
		});

		importReady();
	};

	iframely.isTouch = () => {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	};

	iframely.on('import-widget-ready', clearWrapperStylesAndClass);

	// A full unload cancels a pending import and resets transient import
	// state so a later load() starts a fresh import cycle.
	iframely.on('unload', (el?: Element) => {
		if (!el) {
			cancelPendingImport();
			Object.keys(widgetsCache).forEach((key) => {
				delete widgetsCache[key];
			});
			// Release the anchors queued for the cancelled import: the ahref and
			// import loaders skip anchors that still carry data-import-uri.
			const queued = document.querySelectorAll('a[data-iframely-url][data-import-uri]');
			for (let i = 0; i < queued.length; i++) {
				queued[i].removeAttribute('data-import-uri');
			}
		}
	});

	// used in server templates
	if (!iframely.addEventListener) {
		iframely.addEventListener = (elem, type, eventHandle) => {
			if (!elem) {
				return;
			}
			elem.addEventListener(type, eventHandle, false);
		};
	}
}

function cancelPendingImport(): void {
	const script = iframely.import as HTMLScriptElement | undefined;
	if (script) {
		script.onerror = null;
		script.remove();
	}
	delete iframely.import;
}

function makeImportAPICall(elements: ArrayLike<Element>): void {
	const script = utils.createScript();

	const uris: string[] = [];
	const ids: string[] = [];

	let import_options: Record<string, any> | null = null; // will be populated from first element; or will remain as null if no params in elements...

	// couple helper functions first

	function pushElement(uri: string, el: Element): void {
		if (!widgetsCache[uri]) {
			widgetsCache[uri] = [];
		}

		widgetsCache[uri].push(el);
	}

	function queueElement(el: Element): void {
		const src = el.getAttribute('data-iframely-url')!;

		const mId = src.match(iframely.ID_RE);
		const id = mId && mId[1];

		const options: Record<string, any> = utils.parseQueryString(
			src,
			iframely.SUPPORTED_QUERY_STRING.concat('url')
		);

		let url = options.url; // can be undefined for IDs
		delete options.url;

		// skip import on import=0, playerjs=1
		let skipImport =
			options.import === '0' ||
			options.import === 'false' ||
			options.playerjs === '1' ||
			options.playerjs === 'true';

		// or if link's query-string params or CDN are different from the others
		if (!skipImport) {
			const mBase = src.match(iframely.BASE_RE);
			options.CDN = mBase && mBase[0]; // will fall back to iframely.CDN in getEndpoint('/import...' ...)

			// set import options from the first el in import
			// that includes api keys
			if (!import_options) {
				import_options = options;

				// else check that this el's options are the same as the first one's in import
			} else if (
				JSON.stringify(options, Object.keys(options).sort()) !==
				JSON.stringify(import_options, Object.keys(import_options).sort())
			) {
				skipImport = true;
			}
		}

		if (skipImport) {
			// Usual build if no uri and app=1s.
			iframely.trigger('load', el);
		} else if (id) {
			el.setAttribute('data-import-uri', id);
			if (ids.indexOf(id) === -1) {
				ids.push(id);
			}
			pushElement(id, el);
		} else {
			if (!url) {
				url = el.getAttribute('href');
			}

			const key =
				import_options!.key ||
				import_options!.api_key ||
				iframely.config.api_key ||
				iframely.config.key;

			if (key && url) {
				el.setAttribute('data-import-uri', url);
				if (uris.indexOf(url) === -1) {
					uris.push(url);
				}
				pushElement(url, el);
			} else {
				// Usual build if no uri.
				iframely.trigger('load', el);
			}
		}
	}

	// start actual filling up of import request

	for (let i = 0; i < elements.length; i++) {
		const el = elements[i];
		if (!el.getAttribute('data-import-uri') && el.hasAttribute('data-iframely-url')) {
			queueElement(el);
		}
	}

	if (uris.length > 0 || ids.length > 0) {
		import_options = import_options || {};
		import_options.touch = iframely.isTouch();
		// Flash is gone from the web; the endpoint still expects the param.
		import_options.flash = false;
		import_options.app = 1;
		// Do not override imports theme if global theme not set.
		if (iframely.config.theme) {
			import_options.theme = iframely.config.theme;
		}

		if (uris.length > 0) {
			import_options.uri = uris;
		}

		if (ids.length > 0) {
			import_options.ids = ids.join('&');
		}

		import_options.v = iframely.VERSION;

		script.src = utils.getEndpoint(
			'/api/import/v2',
			import_options,
			iframely.SUPPORTED_QUERY_STRING
		);

		script.onerror = () => {
			// Error loading import. No import this time.
			importReady();
		};

		document.head.appendChild(script);
		iframely.import = script;
	} else {
		importReady();
		iframely.trigger('load');
	}
}

function loadImportWidget(
	widgetOptions: Record<string, any>,
	el: Element,
	importOptions: Record<string, any>
): void {
	const needCancelWidget = widgetOptions.cancel;
	const shadow = widgetOptions.shadow;
	const hasRenderedEvent = widgetOptions.renderEvent;

	const wrapper = utils.getIframeWrapper(el, true);

	if (needCancelWidget) {
		iframely.cancelWidget(
			utils.getWidget(el) || {
				maxWidthWrapper: el,
				iframe: el,
				url: el.getAttribute('href')
			}
		);
	} else {
		const widget = document.createElement('div');
		widget.innerHTML = widgetOptions.html;

		let parent: Node, replacedEl: Element;

		if (wrapper && !hasRenderedEvent) {
			// Inline widget will replace 'aspectWrapper' but keep 'maxWidthWrapper' as 'iframely-embed' to fix centering, etc.
			// If has rendered event - keep wrapper and remove attrs later by event.
			parent = wrapper.aspectWrapper.parentNode!;
			replacedEl = wrapper.aspectWrapper;

			// Clear custom attributes.
			wrapper.maxWidthWrapper.removeAttribute('style');
		} else {
			// No wrapper or keep wrapper for later removal.
			parent = el.parentNode!;
			replacedEl = el;
		}

		if (shadow) {
			const shadowContainer = document.createElement('div');
			const shadowRoot = shadowContainer.attachShadow({ mode: 'open' });
			shadowRoot.appendChild(widget);

			const shadowWidgetOptions = {
				shadowRoot: shadowRoot,
				shadowContainer: shadowContainer,
				container: parent,
				context: widgetOptions.context,
				stylesIds: widgetOptions.stylesIds,
				stylesDict: importOptions.commonShadowStyles
			};

			iframely.trigger('import-shadow-widget-before-render', shadowWidgetOptions);

			parent.insertBefore(shadowContainer, replacedEl);

			iframely.trigger('import-shadow-widget-after-render', shadowWidgetOptions);
		} else {
			parent.insertBefore(widget, replacedEl);

			exec_body_scripts(widget);
		}

		parent.removeChild(replacedEl);

		if (hasRenderedEvent) {
			setTimeout(() => {
				clearWrapperStylesAndClass(parent as Element);
			}, iframely.CLEAR_WRAPPER_STYLES_TIMEOUT);
		}
	}
}

function importReady(): void {
	delete iframely.import;

	// clean up all, let other loaders have a go
	const failed_elements = document.querySelectorAll('a[data-iframely-url][data-import-uri]');
	for (let i = 0; i < failed_elements.length; i++) {
		failed_elements[i].removeAttribute('data-import-uri');
		iframely.trigger('load', failed_elements[i]);
	}
}

function isImportAble(): boolean {
	return !!(
		document.location && // Prevent `Cannot read properties of null (reading 'protocol')` for sandbox iframes.
		(iframely.debug ||
			document.location.protocol === 'http:' ||
			document.location.protocol === 'https:') && // Skip import on file:///
		!iframely.config.playerjs &&
		!iframely.config.lazy
	);
}

function clearWrapperStylesAndClass(el: Element): void {
	let aspectWrapper: Element | null = el;
	let parents = 0;
	while (
		aspectWrapper &&
		(!aspectWrapper.getAttribute('class') ||
			aspectWrapper
				.getAttribute('class')!
				.split(' ')
				.indexOf(iframely.ASPECT_WRAPPER_CLASS) === -1)
	) {
		aspectWrapper = aspectWrapper.parentNode as Element | null;
		parents++;
		if (parents > 4) {
			// Do not search further 4 parents.
			aspectWrapper = null;
		}
	}

	const maxWidthWrapper = aspectWrapper && (aspectWrapper.parentNode as Element | null);
	if (
		maxWidthWrapper &&
		maxWidthWrapper.getAttribute('class') &&
		maxWidthWrapper.getAttribute('class')!.split(' ').indexOf(iframely.MAXWIDTH_WRAPPER_CLASS) >
			-1
	) {
		// Remove wrapper specific data. Leave only 'iframely-embed' parent class.
		aspectWrapper!.removeAttribute('style');
		aspectWrapper!.removeAttribute('class');
		maxWidthWrapper.removeAttribute('style');
	}
}

function exec_body_scripts(body_el: Element): void {
	function nodeName(elem: Element, name: string): boolean {
		return !!elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	}

	function evalScript(elem: HTMLScriptElement): void {
		const data = elem.text || elem.textContent || elem.innerHTML || '';
		const script = utils.createScript();

		// Copy all script attributes.
		script.type = 'text/javascript';
		for (let i = 0; i < elem.attributes.length; i++) {
			const attr = elem.attributes[i];
			script.setAttribute(attr.name, attr.value);
		}
		script.appendChild(document.createTextNode(data));

		body_el.appendChild(script);
	}

	// main section of function
	const scripts: HTMLScriptElement[] = [];
	// Snapshot the children: removing a script from the live childNodes list
	// would shift the next sibling into the current index and skip it.
	const children_nodes = Array.from(body_el.childNodes);

	for (let i = 0; i < children_nodes.length; i++) {
		const child = children_nodes[i] as Element;
		if (
			nodeName(child, 'script') &&
			(!(child as HTMLScriptElement).type ||
				(child as HTMLScriptElement).type.toLowerCase() === 'text/javascript' ||
				(child as HTMLScriptElement).type.toLowerCase() === 'application/javascript')
		) {
			scripts.push(child as HTMLScriptElement);
			body_el.removeChild(child);
		} else if (child.nodeType === Node.ELEMENT_NODE) {
			exec_body_scripts(child);
		}
	}

	for (let i = 0; i < scripts.length; i++) {
		const script = scripts[i];
		if (script.parentNode) {
			script.parentNode.removeChild(script);
		}
		evalScript(script);
	}
}
