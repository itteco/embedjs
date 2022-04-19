var iframely = require('./iframely');
var messaging = require('./messaging');

function setThemeInIframe(iframe, theme) {
    messaging.postMessage({
        method: 'setTheme',
        data: theme
    }, '*', iframe.contentWindow);
}

function setThemeInAllIframes(parent, theme) {
    var iframes = parent.getElementsByTagName('iframe');
    for(var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        setThemeInIframe(iframe, theme);
    }
}

iframely.setTheme = function(theme, container) {
    if (theme && iframely.SUPPORTED_THEMES.indexOf(theme) > -1) {
        if (container) {
            if (container.tagName === 'IFRAME') {
                setThemeInIframe(container, theme);
            } else {
                setThemeInAllIframes(container, theme);
            }
        } else {
            // Send get param to next iframes.
            iframely.extendOptions({
                theme: theme
            });
            setThemeInAllIframes(document, theme);
            iframely.trigger('set-theme', theme);
        }
    } else {
        console.warn('Using iframely.setTheme with not supported theme: "' + theme + '". Supported themes are: ' + iframely.SUPPORTED_THEMES.join(', '));
    }
};