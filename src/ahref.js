var utils = require('./utils');
var iframely = require('./iframely');

iframely.on('load', function(container, href) {
    if (container && container.nodeName && typeof href === 'string') {
        var a = document.createElement('a');
        a.setAttribute('href', href);
        container.appendChild(a);
        iframely.trigger('load', a);
    }
});

iframely.on('load', function(el) {

    if (!el && !iframely.import) { 

        var elements = document.querySelectorAll('a[data-iframely-url]:not([data-import-uri])');
        for(var i = 0; i < elements.length; i++) {
            iframely.trigger('load', elements[i]);
        }
    }
    
});

iframely.on('load', function(el) {

    if (el && el.nodeName === 'A' && (el.getAttribute('data-iframely-url') || el.getAttribute('href')) && !el.hasAttribute('data-import-uri')) {
        unfurl(el);
    }
    
});

function unfurl(el) {
    if (!el.getAttribute('data-iframely-url') && !el.getAttribute('href')) {
        return; // isn't valid
    }
    var src;

    var dataIframelyUrl = el.getAttribute('data-iframely-url');
    if (dataIframelyUrl && /^((?:https?:)?\/\/[^/]+)\/\w+/i.test(dataIframelyUrl)) {
        src = utils.getEndpoint(dataIframelyUrl, {
            v: iframely.VERSION,
            app: 1
        });
    } else if ((iframely.config.api_key || iframely.config.key) && iframely.CDN) {
        src = utils.getEndpoint('/api/iframe', {
            url: el.getAttribute('href'),
            v: iframely.VERSION,
            app: 1
        }, iframely.SUPPORTED_QUERY_STRING);
    } else {
        console.warn('Iframely cannot build embeds: api key is required as query-string of embed.js');
    }

    if (!src) {
        el.removeAttribute('data-iframely-url');    
    } else {

        var iframe = document.createElement('iframe');

        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'autoplay; encrypted-media');

        if (el.hasAttribute('data-img')) {
            iframe.setAttribute('data-img', el.getAttribute('data-img'));
        }

        var isLazy = el.hasAttribute('data-lazy') || el.hasAttribute('data-img') || /&lazy=1/.test(src) || iframely.config.lazy;

        // support restoring failed links by its text
        var text = el.textContent || el.innerText;
        
        if (text && text !== '') {
            iframe.textContent = text;
        }        

        var wrapper = utils.getIframeWrapper(el, true);
            
        if (wrapper) {

            // Delete all in aspect wrapper.
            while (wrapper.aspectWrapper.lastChild) {
                wrapper.aspectWrapper.removeChild(wrapper.aspectWrapper.lastChild);
            }

        } else {
            wrapper = utils.addDefaultWrappers(el);

            var parentNode = el.parentNode;
            parentNode.removeChild(el);
        }

        wrapper.aspectWrapper.appendChild(iframe);

        if (isLazy) {
            
            // send to lazy iframe flow
            iframe.setAttribute('data-iframely-url', src);
            iframely.trigger('load', iframe);

        } else {

            iframe.setAttribute('src', src);
            iframely.trigger('iframe-ready', iframe);			
        }


    }


}