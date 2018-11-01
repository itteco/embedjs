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

    parentNode.removeChild(naNode);

    // TODO: let's forget about the need to re-create a link if people had it as <a>text</a>, not empty one
    // If we need to return that logic, we'll simply create another <a> with params from `widget`
};