var messaging = require('./messaging');
var iframely = require('./iframely');

var nearViewportOptions = {
    rootMargin: '1000px 1000px 1000px 1000px'
    // threshold: 0
};

var fullyVisibleOptions = {
    threshold: 1    // 100% visible.
};


// only one observer instance is enough;
var nearViewportObserver;
var fullyVisibleViewportObserver;

function getNearViewportObserver() {
    nearViewportObserver = nearViewportObserver || new IntersectionObserver(nearViewportCallback, nearViewportOptions);
    return nearViewportObserver;
}

function getFullyVisibleViewportObserver() {
    fullyVisibleViewportObserver = fullyVisibleViewportObserver || new IntersectionObserver(fullyVisibleViewportCallback, fullyVisibleOptions);
    return fullyVisibleViewportObserver;
}

function nearViewportCallback(entries) {
    entries.forEach(function(entry) {

        messaging.postMessage({
            method: 'intersection',
            entry: {
                isIntersecting: entry.isIntersecting
            }
        }, '*', entry.target.contentWindow);

        if (entry.isIntersecting) {
            // Send only once.
            getNearViewportObserver().unobserve(entry.target);
        }
    });
}

function fullyVisibleViewportCallback(entries) {
    entries.forEach(function(entry) {
        // Send every time to play on scroll.
        messaging.postMessage({
            method: 'intersection',
            entry: {
                isIntersecting: entry.isIntersecting,
                visibility: 'full'
            }
        }, '*', entry.target.contentWindow);
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
            if (message.visibility === 'full') {
                getFullyVisibleViewportObserver().observe(widget.iframe);
            } else {
                getNearViewportObserver().observe(widget.iframe);
            }
        }
    });
}
