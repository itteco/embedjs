var iframely = require('./iframely');

// deprecated. Helper function only, for the reverse compatibility.
iframely.widgets = iframely.widgets || {};
iframely.widgets.load = iframely.load;

if (!iframely.events) {
    iframely.events = {};
    iframely.events.on = iframely.on;
    iframely.events.trigger = iframely.trigger;
}

iframely.on('cancel', function(url, parentNode, text, nextSibling) {
    if (url && parentNode && text && text !== '') {
        var a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
        a.textContent = text;
        if (nextSibling) {
            parentNode.insertBefore(a, nextSibling);
        } else {
            parentNode.appendChild(a);
        }
    }
});