const portal = require('../../../_spaassyProralConfig')
const fs = require('fs')

// 读取文件方法
const readFileSync = (path) => {
    return fs.readFileSync(path, 'utf8')
}

// 写入文件方法
const writeFileSync = (path, data) => {
    fs.writeFileSync(path, data, {
        encoding: 'utf8',
        flag: 'w'
    });
}

// 读取portald的html文件 保存起来
let portalHtmlData = readFileSync(portal.protalTarget)

const injectLink = '<!-- inject link here -->'
const injectScript = '<!-- inject script here -->'

portal.subProject.map((item, index) => {
    const data = readFileSync(item.target)
    const resource = {
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
        let type = strarry[len - 1].split('.')[1]

        if (type == 'css') {
            regExp = new RegExp("\<link href=\"" + `${item.host}${sub}` + "\" rel=\"stylesheet\"\>")
        }
        if (type == 'js') {
            regExp = new RegExp("\<script type=\"text\/javascript\" src=\"" + `${item.host}${sub}` + "\"></script>")
        }
        const matchStr = data.match(regExp)
        resource[type].push(...matchStr)
    })

    let addLink = ''
    let addScript = ''
    resource.css.map((subCss, indexCss) => {
        if (portalHtmlData.indexOf(subCss) > -1) {
            return
        }
        addLink = addLink + subCss + '\n'
    })
    addLink = addLink + '\t' + injectLink + '\n'

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