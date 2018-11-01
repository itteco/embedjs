const path = require('path');

module.exports = {

    context: path.join(process.cwd(), 'src'), //the home directory for webpack

    entry: {
        embed: './index.js'
    },

    resolve: {
        extensions: ['.js'],  // extensions that are used
        modules: [path.join(process.cwd(), 'src')] // directories where to look for modules
    },

    plugins: [
    ]
};