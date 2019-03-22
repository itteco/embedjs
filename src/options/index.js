var iframely = require('../iframely');
var formBuilder = require('./form-builder');
var renderer = require('./renderer');

iframely.buildOptionsForm = function(id, formContainer, options) {
    formBuilder({
        id:             id,
        formContainer:  formContainer,
        options:        options,                        
        renderer:       renderer
    });
};