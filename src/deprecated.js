var iframely = require('./iframely');

// deprecated. Helper function only, for the reverse compatibility.
iframely.widgets = iframely.widgets || {};
iframely.widgets.load = iframely.load;

if (!iframely.events) {
    iframely.events = {};
    iframely.events.on = iframely.on;
    iframely.events.trigger = iframely.trigger;
}