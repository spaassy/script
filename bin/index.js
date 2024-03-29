#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
	throw err;
});

const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);
const utils = require('../utils')
const injectVendor = utils.injectVendor
const clearVendors = utils.clearVendors
const readFileSync = utils.readFileSync
const writeFileSync = utils.writeFileSync
const delDir = utils.delDir
const path = require('path')

const scriptIndex = args.findIndex(
	x => x === 'build' || x === 'start' || x === 'buildSub' || x === 'portalPublish' || x === 'dll' || x === 'clearDll'
	// x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

// src 文件路径
const srcPath = path.resolve(__dirname, '../../../')

const ENV = process.env.NODE_ENV

const sub = process.env.BUILD_TYPE || ''
const _webpack = require(path.resolve(srcPath, '_spaassyConfig.js'))
const SYSTEMNAME = JSON.parse(_webpack.webpack.env_variable[`process.env.SYSTEMNAME`]) + sub

if (['clearDll'].indexOf(script) > -1) {
	let htmlPath = path.resolve(srcPath, 'index.html')
	let injectRegEx = ['<!-- [start inject vendors] -->', '<!-- [end inject vendors] -->']
	clearVendors(htmlPath, injectRegEx)

	// 删除manifest文件夹
	delDir(path.resolve(__dirname, '../dlldev'))
	delDir(path.resolve(__dirname, '../dllpro'))

	// 删除assets vendor
	delDir(path.resolve(process.cwd(), 'src/assets/vendorsDev'))
	delDir(path.resolve(process.cwd(), 'src/assets/vendorsPro'))

	console.log('vendor 已清除！')
	return
}


// 生产vendor之前先清除html中的vendor注入
if (['dll'].indexOf(script) > -1) {
	let htmlPath = path.resolve(srcPath, 'index.html')
	let injectRegEx = ['<!-- [start inject vendors] -->', '<!-- [end inject vendors] -->']
	clearVendors(htmlPath, injectRegEx)

	// 删除manifest文件夹
	let dllPath = ENV === 'development' ? path.resolve(__dirname, '../dlldev') : path.resolve(__dirname, '../dllpro')
	delDir(dllPath)
}

// 往index.html 中注入 vendor
if (['build', 'start', 'buildSub'].indexOf(script) > -1) {
	let htmlPath = path.resolve(srcPath, 'index.html')
	let vendorFloderPath = ENV === 'development' ? path.resolve(srcPath, 'src/assets/vendorsDev') : path.resolve(srcPath, 'src/assets/vendorsPro')
	let vendorPrefixPath = ENV === 'development' ? `${SYSTEMNAME}/assets/vendorsDev/` : `${SYSTEMNAME}/assets/vendorsPro/`
	let injectRegEx = ['<!-- [start inject vendors] -->', '<!-- [end inject vendors] -->']
	injectVendor(htmlPath, vendorFloderPath, vendorPrefixPath, injectRegEx)
}


// 注入.babelrc
const injectBabelrc = () => {
	let babelPath = path.resolve(__dirname, '../.babelrc')
	const babelData = readFileSync(babelPath)
	const outPut = process.cwd()
	writeFileSync(outPut + '/.babelrc', babelData)
	return
}

switch (script) {
	case 'dll':
	case 'portalPublish':
	case 'buildSub':
	case 'build':
	case 'start': {
		injectBabelrc()
		const result = spawn.sync(
			'node',
			nodeArgs
			.concat(require.resolve('./' + script))
			.concat(args.slice(scriptIndex + 1)), {
				stdio: 'inherit'
			}
		);
		if (result.signal) {
			if (result.signal === 'SIGKILL') {
				console.log(
					'The build failed because the process exited too early. ' +
					'This probably means the system ran out of memory or someone called ' +
					'`kill -9` on the process.'
				);
			} else if (result.signal === 'SIGTERM') {
				console.log(
					'The build failed because the process exited too early. ' +
					'Someone might have called `kill` or `killall`, or the system could ' +
					'be shutting down.'
				);
			}
			process.exit(1);
		}
		process.exit(result.status);
		break;
	}
	default:
		console.log('Unknown script "' + script + '".');
		console.log('Perhaps you need to update spaAssy-scripts?');
		console.log("参数不正确！");
		break;
}