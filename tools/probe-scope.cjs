// 确认 GuideBody 与 chat context 的容器边界，找可用于限定的稳定属性。
const fs = require('node:fs')
const base = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai'

function walk (dir, out, depth) {
  if (!fs.existsSync(dir) || depth > 6) return out
  let ents
  try { ents = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of ents) {
    const p = dir + '/' + e.name
    if (e.isDirectory()) walk(p, out, depth + 1)
    else if (/\.(js|tsx)$/.test(e.name)) {
      let st
      try { st = fs.statSync(p) } catch { continue }
      if (st.size < 12_000_000) out.push(p)
    }
  }
  return out
}

const files = []
walk(base + '/dsh-client-ui-sidebar-right', files, 0)
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const hits = [...new Set(t.match(/data-[a-z0-9-]+/g) || [])]
  console.log(f.split('/').pop() + ': ' + hits.join(', '))
}
