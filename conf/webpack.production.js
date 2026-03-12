const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = merge(CommonConfig, {
    mode: 'production',
    optimization: {
        minimize: true
    },
    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].min.js'
    },
    plugins: [
        new ESLintPlugin({
            extensions: ['js'],
            exclude: 'node_modules'
        })
    ]
});
