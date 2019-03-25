/*
To add more languages to the translator -
 - use this template for the list of currently available labels
 - save it as labels.LAN.js  // replace LAN with your actual value, e.g. es, de, ru, etc.
 - replaces `iframely.labels['LAN'] = {` to match the language you're adding
 - fill in the labels translations
 - and require it within ./options/translator.js to add to the build

You can then call iframely.optionsTranslator('LAN') - with your chosen language - to build the options form

You don't need to translate all the labels. The ones without a translation will be left as-is
*/

var translator = require('../translator');

var lang ='LAN';

var labels = {
    // general options
    'Slimmer horizontal player': '',
    'Include playlist': '',
    'Hide artwork': '',
    'Theme color': '',
    'Light': '',
    'Dark': '',
    'Auto': '',
    'Default': '',
    'Adjust height': '',
    'Active page': '',

    // Codepen
    'Use click-to-load': '',
    'ex.: 600, in px': '',

    //Instagram
    'Hide timed comments': '',

    //Soundcloud
    'Let Iframely optimize player for the artwork': '',

    // scribd
    'Show as slideshow': '',

    // youtube
    'Start from': '',
    'ex.: 11, 1m10s': '',
    'End on': 'Fin sur',

    // twitter
    'Include up to 20 tweets': '',
    'Hide photos, videos, and cards': '',
    'Hide previous Tweet in conversation thread': '',

    // pinterest
    'Hide description': '',

    //mixcloud
    'Widget style': '',
    'Mini': '', 
    'Classic': '',
    'Picture': '',

    //google maps
    'Zoom': '',
    'Map orientation': '',
    'Album': '',
    'Portrait': '',
    'Square': '',

    // Flickr
    'Show context slideshow': '',
    'Show description footer': '',
    'Show user header': '',

    //facebook
    'Show author\'s text caption': '',
    'Hide author\'s text caption': '',
    'Include parent comment (if url is a reply)': '',

    'Show recent posts': '',
    'Show profile photos when friends like this': '',
    'Use the small header instead': '',

    //bandcamp
    'Artwork': '',
    'Small': '',
    'Big': '',
    'None': '',

    'Layout': '',
    'Slim': '',
    'Artwork-only': '',
    'Standard': '',

    //omny.fm
    'Size & style': '',
    'Wide image': '',
    'Wide simple': '',


    //iframely options
    'Hold load & play until clicked': '',
    'Make it a small card': '',
    //iframely media cards
    'Keep using full media card': '',
    'Don\'t include attached player': '',
    'Attached player only, no card': '',
    //iframely media=1
    'Just the player': '',
    'Just the image': ''
};

translator.registerLabels(lang, labels);