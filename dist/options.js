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

/***/ "./options/templates/checkbox.ejs"
/*!****************************************!*\
  !*** ./options/templates/checkbox.ejs ***!
  \****************************************/
(module) {

eval("{module.exports = function(obj) {\nobj || (obj = {});\nvar __t, __p = '', __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\nwith (obj) {\n__p += '<div class=\"iframely-option-check iframely-option-checkbox\">\\n    <input type=\"checkbox\" class=\"iframely-option-check__input\" id=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" name=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\"';\n if (checked) { ;\n__p += ' checked=\"checked\"';\n } ;\n__p += '>\\n    <label class=\"iframely-option-check__label\" for=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\">\\n        ' +\n((__t = ( label )) == null ? '' : __t) +\n'\\n    </label>\\n</div>\\n';\n\n}\nreturn __p\n}\n\n//# sourceURL=webpack:///./options/templates/checkbox.ejs?\n}");

/***/ },

/***/ "./options/templates/group.ejs"
/*!*************************************!*\
  !*** ./options/templates/group.ejs ***!
  \*************************************/
(module) {

eval("{module.exports = function(obj) {\nobj || (obj = {});\nvar __t, __p = '', __e = _.escape;\nwith (obj) {\n__p += '<div class=\"iframely-option\">\\n    <div class=\"iframely-option__group\">\\n        ' +\n__e( elementsHtml ) +\n'\\n    </div>\\n</div>';\n\n}\nreturn __p\n}\n\n//# sourceURL=webpack:///./options/templates/group.ejs?\n}");

/***/ },

/***/ "./options/templates/radio.ejs"
/*!*************************************!*\
  !*** ./options/templates/radio.ejs ***!
  \*************************************/
(module) {

eval("{module.exports = function(obj) {\nobj || (obj = {});\nvar __t, __p = '', __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\nwith (obj) {\n__p += '<div class=\"iframely-option\">\\n    ';\n if (label) { ;\n__p += '\\n        <label class=\"iframely-option__label\">\\n            ' +\n((__t = ( label )) == null ? '' : __t) +\n':\\n        </label>\\n    ';\n } ;\n__p += '\\n    <div class=\"iframely-option__group';\n if (inline) { ;\n__p += ' iframely-option__group-inline';\n } ;\n__p += '\">\\n        ';\n items.forEach(function(subContext) { ;\n__p += '\\n            <div class=\"iframely-option-check iframely-option-radio\">\\n                <input type=\"radio\" class=\"iframely-option-check__input\" id=\"' +\n((__t = ( subContext.id )) == null ? '' : __t) +\n'\" name=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" value=\"' +\n((__t = ( subContext.value )) == null ? '' : __t) +\n'\"';\n if (subContext.checked) { ;\n__p += ' checked=\"checked\"';\n } ;\n__p += '>\\n                <label class=\"iframely-option-check__label\" for=\"' +\n((__t = ( subContext.id )) == null ? '' : __t) +\n'\">\\n                        ' +\n((__t = ( subContext.label )) == null ? '' : __t) +\n'\\n                </label>\\n            </div>\\n        ';\n }); ;\n__p += '\\n    </div>\\n</div>';\n\n}\nreturn __p\n}\n\n//# sourceURL=webpack:///./options/templates/radio.ejs?\n}");

/***/ },

/***/ "./options/templates/range.ejs"
/*!*************************************!*\
  !*** ./options/templates/range.ejs ***!
  \*************************************/
(module) {

eval("{module.exports = function(obj) {\nobj || (obj = {});\nvar __t, __p = '';\nwith (obj) {\n__p += '<div class=\"iframely-option\">\\n    <label class=\"iframely-option__label\" for=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\">' +\n((__t = ( label )) == null ? '' : __t) +\n':</label>\\n    <div class=\"iframely-option__group\">\\n        <input type=\"range\" class=\"iframely-option__range\" id=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" name=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" min=\"' +\n((__t = ( min )) == null ? '' : __t) +\n'\" max=\"' +\n((__t = ( max )) == null ? '' : __t) +\n'\" step=\"1\" value=\"' +\n((__t = ( value )) == null ? '' : __t) +\n'\" style=\"--min: ' +\n((__t = ( min )) == null ? '' : __t) +\n'; --max: ' +\n((__t = ( max )) == null ? '' : __t) +\n'; --val: ' +\n((__t = ( value )) == null ? '' : __t) +\n';\">\\n    </div>\\n</div>';\n\n}\nreturn __p\n}\n\n//# sourceURL=webpack:///./options/templates/range.ejs?\n}");

/***/ },

/***/ "./options/templates/select.ejs"
/*!**************************************!*\
  !*** ./options/templates/select.ejs ***!
  \**************************************/
(module) {

eval("{module.exports = function(obj) {\nobj || (obj = {});\nvar __t, __p = '', __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\nwith (obj) {\n__p += '<div class=\"iframely-option\">\\n    <label class=\"iframely-option__label\" for=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\">' +\n((__t = ( label )) == null ? '' : __t) +\n':</label>\\n    <div class=\"iframely-option__group\">\\n        <select class=\"iframely-option__input iframely-option__select\" id=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" name=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\">\\n            ';\n items.forEach(function(subContext) { ;\n__p += '\\n                <option value=\"' +\n((__t = ( subContext.value )) == null ? '' : __t) +\n'\"';\n if (subContext.checked) { ;\n__p += ' selected';\n } ;\n__p += '>' +\n((__t = ( subContext.label )) == null ? '' : __t) +\n'</option>\\n            ';\n }); ;\n__p += '\\n        </select>\\n    </div>\\n</div>';\n\n}\nreturn __p\n}\n\n//# sourceURL=webpack:///./options/templates/select.ejs?\n}");

/***/ },

/***/ "./options/templates/text.ejs"
/*!************************************!*\
  !*** ./options/templates/text.ejs ***!
  \************************************/
(module) {

eval("{module.exports = function(obj) {\nobj || (obj = {});\nvar __t, __p = '';\nwith (obj) {\n__p += '<div class=\"iframely-option\">\\n    <label class=\"iframely-option__label\" for=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\">' +\n((__t = ( label )) == null ? '' : __t) +\n':</label>\\n    <div class=\"iframely-option__group\">\\n        <input type=\"' +\n((__t = ( inputType )) == null ? '' : __t) +\n'\" class=\"iframely-option__input iframely-option__text\" id=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" name=\"' +\n((__t = ( key )) == null ? '' : __t) +\n'\" placeholder=\"' +\n((__t = ( placeholder )) == null ? '' : __t) +\n'\" value=\"' +\n((__t = ( value )) == null ? '' : __t) +\n'\">\\n    </div>\\n</div>';\n\n}\nreturn __p\n}\n\n//# sourceURL=webpack:///./options/templates/text.ejs?\n}");

/***/ },

/***/ "./iframely.js"
/*!*********************!*\
  !*** ./iframely.js ***!
  \*********************/
(module) {

eval("{var iframely = window.iframely = window.iframely || {};\niframely.config = iframely.config || {};\n\nmodule.exports = iframely;\n\n//# sourceURL=webpack:///./iframely.js?\n}");

/***/ },

/***/ "./options/form-builder.js"
/*!*********************************!*\
  !*** ./options/form-builder.js ***!
  \*********************************/
(module, __unused_webpack_exports, __webpack_require__) {

eval("{var getFormElements = __webpack_require__(/*! ./form-generator */ \"./options/form-generator.js\");\nvar iframely = __webpack_require__(/*! ../iframely */ \"./iframely.js\");\n\nvar UIelements = {\n    checkbox: {\n        getValue: function(inputs) {\n            var input = inputs[0];\n            return input.checked;\n        }\n    },\n    text: {\n        getValue: function(inputs) {\n            var input = inputs[0];\n            var value = input.value;\n            if (input.type === 'number') {\n                value = parseInt(value);\n                if (isNaN(value)) {\n                    value = '';\n                }\n            }\n            return value;\n        },\n        customEvents: function(inputs, submitOptionsCb) {\n            var input = inputs[0];\n            iframely.addEventListener(input, 'click', function() {\n                input.select();\n            });\n            iframely.addEventListener(input, 'blur', submitOptionsCb);\n            iframely.addEventListener(input, 'keyup', function(e) {\n                // Apply on enter.\n                if (e.keyCode === 13) {\n                    submitOptionsCb();\n                }\n            });\n        }\n    },\n    radio: {\n        getValue: function(inputs) {\n            var selectedInput;\n            inputs.forEach(function(input) {\n                if (input.checked) {\n                    selectedInput = input;\n                }\n            });\n            return selectedInput.value;\n        }\n    }\n};\n\nvar defaultQueryById = {};\n\nmodule.exports = function(params) {\n\n    var options = params.options;\n    var formContainer = params.formContainer;\n\n    if (!formContainer) {\n        console.warn('No formContainer in form-builder options', params);\n        return;\n    }\n\n    if (!options) {\n        formContainer.innerHTML = '';\n        return;\n    }\n\n    var elements = getFormElements(options, params.translator);\n    var id = params.id;\n    var renderer = params.renderer;\n\n    var defaultQuery = defaultQueryById[id] = defaultQueryById[id] || {};\n    // Exclude default values.\n    Object.keys(options).forEach(function(key) {\n        if (!options.query || options.query.indexOf(key) === -1) {\n            // Store default value.\n            defaultQuery[key] = options[key].value;\n        }\n    });\n\n    function getQueryFromForm() {\n\n        var query = {};\n\n        var getOptionsFromElements = function(elements) {\n            // Get options from all inputs.\n            elements.forEach(function(element) {\n\n                if (element.context && element.context.elements) {\n\n                    getOptionsFromElements(element.context.elements);\n\n                } else if (element.inputs) {\n\n                    var elementUI = UIelements[element.type];\n                    var inputValue;\n                    if (elementUI && elementUI.getValue) {\n                        inputValue = elementUI.getValue(element.inputs);\n                    } else {\n                        inputValue = element.inputs[0].value;\n                    }\n                    Object.assign(query, element.getQuery(inputValue));\n                }\n            });\n        };\n\n        getOptionsFromElements(elements);\n        \n        return query;\n    }\n\n    function getAndSubmitOptions() {\n        var query = getQueryFromForm();\n\n        Object.keys(defaultQuery).forEach(function(key) {\n            if (defaultQuery[key] === query[key] \n                || query[key] === undefined) { // remove undefined so it's not included while JSON.stringify\n                delete query[key];\n            }\n        });\n\n        iframely.trigger('options-changed', id, formContainer, query);\n    }\n\n    // Render form.\n    var renderElements = function(elements) {\n        var html = '';\n        elements.forEach(function(element) {\n            if (element.context && element.context.elements) {\n                element.context.elementsHtml = renderElements(element.context.elements);\n            }\n            html += renderer(element.type, element.context || {});\n        });\n        return html;\n    };\n    formContainer.innerHTML = renderElements(elements);\n\n    // Bind events.\n    var bindElements = function(elements) {\n        \n        elements.forEach(function(element) {\n\n            if (element.context && element.context.elements) {\n\n                bindElements(element.context.elements);\n\n            } else {\n\n                var elementUI = UIelements[element.type];\n                if (element.context) {\n                    element.inputs = formContainer.querySelectorAll('[name=\"' + element.context.key + '\"]');\n                    if (element.inputs.length > 0) {\n                        if (elementUI && elementUI.customEvents) {\n                            elementUI.customEvents(element.inputs, getAndSubmitOptions);\n                        } else {\n                            element.inputs.forEach(function(input) {\n                                iframely.addEventListener(input, 'change', getAndSubmitOptions);\n                            });\n                        }\n                    } else {\n                        console.warn('No inputs found for option', element.key);\n                    }\n                }\n            }\n        });\n    };\n    bindElements(elements);\n};\n\n//# sourceURL=webpack:///./options/form-builder.js?\n}");

/***/ },

/***/ "./options/form-generator.js"
/*!***********************************!*\
  !*** ./options/form-generator.js ***!
  \***********************************/
(module) {

eval("{var _RE = /^_./;\n\nvar translate = function (label, translator) {\n    return translator && typeof translator === 'function' \n        ? translator (label) || label\n        : label;\n};\n\nmodule.exports = function(options, translator) {\n\n    if (!options) {\n        return [];\n    }\n\n    // Remove query key.\n    options = Object.assign({}, options);\n    delete options.query;\n\n    var items = [];\n    var keys = Object.keys(options);\n    var checkboxCount = 0;\n    \n    keys.forEach(function(key) {\n        \n        var context = {};\n\n        var getQuery;\n        var option = options[key];\n        option.key = key;\n\n        var forceCheckboxForSingleKeyValue;\n        var valuesKeys = option.values && Object.keys(option.values);\n        var singleKey, singleLabel;\n        if (valuesKeys && valuesKeys.length === 1) {\n            forceCheckboxForSingleKeyValue = true;\n            singleKey = valuesKeys[0];\n            singleLabel = option.values[singleKey];\n        }\n\n        context.label = translate(singleLabel || option.label, translator);\n        context.key = option.key;\n\n        if (forceCheckboxForSingleKeyValue || typeof option.value === 'boolean') {\n\n            if (forceCheckboxForSingleKeyValue) {\n                context.checked = (singleKey === option.value) || (!singleKey && !option.value);\n            } else {\n                context.checked = option.value;\n            }\n\n            checkboxCount++;\n\n            items.push({\n                type: 'checkbox',\n                context: context,\n                order: _RE.test(key) ? 0 : 1,\n                getQuery: function(checked) {\n\n                    var value;\n                    if (forceCheckboxForSingleKeyValue) {\n                        value = checked ? singleKey : '';\n                    } else {\n                        value = checked;\n                    }\n\n                    var result = {};\n\n                    if (forceCheckboxForSingleKeyValue) {\n                        if (value === '') {\n                            // Empty.\n                        } else {\n                            result[option.key] = value;\n                        }\n                    } else {\n                        result[option.key] = checked;\n                    }\n                    return result;\n                }\n            });\n\n        } else if ((typeof option.value === 'number' || typeof option.value === 'string') && !option.values) {\n\n            var useSlider = option.range && typeof option.range.min === 'number' && typeof option.range.max === 'number';\n            var useNumber = typeof option.value === 'number';\n\n            context.value = option.value;\n\n            getQuery = function(inputValue) {\n                var result = {};\n                if (inputValue === '') {\n                    // Empty.\n                } else {\n                    result[option.key] = inputValue;\n                }\n                return result;\n            };\n\n            if (useSlider) {\n                context.min = option.range.min;\n                context.max = option.range.max;\n                items.push({\n                    type: 'range',\n                    context: context,\n                    order: 9, // last one\n                    getQuery: getQuery\n                });\n            } else {\n                context.placeholder = translate(option.placeholder || '', translator);\n                context.inputType = useNumber ? 'number' : 'text';\n                items.push({\n                    type: 'text',\n                    context: context,\n                    order: /start/i.test(key) ? 7 : 8, // start/end for player timing, ex.: youtube\n                    getQuery: getQuery\n                });\n            }\n\n        } else if (option.values) {\n\n            context.value = option.value + '';\n\n            getQuery = function(inputValue) {\n                var result = {};\n                if (inputValue === '') {\n                    // Empty.\n                } else {\n                    result[option.key] = inputValue;\n                }\n                return result;\n            };\n\n            if (Object.keys(option.values).length <= 3) {\n\n                if (option.label) {\n                    context.label = translate(option.label, translator);\n                } else {\n                    context.label = false;\n                }\n\n                var i = 0;\n                var hasLongLabel = false;\n                var values = Object.values(option.values);\n                while (i < values.length && !hasLongLabel) {\n                    var label = values[i];\n                    hasLongLabel = label.length > 8;\n                    i++;\n                }\n                context.inline = !hasLongLabel;\n\n                context.items = [];\n\n                Object.keys(option.values).forEach(function(key, idx2) {\n                    context.items.push({\n                        id: context.key + '-' + idx2,\n                        value: key,\n                        label: translate(option.values[key], translator),\n                        checked: context.value === key\n                    });\n                });\n\n                items.push({\n                    type: 'radio',\n                    context: context,\n                    order: hasLongLabel ? -3 : (!/theme/.test(key) ? -2 : -1),\n                    getQuery: getQuery\n                });\n\n            } else {\n\n                context.items = [];\n\n                Object.keys(option.values).forEach(function(key) {\n                    context.items.push({\n                        value: key,\n                        label: translate(option.values[key], translator),\n                        checked: context.value === key\n                    });\n                });\n\n                items.push({\n                    type: 'select',\n                    context: context,\n                    order: 5,\n                    getQuery: getQuery\n                });\n            }\n        }\n    });\n\n    items.sort(function(a, b) {\n        return a.order - b.order;\n    });\n\n    items.forEach(function(item) {\n        delete item.order;\n    });\n\n    if (checkboxCount > 0) {\n\n        var groupedItems = [];\n        var subItems;\n\n        items.forEach(function(item, idx) {\n\n            if (item.type === 'checkbox') {\n\n                // Grouping for checkboxes.\n\n                var newCheckboxGroup = \n                    checkboxCount > 2\n                    && idx > 0 \n                    && !_RE.test(item.context.key) \n                    && items[idx - 1].type === 'checkbox'\n                    && _RE.test(items[idx - 1].context.key);\n\n                if (!subItems               // First group.\n                    || newCheckboxGroup     // Second group on _ prefix removed.\n                ) {\n\n                    subItems = [];\n                    groupedItems.push({\n                        type: 'group',\n                        context: {\n                            elements: subItems\n                        }\n                    });\n                }\n\n                subItems.push(item);\n\n            } else {\n                // Other items. Just add.\n                groupedItems.push(item);\n            }\n        });\n\n        return groupedItems;\n\n    } else {\n        return items;\n    }\n};\n\n//# sourceURL=webpack:///./options/form-generator.js?\n}");

/***/ },

/***/ "./options/index.js"
/*!**************************!*\
  !*** ./options/index.js ***!
  \**************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{var iframely = __webpack_require__(/*! ../iframely */ \"./iframely.js\");\nvar formBuilder = __webpack_require__(/*! ./form-builder */ \"./options/form-builder.js\");\nvar renderer = __webpack_require__(/*! ./renderer */ \"./options/renderer.js\");\n\niframely.buildOptionsForm = function(id, formContainer, options, translator) {\n    formBuilder({\n        id:             id,\n        formContainer:  formContainer,\n        options:        options,\n        renderer:       renderer,\n        translator:     translator\n    });\n};\n\nexports.iframely = iframely;\n\n//# sourceURL=webpack:///./options/index.js?\n}");

/***/ },

/***/ "./options/renderer.js"
/*!*****************************!*\
  !*** ./options/renderer.js ***!
  \*****************************/
(module, __unused_webpack_exports, __webpack_require__) {

eval("{var checkboxTemplate = __webpack_require__(/*! ./templates/checkbox.ejs */ \"./options/templates/checkbox.ejs\");\nvar rangeTemplate = __webpack_require__(/*! ./templates/range.ejs */ \"./options/templates/range.ejs\");\nvar textTemplate = __webpack_require__(/*! ./templates/text.ejs */ \"./options/templates/text.ejs\");\nvar radioTemplate = __webpack_require__(/*! ./templates/radio.ejs */ \"./options/templates/radio.ejs\");\nvar selectTemplate = __webpack_require__(/*! ./templates/select.ejs */ \"./options/templates/select.ejs\");\nvar groupTemplate = __webpack_require__(/*! ./templates/group.ejs */ \"./options/templates/group.ejs\");\n\nvar templates = {\n    checkbox:   checkboxTemplate,\n    range:      rangeTemplate,\n    text:       textTemplate,\n    radio:      radioTemplate,\n    select:     selectTemplate,\n    group:      groupTemplate\n};\n\nmodule.exports = function(type, context) {\n    var template = templates[type];\n    var renderedTemplate = template(context);\n    return renderedTemplate;\n};\n\n//# sourceURL=webpack:///./options/renderer.js?\n}");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./options/index.js");
/******/ 	
/******/ })()
;