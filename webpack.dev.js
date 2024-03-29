const merge = require("webpack-merge");
const webpackConfig = require("./webpack.config");
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const hostConfig = require('./bin/server.config');
const webpack = require('webpack');
const path = require('path')


const srcPath = path.resolve(__dirname, '../../')
const _webpack = require(path.resolve(srcPath, '_spaassyConfig.js')).webpack

const webpackDev = {
    entry: ['./src/index.jsx', 'webpack-hot-middleware/client?path=./__webpack_hmr&noInfo=true&reload=true'],
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            ..._webpack.env_variable || null
        }),
        new webpack.HotModuleReplacementPlugin(),
        new OpenBrowserPlugin({
            url: "http://" + hostConfig.host + ":" + hostConfig.port
        })
    ]
};

module.exports = merge(webpackConfig, webpackDev);