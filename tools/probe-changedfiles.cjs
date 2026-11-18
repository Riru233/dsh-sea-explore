const fs = require('node:fs')
const path = require('node:path')
const base = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai'
const p = path.join(base, 'dsh-client-ui-deliverables/src/client/ChangedFiles.module.css')
console.log('=== exists:', fs.existsSync(p))
if (fs.existsSync(p)) {
  const t = fs.readFileSync(p, 'utf8')
  t.split('\n').forEach((l, i) => { if (/^\.(card|header|tile|titles|title|list|row)|background/.test(l)) console.log((i+1)+': '+l.trim()) })
}
