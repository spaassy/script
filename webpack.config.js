const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPugin = require('copy-webpack-plugin')
const dev_env = process.env.NODE_ENV == 'devlopment';

const srcPath = path.resolve(__dirname, '../../')
const _webpack = require(path.resolve(srcPath, '_spaassyConfig.js'))

let alias = {
    ..._webpack.webpack.alias
} || {
    '@': path.resolve(srcPath, 'src'),
    '@assets': path.resolve(srcPath, 'src/assets'),
    '@http': path.resolve(srcPath, 'src/httpServer'),
    '@views': path.resolve(srcPath, 'src/views'),
    '@commonComponents': path.resolve(srcPath, 'src/commonComponents')
}

const sub = process.env.BUILD_TYPE || ''
const SYSTEMNAME = JSON.parse(_webpack.webpack.env_variable[`process.env.SYSTEMNAME`]) + sub

module.exports = {
    output: {
        path: path.resolve(srcPath, 'dist' + sub),
        filename: SYSTEMNAME + '/bundle.js',
        publicPath: './'
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
            },
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader",
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [dev_env ? "style-loader" : {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            minimize: true,
                            publicPath: '../'
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    }
                ],
            },
            {
                test: /\.less$/,
                use: [dev_env ? "style-loader" : {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            minimize: true,
                            publicPath: '../'
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            // url: false 不可以设置为false 否则会导致css里的url不处理
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            // url: false 不可以设置为false 否则会导致css里的url不处理
                        }
                    } //
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: SYSTEMNAME + '[name].css',
            chunkFilename: SYSTEMNAME + '[id].css',
        }),
        new HtmlWebpackPlugin({
            title: 'My App',
            template: 'index.html',
            filename: 'index.html'
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPugin([{
            from: path.join(srcPath, 'src/assets'),
            to: path.join(srcPath, 'dist' + sub + '/' + SYSTEMNAME, 'assets')
        }])
    ],
    resolve: {
        //配置别名，在项目中可缩减引用路径
        alias: alias,
        extensions: ['.jsx', '.js', '.json', '.scss', '.css', '.less']
    }
};