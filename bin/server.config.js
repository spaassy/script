const path = require('path')
const srcPath = path.resolve(__dirname, '../../')

const serverConfig = require(path.resolve(srcPath, '_webpack.js')).server

const config = {
    host: '127.0.0.1',
    port: 8989,
    proxy: [{
        path: '/api',
        option: {
            target: 'http://127.0.0.1:8989',
            pathRewrite: {
                '^/api': "/"
            },
            changeOrigin: true
        }
    }]
}

if(serverConfig){
    config = serverConfig
}

module.exports = config;