var playerjs = require('player.js');
var iframely = require('./iframely');

var options = {
    threshold: 1    // 100% visible.
};

// only one observer instance is enough;
var observer;

function getObserver() {
    return observer || new IntersectionObserver(callback, options);
}

var players = [];

function findPlayer(iframe) {
    var i = 0;
    var result;
    while(i < players.length && !result) {
        if (players[i].elem === iframe) {
            result = players[i];
        }
        i++;
    }
    return result;
}

function callback(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            var player = findPlayer(entry.target);
            player && player.play();
        }
    });
}

if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window) {
        iframely.on('iframe-ready', function(iframe) {
            var player = new playerjs.Player(iframe);
            player.on('ready', function() {
                players.push(player);
                getObserver().observe(iframe);
            });
        });
}