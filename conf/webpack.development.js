const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const path = require('path');

module.exports = Merge(CommonConfig, {
    mode: 'development',
    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].js'
    },
});