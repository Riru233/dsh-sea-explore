// 校验：滤镜挂专用子层；不再压祖先；菜单层自身 filter 关闭。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const checks = {
  'filter layer css exists': s.includes('[data-shino-filter]'),
  'filter layer absolute inset': /\[data-shino-filter\]\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/.test(s),
  'filter layer pointer-events none': /\[data-shino-filter\]\s*\{[^}]*pointer-events:\s*none/.test(s),
  'glass target isolation': /\[data-shino-glass\]\s*\{\s*isolation:\s*isolate/.test(s),
  'creates filter child': s.includes("document.createElement('div')") && s.includes("setAttribute('data-shino-filter'"),
  'makeGlass on filter child': /appendChild\(filter\);\s*\n\s*LG\.makeGlass\(filter\)/.test(s),
  'menu layer host filter disabled': /\[data-menu-material\]\s*>\s*\[aria-hidden="true"\]:first-child\s*\{[^}]*backdrop-filter:\s*none\s*!important/.test(s),
  'no ancestor suppression map': !s.includes('suppressedBackdrop'),
  'no protectMenuGlass': !s.includes('protectMenuGlass'),
  'no parent filter set none': !s.includes("setProperty('backdrop-filter', 'none', 'important')"),
  'menu filter child branch': s.includes("querySelectorAll(MENU_GLASS_LAYER)"),
  'root driver intact': s.includes("ctx.slots.inject('shell.overlay'"),
  'unified outline intact': [...s.matchAll(/outline:\s*1px solid rgba\(35, 35, 35, 0\.3\)/g)].length === 1,
  'timing intact': s.includes('shino-menu-item-in 0.3s') && s.includes('var(--shino-menu-index, 0) * 0.1s'),
}

let bad = 0
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? 'OK   ' : 'FAIL ') + k)
  if (!v) bad++
}
process.exit(bad ? 1 : 0)
