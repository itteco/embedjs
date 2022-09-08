var iframely = require('./iframely');
var utils = require('./utils');

function receiveMessage(callback) {

    function cb(e) {
        var message;
        try {
            if (typeof e.data === 'string') {
                message = JSON.parse(e.data);
            } else if (typeof e.data === 'object') {
                message = e.data;
            }
        } catch (ex) {
            if (typeof e.data === 'string') {
                var m = e.data.match(/heightxPYMx(\d+)/);
                if (m) {
                    message = {
                        method: 'resize',
                        height: parseInt(m[1]) + 1,
                        domains: 'all'
                    };
                }
            }
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

function findIframeInElement(element, options) {
    var foundIframe, iframes;
    
    if (options.src) {
        iframes = element.querySelectorAll('iframe[src*="' + options.src.replace(/^https?:/, '') + '"]');
        foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
    }

    if (!foundIframe) {
        iframes = options.domains ?
            element.querySelectorAll('iframe[src*="' + (options.domains || iframely.DOMAINS).join('"], iframe[src*="') + '"]')
            : element.getElementsByTagName('iframe');
        foundIframe = findIframeByContentWindow(iframes, options.contentWindow);
    }

    return foundIframe;
}

function findIframeInShadowRoots(element, options) {
    var foundIframe;
    var className = '.' + (iframely.config.shadow || iframely.SHADOW);
    var shadowRoots = element.querySelectorAll(className);
    for(var i = 0; i < shadowRoots.length && !foundIframe; i++) {
        var shadowRoot = shadowRoots[i].shadowRoot;
        if (shadowRoot) {
            foundIframe = findIframeInElement(shadowRoot, options);
            if (!foundIframe) {
                foundIframe = findIframeInShadowRoots(shadowRoot, options);
            }
        }
    }
    return foundIframe;
}

// Do not override existing.
if (!iframely.findIframe) {
    iframely.findIframe = function(options) {
        var foundIframe = findIframeInElement(document, options);
        if (!foundIframe) {
            foundIframe = findIframeInShadowRoots(document, options);
        }
        return foundIframe;
    };
}


receiveMessage(function(e, message) {
    if (message && (message.method || message.type)) {

        var foundIframe = iframely.findIframe({
            contentWindow: e.source,
            src: message.context,
            domains: message.domains !== 'all' && iframely.DOMAINS.concat(iframely.CDN)
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