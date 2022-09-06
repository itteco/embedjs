require('./dom-ready');

var iframely = require('./iframely');

if (!iframely._loaded) {

    iframely._loaded = true;

    require('./const');
    require('./events');
    // require('./utils');      // Loaded by other modules.
    require('./intersection');
    require('./theme');
    require('./import');
    require('./ahref');
    require('./lazy-img-placeholder');
    require('./lazy-iframe');
    // require('./messaging');  // Loaded by other modules.
    require('./widget-cancel');
    require('./widget-resize');
    require('./widget-click');
    require('./widget-options');
    require('./deprecated');
    require('./lazy-loading-native');

    iframely.trigger('init'); 
}

exports.iframely = iframely;