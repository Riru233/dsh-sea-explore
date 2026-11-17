// 确认用户气泡在聊天流内部时仍会被玻璃化（不被祖先判定误伤）。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div data-slot="conversation.chat.flow" id="flow">
    <div data-chat-flow id="flow2">
      <div id="node">
        <div data-message-bubble id="bubble">
          <div id="code">
            <div class="bw"><div data-code-block-banner>JS</div></div>
            <pre><code>x</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`)
const d = dom.window.document

const FLOW = '[data-slot="conversation.chat.flow"], [data-chat-flow]'
const CODE = 'div:has(> div > [data-code-block-banner])'
// 与实现一致：deepest 目标只保留最深的候选
function deepestOnly (list) {
  return list.filter(el => !list.some(other => other !== el && el.contains(other)))
}
function wouldGlass (el, deepest) {
  if (deepest) {
    const cands = [...el.ownerDocument.querySelectorAll(CODE)]
    if (!deepestOnly(cands).includes(el)) return false
  }
  const insideFlow = el.closest(FLOW) !== null
  if (!insideFlow && el.querySelector(FLOW) !== null) return false
  return true
}

const bubble = d.getElementById('bubble')
const code = d.getElementById('code')
const node = d.getElementById('node')
const flow2 = d.getElementById('flow2')
const flow = d.getElementById('flow')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('bubble is glassed', wouldGlass(bubble, false))
check('code block is glassed', wouldGlass(code, true))
check('message node is NOT glassed', !wouldGlass(node, true))
check('chat flow container NOT glassed', !wouldGlass(flow2, true))
check('flow slot wrapper NOT glassed', !wouldGlass(flow, true))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
