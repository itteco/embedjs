const path = require('path');

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
            loader: 'compile-ejs-loader',
            options: {
                'htmlmin': true,
                'htmlminOptions': {
                    removeComments: true
                }
            }
        }]
    },

    plugins: [
    ]
};
