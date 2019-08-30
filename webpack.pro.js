const merge = require("webpack-merge");
const webpackConfig = require("./webpack.config");
const webpack = require("webpack")
const path = require('path')


const _webpack = require(path.resolve(srcPath, '_spaassyConfig.js'))

const webpackPro = {
    entry: ['./src/index.jsx'],
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":JSON.stringify(process.env.NODE_ENV),
            ..._webpack.env_variable || null
        })
    ]
};

module.exports = merge(webpackConfig, webpackPro);