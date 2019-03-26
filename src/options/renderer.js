var checkboxTemplate = require('./templates/checkbox.ejs');
var rangeTemplate = require('./templates/range.ejs');
var textTemplate = require('./templates/text.ejs');
var radioTemplate = require('./templates/radio.ejs');
var selectTemplate = require('./templates/select.ejs');
var groupTemplate = require('./templates/group.ejs');

var templates = {
    checkbox:   checkboxTemplate,
    range:      rangeTemplate,
    text:       textTemplate,
    radio:      radioTemplate,
    select:     selectTemplate,
    group:      groupTemplate
};

module.exports = function(type, context) {
    var template = templates[type];
    var renderedTemplate = template(context);
    return renderedTemplate;
};