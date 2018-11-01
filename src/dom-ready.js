// TODO: rename core.js to ready.js?

var iframely = require('./iframely');

var DOMReady = function(f) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Run always (in case of async script).
        setTimeout(f, 0);
    }
    document['addEventListener'] ? document['addEventListener']('DOMContentLoaded', f) : window.attachEvent('onload', f);
};

DOMReady(function() {

    // Called each time on script load
    iframely.trigger('load');
});