var iframely = require('./iframely');
var messaging = require('./messaging');

function setThemeInIframe(iframe, theme) {
    messaging.postMessage({
        method: 'setTheme',
        data: theme
    }, '*', iframe.contentWindow);
}

function setThemeInAllIframes(theme) {
    var iframes = document.getElementsByTagName('iframe');
    for(var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        setThemeInIframe(iframe, theme);
    }
}

iframely.setTheme = function(theme) {
    if (theme && iframely.SUPPORTED_THEMES.indexOf(theme) > -1) {
        // Send get param to next iframes.
        iframely.extendOptions({
            theme: theme
        });
        setThemeInAllIframes(theme);
        iframely.trigger('set-theme', theme);
        // TODO: set theme in future iframes? - single iframe theme api for user?
    } else {
        console.warn('Using iframely.setTheme with not supported theme: "' + theme + '". Supported themes are: ' + iframely.SUPPORTED_THEMES.join(', '));
    }
};