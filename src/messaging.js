var iframely = require('./iframely');
var utils = require('./utils');

function receiveMessage(callback) {

    function cb(e) {
        var message;
        try {
            message = JSON.parse(e.data);
        } catch (ex) {
        }

        callback(e, message);
    }

    // browser supports window.postMessage
    if (window['postMessage']) {
        if (window['addEventListener']) {
            window[callback ? 'addEventListener' : 'removeEventListener']('message', cb, !1);
        } else {
            window[callback ? 'attachEvent' : 'detachEvent']('onmessage', cb);
        }
    }
}

function findIframeByContentWindow(iframes, contentWindow) {
    var foundIframe;
    for(var i = 0; i < iframes.length && !foundIframe; i++) {
        var iframe = iframes[i];
        if (iframe.contentWindow === contentWindow) {
            foundIframe = iframe;
        }
    }
    return foundIframe;
}

function findIframe(options) {

    var foundIframe, iframes;

    if (options.src) {
        iframes = document.querySelectorAll('iframe[src*="' + options.src.replace(/^https?:/, '') + '"]');
        foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
    }

    if (!foundIframe) {
        iframes = options.domains ?
            document.querySelectorAll('iframe[src*="' + (options.domains || iframely.DOMAINS).join('"], iframe[src*="') + '"]')
            : document.getElementsByTagName('iframe');
        foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
    }

    return foundIframe;
}


receiveMessage(function(e, message) {

    if (message && message.method) {

        var foundIframe = findIframe({
            contentWindow: e.source,
            src: message.context,
            domains: iframely.DOMAINS.concat(iframely.CDN)
        });

        if (foundIframe) {
            var widget = utils.getWidget(foundIframe);
            if (widget && message.url) {
                widget.url = message.url;
            }
            iframely.trigger('message', widget, message);
        }
    }
    
});


exports.postMessage = function(message, target_url, target) {
    
    if (window['postMessage']) {

        if (typeof message === 'object') {
            message.context = document.location.href;
        }

        message = JSON.stringify(message);

        target_url = target_url || '*';

        target = target || window.parent;  // default to parent

        // the browser supports window.postMessage, so call it with a targetOrigin
        // set appropriately, based on the target_url parameter.
        target['postMessage'](message, target_url.replace( /([^:]+:\/\/[^/]+).*/, '$1'));
    }
};