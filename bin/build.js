#!/usr/bin/env node

const webpackConfig = require('../webpack.pro');
const webpack = require('webpack');

webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
        // Handle errors here
        console.log(err, stats.compilation.errors)
        return;
    }
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }));
    console.log("\n webpack build complete!!!");
});