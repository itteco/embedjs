import iframely from './iframely';
import * as utils from './utils';
import type { IframelyWidget } from './types';

// All frame_style attributes.
const resetWrapperBorderStyles = {
	border: '',
	'border-radius': '',
	'box-shadow': '',
	overflow: ''
};
const resetIframeBorderStyles = {
	border: '0',
	'border-radius': '',
	'box-shadow': '',
	overflow: ''
};

export function boot(): void {
	iframely.on('message', (widget: IframelyWidget | undefined, message) => {
		if (
			message.method === 'setIframelyWidgetSize' ||
			message.method === 'resize' ||
			message.method === 'setIframelyEmbedData' ||
			message.type === 'embed-size' ||
			message.context === 'iframe.resize'
		) {
			let frame_styles: Record<string, string> | null = null;

			if (message.data && message.data.media && message.data.media.frame_style) {
				message.data.media.frame_style.split(';').forEach((str: string) => {
					if (str.trim() !== '' && str.indexOf(':') > -1) {
						const props = str.split(':');
						if (props.length === 2) {
							frame_styles = frame_styles || {};
							frame_styles[props[0].trim()] = props[1].trim();
						}
					}
				});

				widgetDecorate(widget, frame_styles);
			} else if (message.method === 'setIframelyEmbedData') {
				// setIframelyEmbedData always sets frame_style. If not - reset.
				// setIframelyEmbedData without message.data resets border.
				widgetDecorate(widget, null);
			}

			let media = message.data && message.data.media;
			if (!media && message.height) {
				media = {
					height: message.height,
					'max-width': 'keep'
				};
			}

			widgetResize(widget, media);
		}
	});
}

function widgetDecorate(
	widget: IframelyWidget | undefined,
	styles: Record<string, string> | null
): void {
	if (styles && widget && widget.iframe) {
		if (styles['border-radius']) {
			// fix for Chrome?
			styles.overflow = 'hidden';
			utils.setStyles(widget.aspectWrapper, styles);
		} else {
			utils.setStyles(widget.iframe as HTMLElement, styles);
		}
	} else if (!styles && widget && widget.iframe) {
		utils.setStyles(widget.aspectWrapper, resetWrapperBorderStyles);
		utils.setStyles(widget.iframe as HTMLElement, resetIframeBorderStyles);
	}
}

function getTotalBorderWidth(widget: IframelyWidget): number {
	// Get frame style from iframe or aspect wrapper as in widgetDecorate for Chrome fix.
	const frameStylesBorder =
		(widget.iframe && (widget.iframe as HTMLElement).style.border) ||
		(widget.aspectWrapper && widget.aspectWrapper.style.border);

	// Get iframe border width from frame style.
	const borderMatch = frameStylesBorder && frameStylesBorder.match(/(\d+)px/);
	if (borderMatch) {
		// For width and height border size will be 2x.
		return parseInt(borderMatch[1]) * 2;
	}

	return 0;
}

function widgetResize(
	widget: IframelyWidget | undefined,
	media: Record<string, any> | undefined
): void {
	if (media && Object.keys(media).length > 0 && widget) {
		const borderWidth = getTotalBorderWidth(widget);

		const oldIframeHeight = window.getComputedStyle(widget.iframe).getPropertyValue('height');

		let maxWidth = media['max-width'];
		if (typeof maxWidth === 'number') {
			// Can be max-width: 56vh.
			maxWidth += borderWidth;
		}

		utils.setStyles(widget.maxWidthWrapper, {
			'max-width': maxWidth,
			'min-width': media['min-width'] && media['min-width'] + borderWidth,
			width: media.width && media.width + borderWidth
		});

		if (media.scrolling && widget.iframe) {
			widget.iframe.setAttribute('scrolling', media.scrolling);
		}

		const aspectRatio = media['aspect-ratio'];

		// If no aspect and height - do not change aspect wrapper.
		if (aspectRatio || media.height) {
			utils.setStyles(widget.aspectWrapper, {
				paddingBottom: aspectRatio
					? Math.round((1000 * 100) / aspectRatio) / 1000 + '%'
					: 0, // if fixed-size, it will get set to 0
				paddingTop: aspectRatio && media['padding-bottom'], // if a fixed-height padding at the bottom of responsive div is required
				height: aspectRatio ? 0 : media.height && media.height + borderWidth // if defined
			});
		}

		const currentHeight = window.getComputedStyle(widget.iframe).getPropertyValue('height');

		if (oldIframeHeight && oldIframeHeight !== currentHeight) {
			iframely.triggerAsync('heightChanged', widget.iframe, oldIframeHeight, currentHeight);
		}
	}
}
