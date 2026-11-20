// 验证模态框缩放弹出动画。
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

const SEL = '\\[role="dialog"\\]\\[aria-modal="true"\\]\\[data-shino-glass\\]'

check('modal pop animation applied', new RegExp(SEL + ' \\{[^}]*animation: shino-modal-pop-in').test(code))
check('animation uses backwards fill', /animation: shino-modal-pop-in 0\.26s cubic-bezier\(0\.2, 1\.1, 0\.35, 1\) backwards/.test(code))
check('transform-origin center', new RegExp(SEL + ' \\{[^}]*transform-origin: center').test(code))
check('keyframes defined', /@keyframes shino-modal-pop-in \{\s*from \{ transform: scale\(0\.94\); \}\s*to \{ transform: scale\(1\); \}/.test(code))
check('reduced-motion respected', /@media \(prefers-reduced-motion: reduce\) \{\s*\[role="dialog"\]\[aria-modal="true"\]\[data-shino-glass\] \{\s*animation: none !important/.test(code))
check('glass still on panel itself (anim-safe)', !/\[role="dialog"\]\[aria-modal="true"\]:has\(.*data-shino-glass/.test(code))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
