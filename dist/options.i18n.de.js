/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./iframely.js"
/*!*********************!*\
  !*** ./iframely.js ***!
  \*********************/
(module) {

eval("{var iframely = window.iframely = window.iframely || {};\niframely.config = iframely.config || {};\n\nmodule.exports = iframely;\n\n//# sourceURL=webpack:///./iframely.js?\n}");

/***/ },

/***/ "./options/lang/labels.de.js"
/*!***********************************!*\
  !*** ./options/lang/labels.de.js ***!
  \***********************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

eval("{var translator = __webpack_require__(/*! ../translator */ \"./options/translator.js\");\n\nvar lang ='de';\n\nvar labels = {\n    // general options\n    'Slimmer horizontal player': 'Schlanker horizontaler Player',\n    'Include playlist': 'Wiedergabeliste anzeigen',\n    'Hide artwork': 'Artwork ausblenden',\n    'Theme color': 'Theme Farbe',\n    'Light': 'Hell',\n    'Dark': 'Dunkel',\n    'Auto': 'Automatisch',\n    'Default': 'Standard',\n    'Adjust height': 'Höhe einstellen',\n    'Active page': 'Aktive Seite',\n\n    // Codepen\n    'Use click-to-load': 'Verwende click-to-load',\n    'ex.: 600, in px': 'Z.B. 600, in px',\n\n    //Instagram\n    'Hide timed comments': 'Kommentare ausblenden',\n\n    //Soundcloud\n    'Let Iframely optimize player for the artwork': 'Optimierung des Players durch IFramely',\n\n    // scribd\n    'Show as slideshow': 'Als Slideshow zeigen',\n\n    // youtube\n    'Start from': 'Start ab',\n    'ex.: 11, 1m10s': 'z.B. 11, 1m10s',\n    'End on': 'Ende an',\n    'Closed captions': 'Untertitel',\n\n    // twitter\n    'Include up to 20 tweets': 'Bis zu 20 Tweets anzeigen',\n    'Hide photos, videos, and cards': 'Verberge Fotos, Videos und Cards',\n    'Hide previous Tweet in conversation thread': 'Verberge den vorigen Tweet in der Konversation',\n    'Use dark theme': 'Verwende dunkles Farbschema',\n    'Adjust width': 'Breite anpassen',\n\n    // pinterest\n    'Hide description': 'Beschreibung verbergen',\n\n    //mixcloud\n    'Widget style': 'Widget-Style',\n    'Mini': 'Mini',\n    'Classic': 'Klassisch',\n    'Picture': 'Bild',\n\n    //google maps\n    'Zoom': 'Zoom',\n    'Map orientation': 'Karten-Ausrichtung',\n    'Album': 'Album',\n    'Portrait': 'Portrait',\n    'Square': 'Quadratisch',\n\n    // Flickr\n    'Show context slideshow': 'Als Slideshow anzeigen',\n    'Show description footer': 'Fußzeile anzeigen',\n    'Show user header': 'Kopfbereich anzeigen',\n\n    //facebook\n    'Show author\\'s text caption': 'Beschriftung des Autors anzeigen',\n    'Hide author\\'s text caption': 'Beschriftung des Autors verbergen',\n    'Include parent comment (if url is a reply)': 'Ursprünglichen Kommentar einschließen (wenn die Url eine Antwort ist)',\n\n    'Show recent posts': 'Neueste Beiträge anzeigen',\n    'Show profile photos when friends like this': 'Profilfotos anzeigen, wenn Freunde dies mögen',\n    'Use the small header instead': 'Kleine Kopfzeile stattdessen verwenden',\n\n    //bandcamp\n    'Artwork': 'Artwork',\n    'Small': 'klein',\n    'Big': 'groß',\n    'None': 'Keines',\n\n    'Layout': 'Layout',\n    'Slim': 'Schlank',\n    'Artwork-only': 'Nur Artwork',\n    'Standard': 'Standard',\n\n    //omny.fm\n    'Size & style': 'Größe & Stil',\n    'Wide image': 'Breite Darstellung',\n    'Wide simple': 'Breite Darstellung (Einfach)',\n\n     // Vimeo\n    'Text language (ignored if no captions)': 'Sprache der Untertitel (wird ignoriert, wenn keine Untertitel vorhanden)',\n    'Two letters: en, fr, es, de...': 'Zwei Buchstaben: en, fr, es, de...',\n    \n     // Kickstarter\n    'Don\\'t include attached player': 'Player nicht integrieren',\n    'Attached player only, no card': 'Nur Player, keine Card',\n\n    //iframely options\n    'Hold load & play until clicked': 'Klicken zum Abspielen',\n    'Make it a small card': 'Kleine Card verwenden',\n    //iframely media cards\n    'Keep using full media card': 'Verwende weiterhin vollständige Media-Cards',\n    'Don\\'t include player': 'Player nicht hinzufügen',\n    'Player only, no card': 'Nur Player, keine Card',\n    //iframely media=1\n    'Just the player': 'Nur Player',\n    'Just the image': 'Nur Bild'\n};\n\ntranslator.registerLabels(lang, labels);\n\n\n//# sourceURL=webpack:///./options/lang/labels.de.js?\n}");

/***/ },

/***/ "./options/translator.js"
/*!*******************************!*\
  !*** ./options/translator.js ***!
  \*******************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{/*\nTo add more languages to the translator -\nsee ./lang/labels.LAN.example.js\n\n - use the template for the list of currently available labels\n - save it as labels.LAN.js  // replace LAN with your actual value, e.g. es, de, ru, etc.\n - fill in the labels translations\n - add to webpack config options as \n\t'options.i18n.fr': './options/lang/labels.fr.js' \n\t(see webpack.common.js as example)\n\nYou can then call iframely.optionsTranslator('LAN') - with your chosen language - to build the options form\n\nYou don't need to translate all the labels. The ones without a translation will be left as-is\n*/\n\nvar iframely = __webpack_require__(/*! ../iframely */ \"./iframely.js\");\n\nvar langs = {};\n\nexports.registerLabels = function(lang, labels) {\n    var existingLabels = langs[lang] = langs[lang] || {};\n    Object.assign(existingLabels, labels);\n};\n\niframely.optionsTranslator = function(lang) {\n    return function (label) {\n        return langs[lang] && langs[lang][label] && langs[lang][label] !== '' ? langs[lang][label] : label;\n    };\n};\n\n//# sourceURL=webpack:///./options/translator.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./options/lang/labels.de.js");
/******/ 	
/******/ })()
;