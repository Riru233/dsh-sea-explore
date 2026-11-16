// 诊断2：模拟真实宿主结构，确认 (a) 哪些选择器会罩住整个 chat flow，
// (b) 用户气泡/产物框是否被玻璃目标命中。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div class="mP3x-q_frame">
    <div class="mP3x-q_centerCol">
      <div data-slot="conversation.chat.flow" id="chat-flow-slot">
        <div class="chat-column" data-chat-flow id="chat-column">
          <div id="group">
            <div id="node-user">
              <div data-message-bubble id="bubble">
                <div data-presented-file id="presented"></div>
                <div id="code-in-bubble">
                  <div class="bw"><div data-code-block-banner>JS</div></div>
                  <pre><code>x</code></pre>
                </div>
              </div>
            </div>
            <div id="context-body">
              <button class="w30fQq_entry" id="context-entry">ctx</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`)
const d = dom.window.document

const flow = d.getElementById('chat-flow-slot')

const candidates = {
  'CODE_BLOCK(2层)': 'div:has(> div > [data-code-block-banner])',
  'CODE_BLOCK+pre': 'div:has(> div > [data-code-block-banner]):has(> pre)',
  'GUIDE(class$)': 'button[class$="_entry"]',
  'GUIDE(全)': '[data-sidebar-right-guide-entry], button[class$="_entry"], button[class*="_entry "]:not([class*="_entryCell"]):not([class*="_entryText"]):not([class*="_entryIcon"]):not([class*="_entryDescription"]):not([class*="_entryTitle"])',
}

console.log('=== 命中结果 ===')
for (const [name, sel] of Object.entries(candidates)) {
  const nodes = [...d.querySelectorAll(sel)]
  const ids = nodes.map(n => n.id || n.tagName)
  const wraps = nodes.filter(n => n.contains(flow)).map(n => n.id || n.tagName)
  console.log(name.padEnd(16) + ' -> ' + JSON.stringify(ids) + (wraps.length ? '   !! 罩住整个 flow: ' + JSON.stringify(wraps) : ''))
}

console.log('\n=== 祖先包裹检查（真正的风险） ===')
// 一个元素若包含 chat-flow，它就是整片区域的容器，绝不能被玻璃化
const wrapCheck = 'div:has(> div > [data-code-block-banner])'
for (const n of d.querySelectorAll(wrapCheck)) {
  console.log((n.contains(flow) ? 'DANGER ' : 'safe   ') + (n.id || n.tagName))
}
