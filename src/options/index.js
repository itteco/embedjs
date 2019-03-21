var iframely = require('../iframely');
var formBuilder = require('./form-builder');
var renderer = require('./renderer');

iframely.buildOptionsForm = function(params) {
    formBuilder({
        id:             params.id,
        formContainer:  params.formContainer,
        options:        params.options,                        
        renderer:       renderer
    });
};