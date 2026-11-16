const fs = require('node:fs')
const p = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-client-ui-chat/lib/client.js'
const t = fs.readFileSync(p, 'utf8')
for (const key of ['w30fQq_entry', 'w30fQq_context']) {
  let i = -1, n = 0
  while ((i = t.indexOf(key, i + 1)) !== -1 && n < 3) {
    n++
    console.log('=== ' + key + '\n' + JSON.stringify(t.slice(Math.max(0, i - 500), i + 400)))
  }
}
