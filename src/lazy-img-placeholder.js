var utils = require('./utils');
var iframely = require('./iframely');

iframely.on('load', function(el) {

    if (el && el.nodeName === 'IFRAME'
        && el.hasAttribute('data-iframely-url')
        && el.hasAttribute('data-img')
        && !el.getAttribute('src')) {

        el.removeAttribute('data-img');

        var widget = utils.getWidget(el);
        var src = el.getAttribute('data-iframely-url');

        addPlaceholderThumbnail(widget, src);

        src = utils.addQueryString(src, {img: 1});
        el.setAttribute('data-iframely-url', src);

        new WaitingWidget(widget);

        iframely.trigger('load', el);

    }
});

iframely.on('message', function(widget, message) {

    var waitingWidget;

    if (message.method === 'widgetRendered') {
        hidePlaceholderThumbnail(widget);

        waitingWidget = findWaitingWidget(widget);
        waitingWidget && waitingWidget.deactivate();
    }

    if (message.method === 'begin-waiting-widget-render') {
        waitingWidget = findWaitingWidget(widget);
        waitingWidget && waitingWidget.clearLoadingTimeout();
    }

    if (message.method === 'end-waiting-widget-render') {
        waitingWidget = findWaitingWidget(widget);
        waitingWidget && waitingWidget.registerLoadingTimeout();
    }
});


function addPlaceholderThumbnail(widget, href) {

    var thumbHref;

    var query = utils.parseQueryString(href);

    // Extract widget params to invalidate image cache.
    var _params = {};
    for(var param in query) {
        if (param.indexOf('_') === 0) {
            _params[param] = query[param];
        }
    }

    // need to run through getEndpoint at least to avoid file:///
    if (href.match(/\/api\/iframe/)) {
        thumbHref = utils.getEndpoint(href.match(/^(.+)\/api\/iframe/i)[1] + '/api/thumbnail', Object.assign({
            url: query.url,
            api_key: query.api_key,
            key: query.key
        }, _params));
    } else if (href.match(/^(?:https?:)?\/\/[^/]+\/[a-zA-Z0-9]+(?:\?.*)?$/)) {
        thumbHref = utils.getEndpoint(href.replace(/^((?:https?:)?\/\/[^/]+\/[a-zA-Z0-9]+)((\?.*)?)$/, '$1/thumbnail'), _params);
    } else {
        return;
    }

    var thumb = document.createElement('div');
    // Parent div not always has ASPECT_WRAPPER_CLASS. Need explicit inline styles.
    utils.setStyles(thumb, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: "url('" + thumbHref + "')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    });

    var iframelyLoaderDiv = document.createElement('div');
    iframelyLoaderDiv.setAttribute('class', iframely.LOADER_CLASS);
    thumb.appendChild(iframelyLoaderDiv);

    var paddingTop = iframely.getElementComputedStyle(widget.aspectWrapper, 'padding-top');
    var paddingBottom = iframely.getElementComputedStyle(widget.aspectWrapper, 'padding-bottom');

    var paddingTopMatch = paddingTop.match(/^(\d+)px$/);
    var paddingTopInt = paddingTopMatch && parseInt(paddingTopMatch[1]);

    if (paddingTopInt && paddingBottom) {

        var thumbWrapper = document.createElement('div');

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

function getNthNonTextChildNode(nth, element) {
    var count = 0;
    for(var i = 0; i < element.childNodes.length; i++) {
        var el = element.childNodes[i];
        if (el.nodeType === Node.TEXT_NODE) {
            // Nop.
        } else if (el.nodeType === Node.ELEMENT_NODE) {
            if (nth === count) {
                return el;
            }
            count++;
        }
    }
}

function nonTextChildCount(element) {
    var count = 0;
    for(var i = 0; i < element.childNodes.length; i++) {
        var el = element.childNodes[i];
        if (el.nodeType === Node.TEXT_NODE) {
            var text = el.textContent || el.innerText;
            text = text.replace(/\s|\n/g, '');
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

function hidePlaceholderThumbnail(widget) {
    var thumb = widget.aspectWrapper && nonTextChildCount(widget.aspectWrapper) > 1 && getNthNonTextChildNode(1, widget.aspectWrapper);
    if (thumb && thumb.nodeName === 'DIV') {
        widget.aspectWrapper.removeChild(thumb);
    }
}

//===

// Working WaitingWidgets' collection.

var waitingWidgets = [];

function findWaitingWidgetIdx(widget) {
    var i = 0;
    while(i < waitingWidgets.length && waitingWidgets[i].widget.iframe !== widget.iframe) {
        i++;
    }
    if (i < waitingWidgets.length && waitingWidgets[i].widget.iframe === widget.iframe) {
        return i;
    }
}

function findWaitingWidget(widget) {
    var idx = findWaitingWidgetIdx(widget);
    if (idx || idx === 0) {
        return waitingWidgets[idx];
    }
}

function removeWaitingWidget(widget) {
    var idx = findWaitingWidgetIdx(widget);
    if (idx || idx === 0) {
        waitingWidgets.splice(idx, 1);
    }
}

//===

// WaitingWidget proto.

function WaitingWidget(widget) {
    this.widget = widget;
    this.loadCount = 0;

    var iframe = widget.iframe;

    var that = this;
    function iframeOnLoad() {
        // Bind method to self.
        that.iframeOnLoad();
    }

    iframely.addEventListener(iframe, 'load', iframeOnLoad);

    this.registerLoadingTimeout();

    waitingWidgets.push(this);
}

WaitingWidget.prototype.iframeOnLoad = function() {

    this.loadCount++;

    // Skip first load of hosted widget OR timeout call.
    if (this.loadCount !== 2) {
        return;
    }

    this.deactivate();

    var that = this;
    setTimeout(function() {
        hidePlaceholderThumbnail(that.widget);
    }, iframely.LAZY_IFRAME_FADE_TIMEOUT);
};

WaitingWidget.prototype.deactivate = function() {
    this.clearLoadingTimeout();
    removeWaitingWidget(this);
};

WaitingWidget.prototype.clearLoadingTimeout = function() {
    this.timeoutId && clearTimeout(this.timeoutId);
    this.timeoutId = null;
};

WaitingWidget.prototype.registerLoadingTimeout = function() {
    if (this.timeoutId) {
        return;
    }
    var that = this;
    this.timeoutId = setTimeout(function() {
        that.iframeOnLoad();
    }, iframely.LAZY_IFRAME_SHOW_TIMEOUT);
};