const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const path = require('path');

module.exports = Merge(CommonConfig, {
    module: {
        rules: [{
            enforce: "pre", //to check source files, not modified by other loaders (like babel-loader)
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "eslint-loader"
        }]
    },
    mode: 'production',
    optimization: {
        minimize: true
    },
    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].min.js'
    }
});