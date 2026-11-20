// 探查侧边栏菜单与 tooltip 的 DOM 结构与类名。
const fs = require('node:fs')
const path = require('node:path')
const base = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai'

function walk (d, out, dep) {
  if (!fs.existsSync(d) || dep > 9) return out
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, out, dep + 1)
    else if (/\.(tsx|ts|css)$/.test(e.name)) out.push(p)
  }
  return out
}

// Tooltip 组件：找 role=tooltip / data-tooltip
console.log('=== Tooltip 组件结构')
for (const f of walk(base, [], 0)) {
  if (!/tooltip|Tooltip/i.test(path.basename(f))) continue
  let t; try { t = fs.readFileSync(f, 'utf8') } catch { continue }
  if (!/role=|data-tooltip|className=\{css/.test(t)) continue
  console.log('\n### ' + path.relative(base, f))
  t.split('\n').forEach((l, i) => {
    if (/role=|data-tooltip|data-placement|className=\{css\.(root|bubble|content|tooltip)/.test(l)) {
      console.log((i + 1) + ': ' + l.trim().slice(0, 175))
    }
  })
}
