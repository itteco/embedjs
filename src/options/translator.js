/*
To add more languages to the translator -
see ./lang/labels.LAN.example.js

 - use the template for the list of currently available labels
 - save it as labels.LAN.js  // replace LAN with your actual value, e.g. es, de, ru, etc.
 - fill in the labels translations
 - add to webpack config options as 
	'options.i18n.fr': './options/lang/labels.fr.js' 
	(see webpack.common.js as example)

You can then call iframely.optionsTranslator('LAN') - with your chosen language - to build the options form

You don't need to translate all the labels. The ones without a translation will be left as-is
*/

var iframely = require('../iframely');

var langs = {};

exports.registerLabels = function(lang, labels) {
    var existingLabels = langs[lang] = langs[lang] || {};
    Object.assign(existingLabels, labels);
};

iframely.optionsTranslator = function(lang) {
    return function (label) {
        return langs[lang] && langs[lang][label] && langs[lang][label] !== '' ? langs[lang][label] : label;
    };
};