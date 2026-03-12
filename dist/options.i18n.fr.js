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

/***/ "./options/lang/labels.fr.js"
/*!***********************************!*\
  !*** ./options/lang/labels.fr.js ***!
  \***********************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

eval("{var translator = __webpack_require__(/*! ../translator */ \"./options/translator.js\");\n\nvar lang ='fr';\n\nvar labels = {\n    // general options\n    'Slimmer horizontal player': 'Joueur de audio classique',\n    'Include playlist': 'Inclure la playlist',\n    'Hide artwork': 'Masquer la illustration',\n    'Theme color': 'Couleur du thème',\n    'Light': 'Lumière',\n    'Dark': 'Sombre',\n    'Auto': '',\n    'Default': 'Défaut',\n    'Adjust height': 'Height',\n    'Active page': 'Page active',\n\n    // Codepen\n    'Use click-to-load': 'Utilisez click-to-load',\n    'ex.: 600, in px': '',\n\n    //Instagram\n    'Hide timed comments': 'Masquer les commentaires',\n\n    //Soundcloud\n    'Let Iframely optimize player for the artwork': 'Optimiser le lecteur pour l\\'illustration',\n\n    // scribd\n    'Show as slideshow': 'Montrer en diaporama',\n\n    // youtube\n    'Start from': 'Commencer',\n    'ex.: 11, 1m10s': '',\n    'End on': 'Fin sur',\n\n    // twitter\n    'Include up to 20 tweets': 'Incluez jusqu\\'à 20 tweets',\n    'Hide photos, videos, and cards': 'Masquer les photos, les vidéos et les cartes',\n    'Hide previous Tweet in conversation thread': 'Masquer le tweet parent',\n\n    // pinterest\n    'Hide description': 'Masquer la description',\n\n    //mixcloud\n    'Widget style': 'Style de widget',\n    'Mini': '', // can leave empty - will remain as is\n    'Classic': 'Classique',\n    'Picture': 'Image',\n\n    //google maps\n    'Zoom': '',\n    'Map orientation': 'Orientation de la carte',\n    'Album': '',\n    'Portrait': '',\n    'Square': 'Carré',\n\n    // Flickr\n    'Show context slideshow': 'Afficher le diaporama contextuel',\n    'Show description footer': 'Afficher la description pied de page',\n    'Show user header': 'Afficher l\\'en-tête de l\\'utilisateur',\n\n    //facebook\n    'Show author\\'s text caption': 'Afficher la description de l\\'auteur',\n    'Hide author\\'s text caption': 'Masquer la description de l\\'auteur',\n    'Include parent comment (if url is a reply)': '',\n\n    'Show recent posts': 'Afficher les messages récents',\n    'Show profile photos when friends like this': '',\n    'Use the small header instead': 'Utilisez plutôt le petit en-tête',\n\n    //bandcamp\n    'Artwork': 'Ouvrages d\\'art',\n    'Small': 'Petite',\n    'Big': 'Grosse',\n    'None': 'Aucune',\n\n    'Layout': 'Disposition',\n    'Slim': 'Svelte',\n    'Artwork-only': 'Oeuvre seule',\n    'Standard': 'Standard',\n\n    //omny.fm\n    'Size & style': 'Style',\n    'Wide image': 'Image large',\n    'Wide simple': 'Large simple',\n\n\n    //iframely options\n    'Hold load & play until clicked': 'Click-to-play',\n    'Make it a small card': 'Carte compacte',\n    //iframely media cards\n    'Keep using full media card': 'Continuez à utiliser la carte média complète',\n    'Don\\'t include player': 'Ne pas inclure la vidéo',\n    'Player only, no card': 'La vidéo seulement, pas de carte',\n    //iframely media=1\n    'Just the player': 'Seulement la vidéo',\n    'Just the image': 'Seulement l\\'image'\n};\n\ntranslator.registerLabels(lang, labels);\n\n//# sourceURL=webpack:///./options/lang/labels.fr.js?\n}");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./options/lang/labels.fr.js");
/******/ 	
/******/ })()
;