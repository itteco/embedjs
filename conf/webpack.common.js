const path = require('path');
const webpack = require('webpack');

module.exports = {

    context: path.join(process.cwd(), 'src'), //the home directory for webpack

    entry: {
        'embed': './index.js',
        'embed-options': './index-options.js',
        'options': './options/index.js',
        'options.i18n.fr': './options/lang/labels.fr.js',
        'options.i18n.de': './options/lang/labels.de.js'
    },

    resolve: {
        extensions: ['.js'],  // extensions that are used
        modules: [path.join(process.cwd(), 'src'), path.join(process.cwd(), 'node_modules'),] // directories where to look for modules
    },

    module: {
        rules: [{
            test: /\.ejs$/,
            loader: 'ejs-loader',
            options: {
                esModule: false
            }
        }]
    },

    plugins: [
        // ejs-loader compiles templates with lodash's _.template, whose
        // <%- %> escape delimiter emits a runtime reference to `_.escape`.
        // Map that free `_` to a tiny local shim instead of global lodash.
        new webpack.ProvidePlugin({
            _: path.join(process.cwd(), 'src', 'options', 'lodash-shim.js')
        })
    ]
};
