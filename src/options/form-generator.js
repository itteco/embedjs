var _RE = /^_./;

var translate = function (label, translator) {
    return translator && typeof translator === 'function' 
        ? translator (label) || label
        : label;
};

module.exports = function(options, translator) {

    if (!options) {
        return [];
    }

    // Remove query key.
    options = Object.assign({}, options);
    delete options.query;

    var items = [];
    var keys = Object.keys(options);
    var checkboxCount = 0;
    
    keys.forEach(function(key) {
        
        var context = {};

        var getQuery;
        var option = options[key];
        option.key = key;

        var forceCheckboxForSingleKeyValue;
        var valuesKeys = option.values && Object.keys(option.values);
        var singleKey, singleLabel;
        if (valuesKeys && valuesKeys.length === 1) {
            forceCheckboxForSingleKeyValue = true;
            singleKey = valuesKeys[0];
            singleLabel = option.values[singleKey];
        }

        context.label = translate(singleLabel || option.label, translator);
        context.key = option.key;

        if (forceCheckboxForSingleKeyValue || typeof option.value === 'boolean') {

            if (forceCheckboxForSingleKeyValue) {
                context.checked = (singleKey === option.value) || (!singleKey && !option.value);
            } else {
                context.checked = option.value;
            }

            checkboxCount++;

            items.push({
                type: 'checkbox',
                context: context,
                order: _RE.test(key) ? 0 : 1,
                getQuery: function(checked) {

                    var value;
                    if (forceCheckboxForSingleKeyValue) {
                        value = checked ? singleKey : '';
                    } else {
                        value = checked;
                    }

                    var result = {};

                    if (forceCheckboxForSingleKeyValue) {
                        if (value === '') {
                            // Empty.
                        } else {
                            result[option.key] = value;
                        }
                    } else {
                        result[option.key] = checked;
                    }
                    return result;
                }
            });

        } else if ((typeof option.value === 'number' || typeof option.value === 'string') && !option.values) {

            var useSlider = option.range && typeof option.range.min === 'number' && typeof option.range.max === 'number';
            var useNumber = typeof option.value === 'number';

            context.value = option.value;

            getQuery = function(inputValue) {
                var result = {};
                if (inputValue === '') {
                    // Empty.
                } else {
                    result[option.key] = inputValue;
                }
                return result;
            };

            if (useSlider) {
                context.min = option.range.min;
                context.max = option.range.max;
                items.push({
                    type: 'range',
                    context: context,
                    order: 9, // last one
                    getQuery: getQuery
                });
            } else {
                context.placeholder = translate(option.placeholder || '', translator);
                context.inputType = useNumber ? 'number' : 'text';
                items.push({
                    type: 'text',
                    context: context,
                    order: /start/i.test(key) ? 7 : 8, // start/end for player timing, ex.: youtube
                    getQuery: getQuery
                });
            }

        } else if (option.values) {

            context.value = option.value + '';

            getQuery = function(inputValue) {
                var result = {};
                if (inputValue === '') {
                    // Empty.
                } else {
                    result[option.key] = inputValue;
                }
                return result;
            };

            if (Object.keys(option.values).length <= 3) {

                if (option.label) {
                    context.label = translate(option.label, translator);
                } else {
                    context.label = false;
                }

                var i = 0;
                var hasLongLabel = false;
                var values = Object.values(option.values);
                while (i < values.length && !hasLongLabel) {
                    var label = values[i];
                    hasLongLabel = label.length > 8;
                    i++;
                }
                context.inline = !hasLongLabel;

                context.items = [];

                Object.keys(option.values).forEach(function(key, idx2) {
                    context.items.push({
                        id: context.key + '-' + idx2,
                        value: key,
                        label: translate(option.values[key], translator),
                        checked: context.value === key
                    });
                });

                items.push({
                    type: 'radio',
                    context: context,
                    order: hasLongLabel ? -3 : (!/theme/.test(key) ? -2 : -1),
                    getQuery: getQuery
                });

            } else {

                context.items = [];

                Object.keys(option.values).forEach(function(key) {
                    context.items.push({
                        value: key,
                        label: translate(option.values[key], translator),
                        checked: context.value === key
                    });
                });

                items.push({
                    type: 'select',
                    context: context,
                    order: 5,
                    getQuery: getQuery
                });
            }
        }
    });

    items.sort(function(a, b) {
        return a.order - b.order;
    });

    items.forEach(function(item) {
        delete item.order;
    });

    if (checkboxCount > 0) {

        var groupedItems = [];
        var subItems;

        items.forEach(function(item, idx) {

            if (item.type === 'checkbox') {

                // Grouping for checkboxes.

                var newCheckboxGroup = 
                    checkboxCount > 2
                    && idx > 0 
                    && !_RE.test(item.context.key) 
                    && items[idx - 1].type === 'checkbox'
                    && _RE.test(items[idx - 1].context.key);

                if (!subItems               // First group.
                    || newCheckboxGroup     // Second group on _ prefix removed.
                ) {

                    subItems = [];
                    groupedItems.push({
                        type: 'group',
                        context: {
                            elements: subItems
                        }
                    });
                }

                subItems.push(item);

            } else {
                // Other items. Just add.
                groupedItems.push(item);
            }
        });

        return groupedItems;

    } else {
        return items;
    }
};