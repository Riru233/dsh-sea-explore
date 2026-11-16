// 校验：驱动 root 常驻、所有页面薄纱、菜单玻璃自愈。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const checks = {
  'driver in shell.overlay (root scope)': s.includes("ctx.slots.inject('shell.overlay'"),
  'driver id present': s.includes("id: 'shinoinject-glass-driver'"),
  'driver order 900': s.includes('order: 900'),
  'strip still in composer dock': s.includes("ctx.slots.inject('conversation.composer.dock'"),
  'centerCol veil rule': s.includes('[class*="_centerCol_"]'),
  'frame veil rule with :has': s.includes('[class*="_frame_"]:has(> [class*="_centerCol_"])'),
  'menu layer self-heal exists': s.includes('function protectMenuGlass()'),
  'self-heal called in paint': s.includes('protectMenuGlass();'),
  'restores suppressed filters': s.includes('function restoreSuppressedBackdrop()'),
  'url(#lg-) check': s.includes("indexOf('url(#')"),
  'ancestor filter set none important': s.includes("setProperty('backdrop-filter', 'none', 'important')"),
  'reduced motion guard intact': s.includes('prefers-reduced-motion: reduce'),
  'unified outline single decl': [...s.matchAll(/outline:\s*1px solid rgba\(35, 35, 35, 0\.3\)/g)].length === 1,
  'all timing intact': s.includes('shino-menu-item-in 0.3s') && s.includes('var(--shino-menu-index, 0) * 0.1s'),
}

let bad = 0
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? 'OK   ' : 'FAIL ') + k)
  if (!v) bad++
}
process.exit(bad ? 1 : 0)
