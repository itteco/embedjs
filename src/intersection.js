var messaging = require('./messaging');
var iframely = require('./iframely');

var options = {
    rootMargin: '1000px 1000px 1000px 1000px'
    // threshold: 0
};

// only one observer instance is enough;
var observer;

function getObserver() {
    return observer || new IntersectionObserver(callback, options);
}    

function callback(entries) {
    entries.forEach(function(entry) {
        
        messaging.postMessage({
            method: 'intersection',
            entry: {
                isIntersecting: entry.isIntersecting
            }
        }, '*', entry.target.contentWindow);

        if (entry.isIntersecting) {
            getObserver().unobserve(entry.target);
        }
    });
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
            getObserver().observe(widget.iframe);
        }
    });
}
