var iframely = require('./iframely');
var messaging = require('./messaging');

iframely.on('init', function() {


    iframely.extendOptions(parseQueryStringFromScriptSrc());
    // if it's hosted from elsewhere - we don't support customizing via query-string. 
    // iframely.CDN will be default one unless changed by user (?cdn= or iframely.CDN= )

    defineDefaultStyles();

    requestSizeOfExistingIframes(iframely.DOMAINS.concat(iframely.CDN.replace(/^https?:\/\//, '')));
    
});

iframely.load = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('load');
    iframely.trigger.apply(this, args);
};

var getIframeWrapper = exports.getIframeWrapper = function(iframe, checkClass) {

    var aspectWrapper = iframe.parentNode;

    if (!aspectWrapper
        || aspectWrapper.nodeName !== 'DIV'
        || nonTextChildCount(aspectWrapper) > 2 /* 2 is lazy-cover */
        || (checkClass && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS)
        || (!checkClass && aspectWrapper.style.position !== 'relative' && aspectWrapper.getAttribute('class') !== iframely.ASPECT_WRAPPER_CLASS)) {
        return;
    }

    var maxWidthWrapper = aspectWrapper.parentNode;

    if (!maxWidthWrapper
        || maxWidthWrapper.nodeName !== 'DIV'
        || nonTextChildCount(maxWidthWrapper) > 1
        || (checkClass && maxWidthWrapper.getAttribute('class') !== iframely.MAXWIDTH_WRAPPER_CLASS)
        || (!checkClass && maxWidthWrapper.getAttribute('class') && !maxWidthWrapper.getAttribute('class').match(/iframely/i) /* users can modify class */)
    ) {
        return;
    }

    return {
        aspectWrapper: aspectWrapper,
        maxWidthWrapper: maxWidthWrapper
    };
};

exports.addDefaultWrappers = function(el) {
    var parentNode = el.parentNode;

    var maxWidthWrapper = document.createElement('div');
    maxWidthWrapper.className = iframely.MAXWIDTH_WRAPPER_CLASS;

    var aspectWrapper = document.createElement('div');
    aspectWrapper.className = iframely.ASPECT_WRAPPER_CLASS;

    maxWidthWrapper.appendChild(aspectWrapper);

    parentNode.insertBefore(maxWidthWrapper, el);

    return {
        aspectWrapper: aspectWrapper,
        maxWidthWrapper: maxWidthWrapper
    };
};

exports.getIframeWidget = function(iframe) {
    var wrapper = getIframeWrapper(iframe);
    if (!wrapper) {
        return;
    }
    return {
        iframe: iframe,
        aspectWrapper: wrapper.aspectWrapper,
        maxWidthWrapper: wrapper.maxWidthWrapper
    };
};

iframely.getElementComputedStyle = function(el, style) {
    return window.getComputedStyle && window.getComputedStyle(el).getPropertyValue(style);
};

exports.setStyles = function(el, styles) {
    if (el) { // let's check it's still defined, just in case
        Object.keys(styles).forEach(function(key) {

            var value = styles[key];
            if (typeof value === 'number' || (typeof value === 'string' && /^(\d+)?\.?(\d+)?$/.test(value))) {
                value = value + 'px';
            }

            if (!window.getComputedStyle ||
                // don't change CSS values in pixels, such as height:0
                (iframely.getElementComputedStyle(el, key) != value
                // && don't set default aspect ratio if it's defined in CSS anyway
                && !(el.className == 'iframely-responsive' && key === 'paddingBottom' && !el.style[key] && /^56\.2\d+%$/.test(value)))) {

                el.style[key] = value || ''; // remove style that is no longer needed
            }
        });
    }
};

function defineDefaultStyles() {

    var iframelyStylesId = 'iframely-styles';
    var styles = document.getElementById(iframelyStylesId);

    if (!styles) {
        // copy-paste default styles from https://iframely.com/docs/omit-css
        var iframelyStyles = '.iframely-responsive{top:0;left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;box-sizing:content-box;}.iframely-responsive>*{top:0;left:0;width:100%;height:100%;position:absolute;border:0;box-sizing:content-box;}';

        styles = document.createElement('style');
        styles.id = iframelyStylesId;
        styles.type = 'text/css';
        if (styles.styleSheet) {
            // IE.
            styles.styleSheet.cssText = iframelyStyles;
        } else {
            styles.innerHTML = iframelyStyles;
        }
        document.getElementsByTagName('head')[0].appendChild(styles);
    }
}


var addQueryString = exports.addQueryString = function(href, options) {

    var query_string = '';

    Object.keys(options).forEach(function(key) {
        var value = options[key];

        // array is used e.g. for import: uris and ids
        if (Object.prototype.toString.call(value) === '[object Array]') {

            var values = value.map(function(uri) {
                return key + '=' + encodeURIComponent(uri);
            });
            query_string += '&' + values.join('&');            

        } else if (typeof value !== 'undefined' && href.indexOf(key + '=') === -1 ) { // set explicitely in options, skip undefines

            if (value === true) {
                value = 1;
            }

            if (value === false) {
                value = 0;
            }            

            query_string += '&' + key + '=' + encodeURIComponent(value);
        }

    });

    return href + (query_string !== '' ? (href.indexOf('?') > -1 ? '&' : '?') + query_string.replace(/^&/, '') : '');
};

exports.getEndpoint = function(src, options, config_params) {

    var endpoint = src;

    if (!/^(https?:)?\/\//i.test(src)) {
        endpoint = (options.CDN || iframely.CDN) + endpoint;
        delete options.CDN;
    }

    if (!/^(?:https?:)?\/\//i.test(endpoint)) {
        endpoint = '//' + endpoint;
    }    

    if (options) {
        endpoint = addQueryString(endpoint, options);
    }

    // get additional params from config
    if (config_params && config_params.length) {

        var more_options = {};
        for (var i = 0; i < config_params.length; i++) {
            if (typeof iframely.config[config_params[i]] !== 'undefined') {
                more_options[config_params[i]] = iframely.config[config_params[i]];
            }
        }

        endpoint = addQueryString(endpoint, more_options);
    }


    if (/^(https?:)?\/\//i.test(endpoint) && !endpoint.match(/^(https?:)?\/\//i)[1] && document.location.protocol === 'file:') {        
        endpoint = 'http:' + endpoint;
    }

    return endpoint;
};

// helper method to init more options through js code
iframely.extendOptions = function(options) {

    options && Object.keys(options).forEach(function(key) {
        var new_value = (
            options[key] === 0 || options[key] === '0' || options[key] === false || options[key] === 'false'
                ? false : (options[key] === 1 || options[key] === '1' || options[key] === true || options[key] === 'true'
                    ? true : options[key]));

        if (iframely.config[key] !== false) { // set new value only when undefined or not previously disabled
            iframely.config[key] = new_value;
        }
    });

};  

function parseQueryStringFromScriptSrc() {

    // Extract global iframely params.
    var scripts = document.querySelectorAll('script[src*="embed.js"], script[src*="iframely.js"]');

    for(var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src').replace(/&amp;/gi, '&');

        if (iframely.SCRIPT_RE.test(src)) { // found the script on custom origin or default Iframely CDN

            var options = parseQueryString(src, iframely.SUPPORTED_QUERY_STRING.concat('cdn'));

            var m2 = src.match(iframely.CDN_RE);
            if (m2 || options.cdn) { // ignore non-Iframely hosts such as s.imgur.com/min/embed.js
                iframely.CDN =  options.cdn || m2[1];
            }

            if (Object.keys(options).length > 0) {
                // give preferrence to CDN from scripts that have query-string. 
                // CDN is most critical for embeds with empty data-iframely-url
                // and those should have at least ?api_key... in script src

                return options;
            } // or keep searching
        }
    }
    // should have exited by now if any querystring found...
    return {};
}

function requestSizeOfExistingIframes(domains) {

    var iframes = document.querySelectorAll('iframe[src*="' + (domains || iframely.DOMAINS).join('"], iframe[src*="') + '"]');
    for(var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        var src = iframe.src;
        if (src.match(/^(https?:)?\/\/[^/]+\/api\/iframe\?.+/)
            || src.match(/^(https?:)?\/\/[^/]+\/\w+(\?.*)?$/)) {
            messaging.postMessage({
                method: 'getSize'
            }, '*', iframe.contentWindow);
        }
    }
}        

function nonTextChildCount(element) {
    var count = 0;
    for(var i = 0; i < element.childNodes.length; i++) {
        var el = element.childNodes[i];
        if (el.nodeType === Node.TEXT_NODE) {
            var text = el.textContent || el.innerText;
            text = text.replace(/\s|\n/g, '');
            if (text) {
                // Do not skip text node with text.
                count++;
            }
        } else if (el.nodeType === Node.ELEMENT_NODE) {
            count++;
        }
    }
    return count;
}

var parseQueryString = exports.parseQueryString = function(url, allowed_query_string) {
    var query = url.match(/\?(.+)/i);
    if (query) {
        query = query[1];
        var data = query.split('&');
        var result = {};
        for(var i=0; i<data.length; i++) {
            var item = data[i].split('=');
            if (!allowed_query_string || allowed_query_string.indexOf(item[0]) > -1) {
                result[item[0]] = decodeURIComponent(item[1]);
            }
        }
        return result;
    } else {
        return {};
    }
};