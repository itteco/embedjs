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
        }

        var media = message.data && message.data.media || {height: message.height};

        widgetResize(widget, media);
    }
});

function widgetDecorate(widget, styles) {

    if (styles && widget && widget.iframe) {

        if (styles['border-radius']) {
            // fix for Chrome?
            styles.overflow = 'hidden';
            utils.setStyles(widget.aspectWrapper, styles);
        } else {
            utils.setStyles(widget.iframe, styles);
        }
    }
}

function getTotalBorderWidth(widget) {

    // Get frame style from iframe or aspect wrapper as in widgetDecorate for Chrome fix.
    var frameStylesBorder = 
        (widget.iframe && widget.iframe.style.border) 
        || (widget.aspectWrapper && widget.aspectWrapper.style.border);

    // Get iframe border width from frame style.
    var borderWidth = frameStylesBorder && frameStylesBorder.match(/(\d+)px/) || 0;
    if (borderWidth) {
        borderWidth = parseInt(borderWidth[1]);
        // For width and height border size will be 2x.
        borderWidth = borderWidth * 2;
    }

    return borderWidth;
}

function widgetResize(widget, media) {
    
    if (media && Object.keys(media).length > 0 && widget) {

        var borderWidth = getTotalBorderWidth(widget);

        var oldIframeHeight = window.getComputedStyle && window.getComputedStyle(widget.iframe).getPropertyValue('height');

        utils.setStyles(widget.maxWidthWrapper, {
            'max-width': media['max-width'] && (media['max-width'] + borderWidth),
            'min-width': media['min-width'] && (media['min-width'] + borderWidth),
            width: media.width && (media.width + borderWidth)
        });

        if (media.scrolling && widget.iframe) {
            widget.iframe.setAttribute('scrolling', media.scrolling);
        }

        // TODO: can be not defined if default value and no height and width.
        var aspectRatio = media['aspect-ratio'];

        utils.setStyles(widget.aspectWrapper, {
            paddingBottom: aspectRatio ? (Math.round(1000 * 100 / aspectRatio) / 1000 + '%') : 0, // if fixed-size, it will get set to 0
            paddingTop: aspectRatio && media['padding-bottom'], // if a fixed-height padding at the bottom of responsive div is required
            height: aspectRatio ? 0 : (media.height && (media.height  + borderWidth)) // if defined
        });

        var currentHeight = window.getComputedStyle && window.getComputedStyle(widget.iframe).getPropertyValue('height');

        if (oldIframeHeight && oldIframeHeight !== currentHeight) {
            iframely.triggerAsync('heightChanged', widget.iframe, oldIframeHeight, currentHeight);
        }

    }
}