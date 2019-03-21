var checkboxTemplate = require('compile-ejs-loader!./templates/checkbox.ejs');
var rangeTemplate = require('compile-ejs-loader!./templates/range.ejs');
var textTemplate = require('compile-ejs-loader!./templates/text.ejs');
var radioTemplate = require('compile-ejs-loader!./templates/radio.ejs');
var selectTemplate = require('compile-ejs-loader!./templates/select.ejs');
var groupTemplate = require('compile-ejs-loader!./templates/group.ejs');

var templates = {
    checkbox:   checkboxTemplate,
    range:      rangeTemplate,
    text:       textTemplate,
    radio:      radioTemplate,
    select:     selectTemplate,
    group:      groupTemplate
};

module.exports = function(type, context) {
    return templates[type](context);
};