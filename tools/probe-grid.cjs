const fs = require('node:fs')
const path = require('node:path')
const base = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai'
const css = fs.readFileSync(path.join(base, 'dsh-client-ui-layout/src/client/AppFrame.module.css'), 'utf8')
const lines = css.split('\n')
// 找所有 grid-column / grid-row 定义
console.log('=== grid-column/grid-row 定义')
lines.forEach((l, i) => {
  if (/grid-column|grid-row|grid-area/.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 150))
})
console.log('\n=== frame / 各 Col 规则上下文')
for (const key of ['.frame {', '.sidebarCol {', '.centerCol {', '.rightbarCol {', '.bottomRow {', '.overlayLayer {', '.leadingSeat {']) {
  const i = lines.findIndex(l => l.trim() === key)
  if (i < 0) continue
  console.log('\n--- ' + key + ' @' + (i+1))
  for (let j = i; j < Math.min(i + 14, lines.length); j++) console.log((j+1) + ': ' + lines[j])
}
