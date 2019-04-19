var iframely = require('../iframely');
var formBuilder = require('./form-builder');
var renderer = require('./renderer');

iframely.buildOptionsForm = function(id, formContainer, options, translator) {
    formBuilder({
        id:             id,
        formContainer:  formContainer,
        options:        options,
        renderer:       renderer,
        translator:     translator
    });
};

exports.iframely = iframely;