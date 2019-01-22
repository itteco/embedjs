var iframely = require('./iframely');

iframely.on('message', function(widget, message) {
    if (message.method === 'cancelWidget') {   
        iframely.cancelWidget(widget);
    }
});

iframely.cancelWidget = function(widget) {

    if (!widget) {
        console.warn('iframely.cancelWidget called without widget param');
        return;
    }

    function findParent(el, className) {
        var found = false;
        while(!found && el.parentNode) {
            el = el.parentNode;
            found = el.className && el.className.split(' ').indexOf(className) >= 0;
        }
        return found && el;
    }

    var parentNode = widget.maxWidthWrapper && widget.maxWidthWrapper.parentNode;
    var naNode = widget.maxWidthWrapper;

    // Try remove by parentClass first.
    if (iframely.config && iframely.config.parent) {
        // Remove by parent class.
        var parentElement = findParent(widget.maxWidthWrapper, iframely.config.parent);

        if (parentElement) {
            parentNode = parentElement.parentNode;
            naNode = parentElement;
        }
    }

    if (widget.url) {
        var text = widget.iframe && (widget.iframe.textContent || widget.iframe.innerText);

        iframely.triggerAsync('cancel', widget.url, parentNode, text, naNode.nextSibling);
    }
    // Re-creating a link if people had it as <a>text</a> is now deprecated (see in deprecated.js)
    // New use: iframely.on('cancel', function(url, parentNode, text) {...} );

    parentNode.removeChild(naNode);
};