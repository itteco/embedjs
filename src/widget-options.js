var iframely = require('./iframely');

iframely.on('message', function(widget, message) {
    if (message.method === 'setIframelyEmbedOptions') {
        // console.log('setIframelyEmbedOptions', message.data);
        iframely.trigger('options', widget, message.data);
    }
});