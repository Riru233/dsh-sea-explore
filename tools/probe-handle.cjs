const fs = require('node:fs')
const path = require('node:path')
const base = 'C:/Users/11251/AppData/Local/Programs/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai'
const lines = fs.readFileSync(path.join(base, 'dsh-client-ui-layout/src/client/AppFrame.tsx'), 'utf8').split('\n')
for (let i=65;i<122;i++) console.log((i+1)+': '+lines[i])
