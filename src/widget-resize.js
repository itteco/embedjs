var utils = require('./utils');
var iframely = require('./iframely');

iframely.on('message', function(widget, message) {
    if (message.method === 'setIframelyWidgetSize' || message.method === 'resize' || message.method === 'setIframelyEmbedData') {

        var frame_styles = {};
        if (message.data && message.data.media && message.data.media.frame_style) {

            message.data.media.frame_style.split(';').forEach(function(str) {

                if(str.trim() !== '' && str.indexOf(':') > -1) {
                    var props = str.split(':');
                    if (props.length === 2) {
                        frame_styles[props[0].trim()] = props[1].trim();
                    }
                }
            });

            widgetDecorate(widget, frame_styles);

        } else if (message.method === 'setIframelyEmbedData') {

            // setIframelyEmbedData always sets frame_style. If not - reset.
            widgetDecorate(widget, null);
        }

        var media = message.data && message.data.media || {height: message.height};

        widgetResize(widget, media);
    }
});

// All frame_style attributes.
var resetBorderStyles = {'border': '', 'border-radius': '', 'box-shadow': '', 'overflow': ''};

function widgetDecorate(widget, styles) {

    if (styles && widget && widget.iframe) {

        if (styles['border-radius']) {
            // fix for Chrome?
            styles.overflow = 'hidden';
            utils.setStyles(widget.aspectWrapper, styles);
        } else {
            utils.setStyles(widget.iframe, styles);
        }

    } else if (!styles && widget && widget.iframe) {

        utils.setStyles(widget.aspectWrapper, resetBorderStyles);
        utils.setStyles(widget.iframe, resetBorderStyles);
    }
}

function widgetResize(widget, media) {

    if (media && Object.keys(media).length > 0 && widget) {

        var oldIframeHeight = window.getComputedStyle && window.getComputedStyle(widget.iframe).getPropertyValue('height');

        utils.setStyles(widget.maxWidthWrapper, {
            'max-width': media['max-width'],
            'min-width': media['min-width'],
            width: media.width
        });

        if (media.scrolling && widget.iframe) {
            widget.iframe.setAttribute('scrolling', media.scrolling);
        }

        // TODO: can be not defined if default value and no height and width.
        var aspectRatio = media['aspect-ratio'];

        utils.setStyles(widget.aspectWrapper, {
            paddingBottom: aspectRatio ? (Math.round(1000 * 100 / aspectRatio) / 1000 + '%') : 0, // if fixed-size, it will get set to 0
            paddingTop: aspectRatio && media['padding-bottom'], // if a fixed-height padding at the bottom of responsive div is required
            height: aspectRatio ? 0 : media.height // if defined
        });

        var currentHeight = window.getComputedStyle && window.getComputedStyle(widget.iframe).getPropertyValue('height');

        if (oldIframeHeight && oldIframeHeight !== currentHeight) {
            iframely.triggerAsync('heightChanged', widget.iframe, oldIframeHeight, currentHeight);
        }

    }
}