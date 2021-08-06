var iframely = require('./iframely');

iframely.on('message', function(widget, message) {
    if (message.method === 'open-href' || message.method === 'click') {
        iframely.trigger(message.method, message.href);
    }
});

/**
 * Allows redefine `openHref` in following way:
 * 
 *  iframely.openHref = function(href) {
 *      if (allowUsualOpen(href)) {
 *          // Default `iframely` workflow.
 *          return true;
 *      }
 *      if (needCustomOpen(href)) {
 *          // Custom user workflow.
 *          customOpenHref(href);
 *      }
 * 
 *      // Prevent open link.
 *      return false;   // Or any falsy value.
 *  };
 */

iframely.on('open-href', function(href) {

    iframely.triggerAsync('click', href);

    var allowOpen = true;

    if (typeof iframely.openHref === 'function') {
        // Usual flow only if `true` returned.
        allowOpen = iframely.openHref(href);
    }

    if (allowOpen) {
        if (href.indexOf(window.location.origin) === 0) {
            // Redirect top on same origin.
            window.location.href = href;
        } else {
            // Open new tab on another origin.
            window.open(href, '_blank', 'noopener');
        }
    }
});