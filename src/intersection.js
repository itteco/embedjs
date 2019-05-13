var messaging = require('./messaging');
var iframely = require('./iframely');

var observers = {};

function getObserver(options) {
    var optionsKey = JSON.stringify(options);
    var observer = observers[optionsKey];
    if (!observer) {

        observer = new IntersectionObserver(function(entries) {

            entries.forEach(function(entry) {
                messaging.postMessage({
                    method: 'intersection',
                    entry: {
                        isIntersecting: entry.isIntersecting
                    },
                    options: options
                }, '*', entry.target.contentWindow);
            });

        }, getObserverOptions(options));

        observers[optionsKey] = observer;
    }
    return observer;
}

function getObserverOptions(options) {
    var result = {};
    if (options.threshold) {
        result.threshold = options.threshold;
    }
    if (options.margin) {
        result.rootMargin = options.margin + 'px ' + options.margin + 'px ' + options.margin + 'px ' + options.margin + 'px';
    }
    return result;
}

if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window) {

    iframely.on('init', function() {

        iframely.extendOptions({
            intersection: 1
        });
    
    });

    iframely.on('message', function(widget, message) {
        if (message.method === 'send-intersections' && widget.iframe) {
            if (message.options) {
                getObserver(message.options).observe(widget.iframe);
            } else {
                // Old widgets.
                getObserver({
                    margin: 1000
                }).observe(widget.iframe);
            }
        }
    });
}
