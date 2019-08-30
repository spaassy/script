const path = require('path')
const srcPath = path.resolve(__dirname, '../../../')

const serverConfig = require(path.resolve(srcPath, '_spaassyConfig.js')).server

let config = {
    host: '127.0.0.1',
    port: 8080,
    proxy: [
        //     {
        //     path: '/api',
        //     option: {
        //         target: 'http://127.0.0.1:8989',
        //         pathRewrite: {
        //             '^/api': "/"
        //         },
        //         changeOrigin: true
        //     }
        // }
    ]
}

if (serverConfig) {
    config = serverConfig
}

module.exports = config;