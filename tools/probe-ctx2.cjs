// 确认 data-context-menu 与材质层的确切关系。
const fs = require('node:fs')
const path = require('node:path')

const base = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai'
const js = fs.readFileSync(path.join(base, 'dsh-web-frontend/dist/assets/index-Ciz7DZxv.js'), 'utf8')

// Ed 组件：surface 上的 data-* 属性从 props 展开
const at = js.indexOf('"data-menu-material":"translucent"')
console.log('=== surface JSX')
console.log(JSON.stringify(js.slice(at - 400, at + 400)))

// data-context-menu 的赋值条件
const i = js.indexOf('"data-context-menu":V?')
console.log('\n=== context-menu 条件')
console.log(JSON.stringify(js.slice(i - 160, i + 240)))
