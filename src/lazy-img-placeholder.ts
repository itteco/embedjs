import iframely from './iframely';
import * as utils from './utils';
import type { IframelyWidget } from './types';

export function boot(): void {
	iframely.on('load', (el?: Element) => {
		if (
			el &&
			el.nodeName === 'IFRAME' &&
			el.hasAttribute('data-iframely-url') &&
			el.hasAttribute('data-img') &&
			!el.getAttribute('src')
		) {
			const dataImg = el.getAttribute('data-img');

			el.removeAttribute('data-img');
			el.setAttribute('data-img-created', '');

			const widget = utils.getWidget(el);
			let src = el.getAttribute('data-iframely-url')!;

			if (widget) {
				addPlaceholderThumbnail(widget, src, dataImg);

				src = utils.addQueryString(src, { img: 1 });
				el.setAttribute('data-iframely-url', src);

				new WaitingWidget(widget);
			}

			iframely.trigger('load', el);
		}
	});

	iframely.on('message', (widget: IframelyWidget | undefined, message) => {
		if (!widget) {
			return;
		}

		let waitingWidget;

		if (message.method === 'widgetRendered') {
			hidePlaceholderThumbnail(widget);

			waitingWidget = findWaitingWidget(widget);
			waitingWidget?.deactivate();
		}

		if (message.method === 'begin-waiting-widget-render') {
			waitingWidget = findWaitingWidget(widget);
			waitingWidget?.clearLoadingTimeout();
		}

		if (message.method === 'end-waiting-widget-render') {
			waitingWidget = findWaitingWidget(widget);
			waitingWidget?.registerLoadingTimeout();
		}
	});
}

function addPlaceholderThumbnail(
	widget: IframelyWidget,
	href: string,
	imageUrl: string | null
): void {
	let thumbHref;

	if (imageUrl && /^(https?:)?\/\//.test(imageUrl)) {
		thumbHref = imageUrl;
	} else {
		// Start of image url calculation.

		const query = utils.parseQueryString(href);

		// Extract widget params to invalidate image cache.
		const _params: Record<string, string> = {};
		for (const param in query) {
			if (param.indexOf('_') === 0) {
				_params[param] = query[param];
			}
		}

		// Force proxy `media` param.
		if (query.media) {
			_params.media = query.media;
		}

		// need to run through getEndpoint at least to avoid file:///
		if (href.match(/\/api\/iframe/)) {
			thumbHref = utils.getEndpoint(
				href.match(/^(.+)\/api\/iframe/i)![1] + '/api/thumbnail',
				Object.assign(
					{
						url: query.url,
						api_key: query.api_key,
						key: query.key
					},
					_params
				)
			);
		} else if (href.match(iframely.ID_RE)) {
			// RE copied from `iframely.ID_RE` and modified to replace path part.
			thumbHref = utils.getEndpoint(
				href.replace(/^((?:https?:)?\/\/[^/]+\/(\w+-?\w+))(?:\?.*)?$/, '$1/thumbnail'),
				_params
			);
		} else {
			return;
		}
	}

	// End of image url calculation.

	const thumb = document.createElement('div');
	// Parent div not always has ASPECT_WRAPPER_CLASS. Need explicit inline styles.
	utils.setStyles(thumb, {
		position: 'absolute',
		width: '100%',
		height: '100%',
		backgroundImage: "url('" + thumbHref + "')",
		backgroundSize: 'cover',
		backgroundPosition: 'center'
	});

	const iframelyLoaderDiv = document.createElement('div');
	iframelyLoaderDiv.setAttribute('class', iframely.LOADER_CLASS);
	thumb.appendChild(iframelyLoaderDiv);

	const paddingTop = iframely.getElementComputedStyle(widget.aspectWrapper, 'padding-top');
	const paddingBottom = iframely.getElementComputedStyle(widget.aspectWrapper, 'padding-bottom');

	const paddingTopMatch = paddingTop && paddingTop.match(/^(\d+)px$/);
	const paddingTopInt = paddingTopMatch && parseInt(paddingTopMatch[1]);

	if (paddingTopInt && paddingBottom) {
		const thumbWrapper = document.createElement('div');

		utils.setStyles(thumbWrapper, {
			top: '-' + paddingTop,
			width: '100%',
			height: 0,
			position: 'relative',
			paddingBottom: paddingBottom
		});

		thumbWrapper.appendChild(thumb);

		widget.aspectWrapper.appendChild(thumbWrapper);
	} else {
		widget.aspectWrapper.appendChild(thumb);
	}
}

function getNthNonTextChildNode(nth: number, element: Element): Element | undefined {
	let count = 0;
	for (let i = 0; i < element.childNodes.length; i++) {
		const el = element.childNodes[i];
		if (el.nodeType === Node.ELEMENT_NODE) {
			if (nth === count) {
				return el as Element;
			}
			count++;
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

function hidePlaceholderThumbnail(widget: IframelyWidget): void {
	const thumb =
		widget.aspectWrapper &&
		nonTextChildCount(widget.aspectWrapper) > 1 &&
		getNthNonTextChildNode(1, widget.aspectWrapper);
	if (thumb && thumb.nodeName === 'DIV') {
		widget.aspectWrapper.removeChild(thumb);
	}
}

//===

// Working WaitingWidgets' collection.

const waitingWidgets: WaitingWidget[] = [];

function findWaitingWidgetIdx(widget: IframelyWidget): number | undefined {
	let i = 0;
	while (i < waitingWidgets.length && waitingWidgets[i].widget.iframe !== widget.iframe) {
		i++;
	}
	if (i < waitingWidgets.length && waitingWidgets[i].widget.iframe === widget.iframe) {
		return i;
	}
}

function findWaitingWidget(widget: IframelyWidget): WaitingWidget | undefined {
	const idx = findWaitingWidgetIdx(widget);
	if (idx || idx === 0) {
		return waitingWidgets[idx];
	}
}

function removeWaitingWidget(widget: IframelyWidget): void {
	const idx = findWaitingWidgetIdx(widget);
	if (idx || idx === 0) {
		waitingWidgets.splice(idx, 1);
	}
}

//===

class WaitingWidget {
	widget: IframelyWidget;
	loadCount = 0;
	timeoutId: ReturnType<typeof setTimeout> | null = null;

	constructor(widget: IframelyWidget) {
		this.widget = widget;

		iframely.addEventListener(widget.iframe, 'load', () => {
			this.iframeOnLoad();
		});

		this.registerLoadingTimeout();

		waitingWidgets.push(this);
	}

	iframeOnLoad(): void {
		this.loadCount++;

		// Skip first load of hosted widget OR timeout call.
		if (this.loadCount !== 2) {
			return;
		}

		this.deactivate();

		setTimeout(() => {
			hidePlaceholderThumbnail(this.widget);
		}, iframely.LAZY_IFRAME_FADE_TIMEOUT);
	}

	deactivate(): void {
		this.clearLoadingTimeout();
		removeWaitingWidget(this.widget);
	}

	clearLoadingTimeout(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		this.timeoutId = null;
	}

	registerLoadingTimeout(): void {
		if (this.timeoutId) {
			return;
		}
		this.timeoutId = setTimeout(() => {
			this.iframeOnLoad();
		}, iframely.LAZY_IFRAME_SHOW_TIMEOUT);
	}
}
