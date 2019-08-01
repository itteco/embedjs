var iframely = require('./iframely');

iframely.on('message', function(widget, message) {
    if (message.method === 'open-href' || message.method === 'click') {
        iframely.trigger(message.method, message.href);
    }
});

iframely.on('open-href', function(href) {

    iframely.triggerAsync('click', href);

    if (href.indexOf(window.location.origin) === 0) {
        // Redirect top on same origin.
        window.location.href = href;
    } else {
        // Open new tab on another origin.
        window.open(href, '_blank', 'noopener');
    }
});