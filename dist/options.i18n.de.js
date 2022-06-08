/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./options/lang/labels.de.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./iframely.js":
/*!*********************!*\
  !*** ./iframely.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var iframely = window.iframely = window.iframely || {};\niframely.config = iframely.config || {};\n\nmodule.exports = iframely;\n\n//# sourceURL=webpack:///./iframely.js?");

/***/ }),

/***/ "./options/lang/labels.de.js":
/*!***********************************!*\
  !*** ./options/lang/labels.de.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var translator = __webpack_require__(/*! ../translator */ \"./options/translator.js\");\n\nvar lang ='de';\n\nvar labels = {\n    // general options\n    'Slimmer horizontal player': 'Schlanker horizontaler Player',\n    'Include playlist': 'Wiedergabeliste anzeigen',\n    'Hide artwork': 'Artwork ausblenden',\n    'Theme color': 'Theme Farbe',\n    'Light': 'Hell',\n    'Dark': 'Dunkel',\n    'Auto': 'Automatisch',\n    'Default': 'Standard',\n    'Adjust height': 'Höhe einstellen',\n    'Active page': 'Aktive Seite',\n\n    // Codepen\n    'Use click-to-load': 'Verwende click-to-load',\n    'ex.: 600, in px': 'Z.B. 600, in px',\n\n    //Instagram\n    'Hide timed comments': 'Kommentare ausblenden',\n\n    //Soundcloud\n    'Let Iframely optimize player for the artwork': 'Optimierung des Players durch IFramely',\n\n    // scribd\n    'Show as slideshow': 'Als Slideshow zeigen',\n\n    // youtube\n    'Start from': 'Start ab',\n    'ex.: 11, 1m10s': 'z.B. 11, 1m10s',\n    'End on': 'Ende an',\n    'Closed captions': 'Untertitel',\n\n    // twitter\n    'Include up to 20 tweets': 'Bis zu 20 Tweets anzeigen',\n    'Hide photos, videos, and cards': 'Verberge Fotos, Videos und Cards',\n    'Hide previous Tweet in conversation thread': 'Verberge den vorigen Tweet in der Konversation',\n    'Use dark theme': 'Verwende dunkles Farbschema',\n    'Adjust width': 'Breite anpassen',\n\n    // pinterest\n    'Hide description': 'Beschreibung verbergen',\n\n    //mixcloud\n    'Widget style': 'Widget-Style',\n    'Mini': 'Mini',\n    'Classic': 'Klassisch',\n    'Picture': 'Bild',\n\n    //google maps\n    'Zoom': 'Zoom',\n    'Map orientation': 'Karten-Ausrichtung',\n    'Album': 'Album',\n    'Portrait': 'Portrait',\n    'Square': 'Quadratisch',\n\n    // Flickr\n    'Show context slideshow': 'Als Slideshow anzeigen',\n    'Show description footer': 'Fußzeile anzeigen',\n    'Show user header': 'Kopfbereich anzeigen',\n\n    //facebook\n    'Show author\\'s text caption': 'Beschriftung des Autors anzeigen',\n    'Hide author\\'s text caption': 'Beschriftung des Autors verbergen',\n    'Include parent comment (if url is a reply)': 'Ursprünglichen Kommentar einschließen (wenn die Url eine Antwort ist)',\n\n    'Show recent posts': 'Neueste Beiträge anzeigen',\n    'Show profile photos when friends like this': 'Profilfotos anzeigen, wenn Freunde dies mögen',\n    'Use the small header instead': 'Kleine Kopfzeile stattdessen verwenden',\n\n    //bandcamp\n    'Artwork': 'Artwork',\n    'Small': 'klein',\n    'Big': 'groß',\n    'None': 'Keines',\n\n    'Layout': 'Layout',\n    'Slim': 'Schlank',\n    'Artwork-only': 'Nur Artwork',\n    'Standard': 'Standard',\n\n    //omny.fm\n    'Size & style': 'Größe & Stil',\n    'Wide image': 'Breite Darstellung',\n    'Wide simple': 'Breite Darstellung (Einfach)',\n\n     // Vimeo\n    'Text language (ignored if no captions)': 'Sprache der Untertitel (wird ignoriert, wenn keine Untertitel vorhanden)',\n    'Two letters: en, fr, es, de...': 'Zwei Buchstaben: en, fr, es, de...',\n    \n     // Kickstarter\n    'Don\\'t include attached player': 'Player nicht integrieren',\n    'Attached player only, no card': 'Nur Player, keine Card',\n\n    //iframely options\n    'Hold load & play until clicked': 'Klicken zum Abspielen',\n    'Make it a small card': 'Kleine Card verwenden',\n    //iframely media cards\n    'Keep using full media card': 'Verwende weiterhin vollständige Media-Cards',\n    'Don\\'t include player': 'Player nicht hinzufügen',\n    'Player only, no card': 'Nur Player, keine Card',\n    //iframely media=1\n    'Just the player': 'Nur Player',\n    'Just the image': 'Nur Bild'\n};\n\ntranslator.registerLabels(lang, labels);\n\n\n//# sourceURL=webpack:///./options/lang/labels.de.js?");

/***/ }),

/***/ "./options/translator.js":
/*!*******************************!*\
  !*** ./options/translator.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\nTo add more languages to the translator -\nsee ./lang/labels.LAN.example.js\n\n - use the template for the list of currently available labels\n - save it as labels.LAN.js  // replace LAN with your actual value, e.g. es, de, ru, etc.\n - fill in the labels translations\n - add to webpack config options as \n\t'options.i18n.fr': './options/lang/labels.fr.js' \n\t(see webpack.common.js as example)\n\nYou can then call iframely.optionsTranslator('LAN') - with your chosen language - to build the options form\n\nYou don't need to translate all the labels. The ones without a translation will be left as-is\n*/\n\nvar iframely = __webpack_require__(/*! ../iframely */ \"./iframely.js\");\n\nvar langs = {};\n\nexports.registerLabels = function(lang, labels) {\n    var existingLabels = langs[lang] = langs[lang] || {};\n    Object.assign(existingLabels, labels);\n};\n\niframely.optionsTranslator = function(lang) {\n    return function (label) {\n        return langs[lang] && langs[lang][label] && langs[lang][label] !== '' ? langs[lang][label] : label;\n    };\n};\n\n//# sourceURL=webpack:///./options/translator.js?");

/***/ })

/******/ });