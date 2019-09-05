const fs = require('fs')

// 获取文件夹下的文件名称
/**
 * @param {string} folderPath 被读取的文件夹路径
 */
const getFilesName = (folderPath) => {
    let result = {
        dirs: [],
        files: []
    }
    const files = fs.readdirSync(folderPath)
    files.map((item, index) => {
        let stat = fs.lstatSync(`${folderPath}/${item}`)
        if (stat.isDirectory() === true) {
            result.dirs.push(item)
        } else {
            result.files.push(item)
        }
    })

    return result
}

// 检测文件是否存在
/**
 * @param {string} folderPath 被读取的文件夹路径
 */
const fileIsExist = (folderPath) => {
    let err = null
    try {
        fs.accessSync(folderPath, fs.constants.R_OK)
    } catch (error) {
        err = true
        console.error('no such files or directory!')
        console.log(error)
    }

    if (err) {
        return false
    }
    return true
}

// 读取文件方法
/**
 * @param {string} path 被读取的文件路径
 */
const readFileSync = (path) => {
    return fs.readFileSync(path, 'utf8')
}

// 写入文件方法
/**
 * @param {string} path 被写入的文件路径
 * @param {string} data 被写入的文件内容
 */
const writeFileSync = (path, data) => {
    fs.writeFileSync(path, data, {
        encoding: 'utf8',
        flag: 'w'
    });
}

// 往html中注入vendor
/**
 * @param {string} htmlPath 被注入的目标html路径
 * @param {string} vendorFloderPath 注入的资源文件路径
 * @param {string} vendorPrefixPath 资源注入后的src路径 
 * @param {string[]} injectRegEx html中注入资源位置的正则匹配规则
 */
const injectVendor = (htmlPath, vendorFloderPath, vendorPrefixPath, injectRegEx) => {
    let emptyVerdor = `${injectRegEx[0]}\n${injectRegEx[1]}\n`
    if (!fileIsExist(vendorFloderPath)) {
        console.info('vendor 文件夹不存在！')
        writeFileSync(htmlPath, emptyVerdor)
        return
    }

    if (!fileIsExist(htmlPath)) {
        console.info('html 文件不存在！')
        return
    }

    let htmlData = readFileSync(htmlPath)
    let vendorList = getFilesName(vendorFloderPath).files || null
    let srcList = ''
    let newSrc = null

    if (!vendorList || vendorList.length == 0) {
        return
    }
    vendorList.map((item, name) => {
        let arr = item.split('.')
        let len = arr.length
        if (arr[len - 1] !== 'js') {
            return
        }
        let src = `<script src="./${vendorPrefixPath}${item}" async="false"></script>`
        if (htmlData.indexOf(src) > -1) {
            return
        }
        srcList = '\n' + srcList + `\t${src}\n`
    })

    if (!srcList || srcList == '') {
        return
    }

    newSrc = `${injectRegEx[0]}${srcList||'\n'}\t${injectRegEx[1]}`

    htmlData = htmlData.replace(/\<!--[\r\n\t\s]*\[start inject vendors\][\r\n\t\s]*--\>[\r\t\n]*.*[\r\t\n]*\<!--[\r\n\t\s]*\[end inject vendors\][\r\n\t\s]*--\>/, newSrc)
    writeFileSync(htmlPath, htmlData)
}

module.exports = {
    getFilesName,
    fileIsExist,
    readFileSync,
    writeFileSync,
    injectVendor
}