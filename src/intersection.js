var messaging = require('./messaging');
var iframely = require('./iframely');

var observers = {};
var initializedIframesByOptions = {};

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
    if (options && options.threshold) {
        result.threshold = options.threshold;
    }
    if (options && options.margin) {
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

            var options = message.options;

            if (!options) {
                options = {
                    margin: 1000
                };
            }

            // Prevent double iframe initialization.
            var optionsKey = JSON.stringify(options);
            var initializedIframes = initializedIframesByOptions[optionsKey] = initializedIframesByOptions[optionsKey] || [];
            if (initializedIframes.indexOf(widget.iframe) > -1) {
                // Skip initialized iframe.
                return;
            }
            initializedIframes.push(widget.iframe);
            
            getObserver(options).observe(widget.iframe);
        }
    });
}
