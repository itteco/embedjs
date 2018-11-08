var utils = require('./utils');
var iframely = require('./iframely');

// Need 'load' handler here instead of on('init') - we load lazy iframes only when DOM ready.
iframely.on('load', function(el) {    

    if (!el) { // initial load

        var elements = document.querySelectorAll('iframe[data-iframely-url]');
        for(var i = 0; i < elements.length; i++) {
            iframely.trigger('load', elements[i]);
        }    
    }
    
});

iframely.on('load', function(el) {

    if (el && el.nodeName === 'IFRAME'
        && el.hasAttribute('data-iframely-url')
        && !el.hasAttribute('data-img')
        && !el.getAttribute('src')) {

        loadLazyIframe(el);
    }
    
});


function loadLazyIframe(el) {

    var widget = utils.getWidget(el);
    var src = el.getAttribute('data-iframely-url');

    if (widget && src) { 

        src = utils.getEndpoint(src, {
            lazy: iframely.config.intersection,
            v: iframely.VERSION,
            app: 1 // for example, will fall back to summary card if media is not longer available
        });

    } 

    el.setAttribute('src', src);
    el.removeAttribute('data-iframely-url');

    iframely.trigger('iframe-ready', el);
}