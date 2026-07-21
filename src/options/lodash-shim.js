// Minimal `_` shim for templates compiled by ejs-loader (lodash _.template).
// The compiled code of the <%- %> escape delimiter references `_.escape` as a
// free variable; webpack's ProvidePlugin maps `_` to this module at build time,
// so no global lodash is needed on the page.
// `escape` mirrors lodash's _.escape: https://lodash.com/docs#escape

var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

module.exports = {
    escape: function(string) {
        return string == null ? '' : String(string).replace(/[&<>"']/g, function(chr) {
            return htmlEscapes[chr];
        });
    }
};
