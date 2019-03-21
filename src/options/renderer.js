var ejs = require('ejs');

var checkboxTemplate = require('./templates/checkbox');
var rangeTemplate = require('./templates/range');
var textTemplate = require('./templates/text');
var radioTemplate = require('./templates/radio');
var selectTemplate = require('./templates/select');
var groupTemplate = require('./templates/group');

var templates = {
    checkbox:   checkboxTemplate,
    range:      rangeTemplate,
    text:       textTemplate,
    radio:      radioTemplate,
    select:     selectTemplate,
    group:      groupTemplate
};

module.exports = function(type, context) {
    return ejs.render(templates[type], context);
};