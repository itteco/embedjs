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
/******/ 	return __webpack_require__(__webpack_require__.s = "./options/index.js");
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

/***/ "./options/form-builder.js":
/*!*********************************!*\
  !*** ./options/form-builder.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var getFormElements = __webpack_require__(/*! ./form-generator */ \"./options/form-generator.js\");\nvar iframely = __webpack_require__(/*! ../iframely */ \"./iframely.js\");\n\nvar UIelements = {\n    checkbox: {\n        getValue: function(inputs) {\n            var input = inputs[0];\n            return input.checked;\n        }\n    },\n    text: {\n        customEvents: function(inputs, submitOptionsCb) {\n            var input = inputs[0];\n            iframely.addEventListener(input, 'click', function() {\n                input.select();\n            });\n            iframely.addEventListener(input, 'blur', submitOptionsCb);\n            iframely.addEventListener(input, 'keyup', function(e) {\n                // Apply on enter.\n                if (e.keyCode === 13) {\n                    submitOptionsCb();\n                }\n            });\n        }\n    },\n    radio: {\n        getValue: function(inputs) {\n            var selectedInput;\n            inputs.forEach(function(input) {\n                if (input.checked) {\n                    selectedInput = input;\n                }\n            });\n            return selectedInput.value;\n        }\n    }\n};\n\nvar defaultQueryById = {};\n\nmodule.exports = function(params) {\n\n    var options = params.options;\n    var formContainer = params.formContainer;\n\n    if (!options) {\n        formContainer.innerHTML = '';\n        return;\n    }\n\n    var elements = getFormElements(options, params.translator);\n    var id = params.id;\n    var renderer = params.renderer;\n\n    var defaultQuery = defaultQueryById[id] = defaultQueryById[id] || {};\n    // Exclude default values.\n    Object.keys(options).forEach(function(key) {\n        if (!options.query || options.query.indexOf(key) === -1) {\n            // Store default value.\n            defaultQuery[key] = options[key].value;\n        }\n    });\n\n    function getQueryFromForm() {\n\n        var query = {};\n\n        var getOptionsFromElements = function(elements) {\n            // Get options from all inputs.\n            elements.forEach(function(element) {\n\n                if (element.context && element.context.elements) {\n\n                    getOptionsFromElements(element.context.elements);\n\n                } else if (element.inputs) {\n\n                    var elementUI = UIelements[element.type];\n                    var inputValue;\n                    if (elementUI && elementUI.getValue) {\n                        inputValue = elementUI.getValue(element.inputs);\n                    } else {\n                        inputValue = element.inputs[0].value;\n                    }\n                    Object.assign(query, element.getQuery(inputValue));\n                }\n            });\n        };\n\n        getOptionsFromElements(elements);\n        \n        return query;\n    }\n\n    function getAndSubmitOptions() {\n        var query = getQueryFromForm();\n\n        Object.keys(defaultQuery).forEach(function(key) {\n            if (defaultQuery[key] === query[key] \n                || query[key] === undefined) { // remove undefined so it's not included while JSON.stringify\n                delete query[key];\n            }\n        });\n\n        iframely.trigger('options-changed', id, formContainer, query);\n    }\n\n    // Render form.\n    var renderElements = function(elements) {\n        var html = '';\n        elements.forEach(function(element) {\n            if (element.context && element.context.elements) {\n                element.context.elementsHtml = renderElements(element.context.elements);\n            }\n            html += renderer(element.type, element.context || {});\n        });\n        return html;\n    };\n    formContainer.innerHTML = renderElements(elements);\n\n    // Bind events.\n    var bindElements = function(elements) {\n        \n        elements.forEach(function(element) {\n\n            if (element.context && element.context.elements) {\n\n                bindElements(element.context.elements);\n\n            } else {\n\n                var elementUI = UIelements[element.type];\n                if (element.context) {\n                    element.inputs = formContainer.querySelectorAll('[name=\"' + element.context.key + '\"]');\n                    if (element.inputs.length > 0) {\n                        if (elementUI && elementUI.customEvents) {\n                            elementUI.customEvents(element.inputs, getAndSubmitOptions);\n                        } else {\n                            element.inputs.forEach(function(input) {\n                                iframely.addEventListener(input, 'change', getAndSubmitOptions);\n                            });\n                        }\n                    } else {\n                        console.warn('No inputs found for option', element.key);\n                    }\n                }\n            }\n        });\n    };\n    bindElements(elements);\n};\n\n//# sourceURL=webpack:///./options/form-builder.js?");

/***/ }),

/***/ "./options/form-generator.js":
/*!***********************************!*\
  !*** ./options/form-generator.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var _RE = /^_./;\n\nvar translate = function (value, translator) {\n    return translator && typeof translator === 'function' \n        ? translator (value) || value \n        : value;\n};\n\nmodule.exports = function(options, translator) {\n\n    if (!options) {\n        return [];\n    }\n\n    // Remove query key.\n    options = Object.assign({}, options);\n    delete options.query;\n\n    var items = [];\n    var keys = Object.keys(options);\n    var checkboxCount = 0;\n    \n    keys.forEach(function(key) {\n        \n        var context = {};\n\n        var getQuery;\n        var option = options[key];\n        option.key = key;\n\n        var forceCheckboxForSingleKeyValue;\n        var valuesKeys = option.values && Object.keys(option.values);\n        var singleKey, singleLabel;\n        if (valuesKeys && valuesKeys.length === 1) {\n            forceCheckboxForSingleKeyValue = true;\n            singleKey = valuesKeys[0];\n            singleLabel = option.values[singleKey];\n        }\n\n        context.label = translate(singleLabel || option.label, translator);\n        context.key = option.key;\n\n        if (forceCheckboxForSingleKeyValue || typeof option.value === 'boolean') {\n\n            if (forceCheckboxForSingleKeyValue) {\n                context.checked = (singleKey === option.value) || (!singleKey && !option.value);\n            } else {\n                context.checked = option.value;\n            }\n\n            checkboxCount++;\n\n            items.push({\n                type: 'checkbox',\n                context: context,\n                order: _RE.test(key) ? 0 : 1,\n                getQuery: function(checked) {\n\n                    var value;\n                    if (forceCheckboxForSingleKeyValue) {\n                        value = checked ? singleKey : '';\n                    } else {\n                        value = checked;\n                    }\n\n                    var result = {};\n\n                    if (forceCheckboxForSingleKeyValue) {\n                        if (value === '') {\n                            // Empty.\n                        } else {\n                            result[option.key] = value;\n                        }\n                    } else {\n                        result[option.key] = checked;\n                    }\n                    return result;\n                }\n            });\n\n        } else if ((typeof option.value === 'number' || typeof option.value === 'string') && !option.values) {\n\n            var useSlider = option.range && typeof option.range.min === 'number' && typeof option.range.max === 'number';\n\n            context.value = option.value;\n\n            getQuery = function(inputValue) {\n                var result = {};\n                if (inputValue === '') {\n                    // Empty.\n                } else {\n                    result[option.key] = inputValue;\n                }\n                return result;\n            };\n\n            if (useSlider) {\n                context.min = option.range.min;\n                context.max = option.range.max;\n                items.push({\n                    type: 'range',\n                    context: context,\n                    order: 9, // last one\n                    getQuery: getQuery\n                });\n            } else {\n                context.placeholder = option.placeholder || '';\n                items.push({\n                    type: 'text',\n                    context: context,\n                    order: /start/i.test(key) ? 7 : 8, // start/end for player timing, ex.: youtube\n                    getQuery: getQuery\n                });\n            }\n\n        } else if (option.values) {\n\n            context.value = option.value + '';\n\n            getQuery = function(inputValue) {\n                var result = {};\n                if (inputValue === '') {\n                    // Empty.\n                } else {\n                    result[option.key] = inputValue;\n                }\n                return result;\n            };\n\n            if (Object.keys(option.values).length <= 3) {\n\n                if (option.label) {\n                    context.label = translate(option.label, translator);\n                } else {\n                    context.label = false;\n                }\n\n                var i = 0;\n                var hasLongLabel = false;\n                var values = Object.values(option.values);\n                while (i < values.length && !hasLongLabel) {\n                    var label = values[i];\n                    hasLongLabel = label.length > 8;\n                    i++;\n                }\n                context.inline = !hasLongLabel;\n\n                context.items = [];\n\n                Object.keys(option.values).forEach(function(key, idx2) {\n                    context.items.push({\n                        id: context.key + '-' + idx2,\n                        value: key,\n                        label: option.values[key],\n                        checked: context.value === key\n                    });\n                });\n\n                items.push({\n                    type: 'radio',\n                    context: context,\n                    order: hasLongLabel ? -3 : (!/theme/.test(key) ? -2 : -1),\n                    getQuery: getQuery\n                });\n\n            } else {\n\n                context.items = [];\n\n                Object.keys(option.values).forEach(function(key) {\n                    context.items.push({\n                        value: key,\n                        label: translate(option.values[key], translator),\n                        checked: context.value === key\n                    });\n                });\n\n                items.push({\n                    type: 'select',\n                    context: context,\n                    order: 5,\n                    getQuery: getQuery\n                });\n            }\n        }\n    });\n\n    items.sort(function(a, b) {\n        return a.order - b.order;\n    });\n\n    items.forEach(function(item) {\n        delete item.order;\n    });\n\n    if (checkboxCount > 0) {\n\n        var groupedItems = [];\n        var subItems;\n\n        items.forEach(function(item, idx) {\n\n            if (item.type === 'checkbox') {\n\n                // Grouping for checkboxes.\n\n                var newCheckboxGroup = \n                    checkboxCount > 2\n                    && idx > 0 \n                    && !_RE.test(item.context.key) \n                    && items[idx - 1].type === 'checkbox'\n                    && _RE.test(items[idx - 1].context.key);\n\n                if (!subItems               // First group.\n                    || newCheckboxGroup     // Second group on _ prefix removed.\n                ) {\n\n                    subItems = [];\n                    groupedItems.push({\n                        type: 'group',\n                        context: {\n                            elements: subItems\n                        }\n                    });\n                }\n\n                subItems.push(item);\n\n            } else {\n                // Other items. Just add.\n                groupedItems.push(item);\n            }\n        });\n\n        return groupedItems;\n\n    } else {\n        return items;\n    }\n};\n\n//# sourceURL=webpack:///./options/form-generator.js?");

/***/ }),

/***/ "./options/index.js":
/*!**************************!*\
  !*** ./options/index.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var iframely = __webpack_require__(/*! ../iframely */ \"./iframely.js\");\nvar formBuilder = __webpack_require__(/*! ./form-builder */ \"./options/form-builder.js\");\nvar renderer = __webpack_require__(/*! ./renderer */ \"./options/renderer.js\");\n\niframely.buildOptionsForm = function(params) {\n    formBuilder({\n        id:             params.id,\n        formContainer:  params.formContainer,\n        options:        params.options,                        \n        renderer:       renderer\n    });\n};\n\n//# sourceURL=webpack:///./options/index.js?");

/***/ }),

/***/ "./options/renderer.js":
/*!*****************************!*\
  !*** ./options/renderer.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var ejs = __webpack_require__(!(function webpackMissingModule() { var e = new Error(\"Cannot find module 'ejs'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));\n\nvar checkboxTemplate = __webpack_require__(/*! ./templates/checkbox */ \"./options/templates/checkbox.js\");\nvar rangeTemplate = __webpack_require__(/*! ./templates/range */ \"./options/templates/range.js\");\nvar textTemplate = __webpack_require__(/*! ./templates/text */ \"./options/templates/text.js\");\nvar radioTemplate = __webpack_require__(/*! ./templates/radio */ \"./options/templates/radio.js\");\nvar selectTemplate = __webpack_require__(/*! ./templates/select */ \"./options/templates/select.js\");\nvar groupTemplate = __webpack_require__(/*! ./templates/group */ \"./options/templates/group.js\");\n\nvar templates = {\n    checkbox:   checkboxTemplate,\n    range:      rangeTemplate,\n    text:       textTemplate,\n    radio:      radioTemplate,\n    select:     selectTemplate,\n    group:      groupTemplate\n};\n\nmodule.exports = function(type, context) {\n    return ejs.render(templates[type], context);\n};\n\n//# sourceURL=webpack:///./options/renderer.js?");

/***/ }),

/***/ "./options/templates/checkbox.js":
/*!***************************************!*\
  !*** ./options/templates/checkbox.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = `<div class=\"iframely-option-check iframely-option-checkbox\">\n    <input type=\"checkbox\" class=\"iframely-option-check__input\" id=\"<%- key %>\" name=\"<%- key %>\"<% if (checked) { %> checked=\"checked\"<% } %>>\n    <label class=\"iframely-option-check__label\" for=\"<%- id %>\">\n        <%- label %>\n    </label>\n</div>`;\n\n\n//# sourceURL=webpack:///./options/templates/checkbox.js?");

/***/ }),

/***/ "./options/templates/group.js":
/*!************************************!*\
  !*** ./options/templates/group.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = `<div class=\"iframely-option\">\n    <div class=\"iframely-option__group\">\n        <%= elementsHtml %>\n    </div>\n</div>`;\n\n//# sourceURL=webpack:///./options/templates/group.js?");

/***/ }),

/***/ "./options/templates/radio.js":
/*!************************************!*\
  !*** ./options/templates/radio.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = `<div class=\"iframely-option\">\n    <% if (label) { %>\n        <label class=\"iframely-option__label\">\n            <%- label %>:\n        </label>\n    <% } %>\n    <div class=\"iframely-option__group<% if (inline) { %> iframely-option__group-inline<% } %>\">\n        <% items.forEach(function(subContext) { %>\n            <div class=\"iframely-option-check iframely-option-radio\">\n                <input type=\"radio\" class=\"iframely-option-check__input\" id=\"<%- subContext.id %>\" name=\"<%- key %>\" value=\"<%- subContext.value %>\"<% if (subContext.checked) { %> checked=\"checked\"<% } %>>\n                <label class=\"iframely-option-check__label\" for=\"<%- subContext.id %>\">\n                        <%- subContext.label %>\n                </label>\n            </div>\n        <% }); %>\n    </div>\n</div>`;\n\n//# sourceURL=webpack:///./options/templates/radio.js?");

/***/ }),

/***/ "./options/templates/range.js":
/*!************************************!*\
  !*** ./options/templates/range.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = `<div class=\"iframely-option\">\n    <label class=\"iframely-option__label\" for=\"<%- key %>\"><%- label %>:</label>\n    <div class=\"iframely-option__group\">\n        <input type=\"range\" class=\"iframely-option__range\" id=\"<%- key %>\" name=\"<%- key %>\" min=\"<%- min %>\" max=\"<%- max %>\" step=\"1\" value=\"<%- value %>\" style=\"--min: <%- min %>; --max: <%- max %>; --val: <%- value %>;\">\n    </div>\n</div>`;\n\n//# sourceURL=webpack:///./options/templates/range.js?");

/***/ }),

/***/ "./options/templates/select.js":
/*!*************************************!*\
  !*** ./options/templates/select.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = `<div class=\"iframely-option\">\n    <label class=\"iframely-option__label\" for=\"<%- key %>\"><%- label %>:</label>\n    <div class=\"iframely-option__group\">\n        <select class=\"iframely-option__input iframely-option__select\" id=\"<%- key %>\" name=\"<%- key %>\">\n            <% items.forEach(function(subContext) { %>\n                <option value=\"<%- subContext.value %>\"<% if (subContext.checked) { %> selected<% } %>><%- subContext.label %></option>\n            <% }); %>\n        </select>\n    </div>\n</div>`;\n\n//# sourceURL=webpack:///./options/templates/select.js?");

/***/ }),

/***/ "./options/templates/text.js":
/*!***********************************!*\
  !*** ./options/templates/text.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = `<div class=\"iframely-option\">\n    <label class=\"iframely-option__label\" for=\"<%- key %>\"><%- label %>:</label>\n    <div class=\"iframely-option__group\">\n        <input type=\"text\" class=\"iframely-option__input iframely-option__text\" id=\"<%- key %>\" name=\"<%- key %>\" placeholder=\"<%- placeholder %>\" value=\"<%- value %>\">\n    </div>\n</div>`;\n\n//# sourceURL=webpack:///./options/templates/text.js?");

/***/ })

/******/ });