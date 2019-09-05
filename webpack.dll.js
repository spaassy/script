const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {
    BundleAnalyzerPlugin
} = require('webpack-bundle-analyzer')
const ENV = process.env.NODE_ENV

const srcPath = path.resolve(__dirname, '../../')
const _webpack = require(path.resolve(srcPath, '_spaassyConfig.js'))

const sub = process.env.BUILD_TYPE || ''
const SYSTEMNAME = JSON.parse(_webpack.webpack.env_variable[`process.env.SYSTEMNAME`]) + sub


let dllConfig = {
    entry: {
        ..._webpack.webpack.dll.entry
    },
    output: {
        path: ENV === 'development' ? path.resolve(srcPath, 'src/assets/vendorsDev') : path.resolve(srcPath, 'src/assets/vendorsPro'),
        filename: ENV === 'development' ? 'dll.[name].dev.js' : 'dll.[name].js',
        publicPath: './',
        library: '[name]_dll'
    },
    module: {
        rules: [{
            test: /\.(gif|jpg|jpeg|png|svg)$/i,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 1024,
                    name: SYSTEMNAME + '/assets/images/[name].[hash:5].[ext]'
                }
            }]
        }, ]
    },
    mode: ENV,
    plugins: [
        new CleanWebpackPlugin({
            cleanoncebeforebuildpatterns: [
                path.resolve(srcPath, 'src/assets/', `${ENV === 'development' ? 'vendorsDev' : 'vendorsPro'}`),
                path.resolve(__dirname, `${ENV === 'development' ? 'dlldev' : 'dllpro'}`)
            ]
        }),
        new webpack.DllPlugin({
            context: process.cwd(),
            name: "[name]_dll",
            path: path.join(__dirname, `dll${ENV==='development'?'dev':'pro'}`, '[name]-manifest.json')
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static'
        })
    ]
}

module.exports = dllConfig