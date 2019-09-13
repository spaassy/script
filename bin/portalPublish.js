const portal = require('../../../_spaassyPortalConfig')
const fs = require('fs')
const utils = require('../utils');

// 读取文件方法
const readFileSync = utils.readFileSync

// 写入文件方法
const writeFileSync = utils.writeFileSync

// 读取portald的html文件 保存起来
let portalHtmlData = readFileSync(portal.protalTarget)

const injectLink = '<!-- inject link here -->'
const injectScript = '<!-- inject script here -->'

portal.subProject.map((item, index) => {
    const data = readFileSync(item.target)
    let resource = {
        css: [],
        js: []
    }
    if (!item.resourcePattern) {
        return
    }
    item.resourcePattern.map((sub, current) => {
        const strarry = sub.split('/')
        const len = strarry.length
        let regExp = null
        let strBySplit = strarry[len - 1].split('.')
        let strBySplitLen = strBySplit.length
        let type = strBySplit[strBySplitLen - 1]

        let regStr = ''
        let regStrList = sub.split('*')
        let regStrLen = regStrList.length

        if (regStrLen == 1) {
            regStr = sub
        } else {
            regStrList.map((str, strIndex) => {
                if (str == '') {
                    return
                }

                if (!regStr) {
                    regStr = `${str}`
                } else {
                    regStr = `${regStr}[a-zA-Z0-9]*${str}`
                }
            })
        }

        if (type == 'css') {
            regExp = new RegExp("\(<link href=\"" + `${item.host}${regStr}` + "\" rel=\"stylesheet\"\>)", 'g')
        }
        if (type == 'js') {
            regExp = new RegExp("\(<script type=\"text\/javascript\" src=\"" + `${item.host}${regStr}` + "\"></script>)", 'g')
        }
        const matchStr = data.match(regExp)
        if (!matchStr) {
            return
        }
        resource[type].push(...[matchStr[0]])
    })

    let addLink = ''
    let addScript = ''
    resource.css.map((subCss, indexCss) => {
        if (portalHtmlData.indexOf(subCss) > -1) {
            return
        }
        addLink = addLink + subCss + '\n'
    })
    addLink = addLink && addLink !== '' ? addLink + '\t' + injectLink + '\n' : '\t' + injectLink

    resource.js.map((subJs, indexJs) => {
        if (portalHtmlData.indexOf(subJs) > -1) {
            return
        }
        addScript = addScript + subJs + '\n'
    })
    addScript = addScript + '\t' + injectScript + '\n'

    // 修改portalhtml文件
    portalHtmlData = portalHtmlData.replace(injectLink, addLink)
    portalHtmlData = portalHtmlData.replace(injectScript, addScript)

    let isErr = null

    try {
        writeFileSync(portal.protalTarget, portalHtmlData)
    } catch (err) {
        isErr = err
        console.log(`${item.projectName} 注入失败！`)
        console.log(err)
    }

    if (!isErr) {
        console.log(`${item.projectName} 注入成功！`)
    }
})