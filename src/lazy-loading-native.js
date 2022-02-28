function getChromeVersion() {     
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
}
var chromeVersion = getChromeVersion();

var iframely = require('./iframely');
iframely.SUPPORT_IFRAME_LOADING_ATTR = chromeVersion && chromeVersion >= 77;