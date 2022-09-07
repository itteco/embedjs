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
    var dataImg = el.hasAttribute('data-img-created') || el.hasAttribute('data-img');
    var nativeLazyLoad = !dataImg && iframely.SUPPORT_IFRAME_LOADING_ATTR;

    if (widget && src) {

        var options = {
            v: iframely.VERSION,
            app: 1, // for example, will fall back to summary card if media is not longer available
            theme: iframely.config.theme
        };

        if (!nativeLazyLoad && iframely.config.intersection) {
            options.lazy = 1;
        }

        src = utils.getEndpoint(src, options);

    }

    if (nativeLazyLoad) {
        el.setAttribute('loading', 'lazy');
    }

    if (dataImg && iframely.SUPPORT_IFRAME_LOADING_ATTR) {
        // Disable lazy load with `data-img`.
        el.setAttribute('loading', 'edge');
    }

    el.setAttribute('src', src);
    el.removeAttribute('data-iframely-url');

    iframely.trigger('iframe-ready', el);
}