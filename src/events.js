var iframely = require('./iframely');

var nextTick = (function(window, prefixes, i, fnc) {
    while (!fnc && i < prefixes.length) {
        fnc = window[prefixes[i++] + 'equestAnimationFrame'];
    }
    return (fnc && fnc.bind(window)) || window.setImmediate || function(fnc) {window.setTimeout(fnc, 0);};
})(typeof window !== 'undefined' ? window : global, 'r webkitR mozR msR oR'.split(' '), 0);

var callbacksStack = {};
iframely.on = function(event, cb) {
    var events = callbacksStack[event] = callbacksStack[event] || [];
    events.push(cb);
};

function trigger(event, async, args) {
    var events = callbacksStack[event] || [];
    events.forEach(function(cb) {
        if (async) {
            nextTick(function() {
                cb.apply(iframely, args);
            });
        } else {
            cb.apply(iframely, args);
        }
    });

    if (event === 'init') {
        // everything inited, let's clear the callstack, just in case
        // TODO: not good.
        callbacksStack[event] = [];
    }
}

iframely.trigger = function(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    trigger(event, false, args);
};

iframely.triggerAsync = function(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    trigger(event, true, args);
};