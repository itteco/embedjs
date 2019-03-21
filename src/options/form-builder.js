var getFormElements = require('./form-generator');
var iframely = require('../iframely');

var UIelements = {
    checkbox: {
        getValue: function(inputs) {
            var input = inputs[0];
            return input.checked;
        }
    },
    text: {
        customEvents: function(inputs, submitOptionsCb) {
            var input = inputs[0];
            iframely.addEventListener(input, 'click', function() {
                input.select();
            });
            iframely.addEventListener(input, 'blur', submitOptionsCb);
            iframely.addEventListener(input, 'keyup', function(e) {
                // Apply on enter.
                if (e.keyCode === 13) {
                    submitOptionsCb();
                }
            });
        }
    },
    radio: {
        getValue: function(inputs) {
            var selectedInput;
            inputs.forEach(function(input) {
                if (input.checked) {
                    selectedInput = input;
                }
            });
            return selectedInput.value;
        }
    }
};

var defaultQueryById = {};

module.exports = function(params) {

    var options = params.options;
    var formContainer = params.formContainer;

    if (!options) {
        formContainer.innerHTML = '';
        return;
    }

    var elements = getFormElements(options, params.translator);
    var id = params.id;
    var renderer = params.renderer;

    var defaultQuery = defaultQueryById[id] = defaultQueryById[id] || {};
    // Exclude default values.
    Object.keys(options).forEach(function(key) {
        if (!options.query || options.query.indexOf(key) === -1) {
            // Store default value.
            defaultQuery[key] = options[key].value;
        }
    });

    function getQueryFromForm() {

        var query = {};

        var getOptionsFromElements = function(elements) {
            // Get options from all inputs.
            elements.forEach(function(element) {

                if (element.context && element.context.elements) {

                    getOptionsFromElements(element.context.elements);

                } else if (element.inputs) {

                    var elementUI = UIelements[element.type];
                    var inputValue;
                    if (elementUI && elementUI.getValue) {
                        inputValue = elementUI.getValue(element.inputs);
                    } else {
                        inputValue = element.inputs[0].value;
                    }
                    Object.assign(query, element.getQuery(inputValue));
                }
            });
        };

        getOptionsFromElements(elements);
        
        return query;
    }

    function getAndSubmitOptions() {
        var query = getQueryFromForm();

        Object.keys(defaultQuery).forEach(function(key) {
            if (defaultQuery[key] === query[key] 
                || query[key] === undefined) { // remove undefined so it's not included while JSON.stringify
                delete query[key];
            }
        });

        iframely.trigger('options-changed', id, formContainer, query);
    }

    // Render form.
    var renderElements = function(elements) {
        var html = '';
        elements.forEach(function(element) {
            if (element.context && element.context.elements) {
                element.context.elementsHtml = renderElements(element.context.elements);
            }
            html += renderer(element.type, element.context || {});
        });
        return html;
    };
    formContainer.innerHTML = renderElements(elements);

    // Bind events.
    var bindElements = function(elements) {
        
        elements.forEach(function(element) {

            if (element.context && element.context.elements) {

                bindElements(element.context.elements);

            } else {

                var elementUI = UIelements[element.type];
                if (element.context) {
                    element.inputs = formContainer.querySelectorAll('[name="' + element.context.key + '"]');
                    if (element.inputs.length > 0) {
                        if (elementUI && elementUI.customEvents) {
                            elementUI.customEvents(element.inputs, getAndSubmitOptions);
                        } else {
                            element.inputs.forEach(function(input) {
                                iframely.addEventListener(input, 'change', getAndSubmitOptions);
                            });
                        }
                    } else {
                        console.warn('No inputs found for option', element.key);
                    }
                }
            }
        });
    };
    bindElements(elements);
};