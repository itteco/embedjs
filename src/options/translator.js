/*
To add more languages to the translator -
see labels.LAN.example.js

 - use the template for the list of currently available labels
 - save it as labels.LAN.js  // replace LAN with your actual value, e.g. es, de, ru, etc.
 - replaces `iframely.labels['LAN'] = {` to match the language you're adding
 - fill in the labels translations
 - and require it here in translator.js to add to the build

You can then call iframely.optionsTranslator('LAN') - with your chosen language - to build the options form

You don't need to translate all the labels. The ones without a translation will be left as-is
*/

var iframely = require('../iframely');
require('./lang/labels.fr.js');

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