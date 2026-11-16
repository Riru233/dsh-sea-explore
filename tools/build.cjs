/**
 * 组装最终发布用的浏览器产物 client.js。
 *
 * 结构：
 *   window.__ModuleLoader__.load({ id, factory(require) { ... } })
 *     ├── vendor/liquidglass.js   （由 example-tsx/liquidglass.ts 无损转译，
 *     │                            IIFE，把 18 个导出放到 __ShinoLiquidGlass）
 *     └── src/app-body.js         （插件自己的逻辑，末尾 return 插件定义）
 *
 * 两者拼进同一个 factory 作用域：vendor 的 IIFE 产出一个局部变量，
 * app-body 直接读取它，不需要额外的模块解析能力。
 *
 * 用法：node tools/build.cjs
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const vendorFile = path.join(root, 'vendor', 'liquidglass.js')
const bodyFile = path.join(root, 'src', 'app-body.js')
const outFile = path.join(root, 'client.js')

const vendor = fs.readFileSync(vendorFile, 'utf8').trimEnd()
const body = fs.readFileSync(bodyFile, 'utf8').trimEnd()

const indentedVendor = vendor
  .split('\n')
  .map(line => (line.length > 0 ? '      ' + line : line))
  .join('\n')

const indentedBody = body
  .split('\n')
  .map(line => (line.length > 0 ? '      ' + line : line))
  .join('\n')

const output = `/* ============================================================================
 * shinoinject —— 浏览器产物（勿手改）
 *
 * 由 tools/build.cjs 从下面两部分拼装：
 *   vendor/liquidglass.js  —— example-tsx/liquidglass.ts 的无损转译产物
 *                             （tools/convert.cjs，esbuild 只剥离类型）
 *   src/app-body.js        —— 插件的接入与界面逻辑
 *
 * 功能：
 *   1. 聊天消息气泡与用户输入框做成液态玻璃（输入框原本是实底，已透明化）
 *   2. 侧边栏与 Windows 顶部标题带透明
 *   3. 输入框下方一行会话状态
 * ========================================================================== */
window.__ModuleLoader__.load({
  id: 'shinoinject',
  factory(require) {
${indentedVendor}

${indentedBody}
  },
});
`

// 语法自检：拼装结果必须是可解析的脚本。
new Function(output)

fs.writeFileSync(outFile, output, 'utf8')
console.log('built ->', path.relative(root, outFile))
console.log('bytes:', output.length, 'lines:', output.split('\n').length)
