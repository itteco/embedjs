const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const path = require('path');

module.exports = merge(CommonConfig, {
    mode: 'development',
    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].js'
    },
});
