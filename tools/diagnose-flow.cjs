// 诊断：构造真实聊天流结构，找出哪个 GLASS_TARGETS 选择器会误命中
// data-slot="conversation.chat.flow" 及其内部/祖先。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div class="mP3x-q_frame">
    <div class="mP3x-q_centerCol">
      <div data-slot="conversation.chat.flow" id="chat-flow-slot">
        <div class="chat-column" data-chat-flow id="chat-column">
          <div class="chat-group" id="group">
            <div class="chat-node" id="node-user">
              <div data-message-bubble id="bubble">
                <div class="presented" data-presented-file id="presented-in-bubble"></div>
                <div class="code-container" id="code-in-bubble">
                  <div class="banner-wrap"><div data-code-block-banner>JS</div></div>
                  <pre><code>x</code></pre>
                </div>
              </div>
            </div>
            <div class="chat-node" id="node-assistant">
              <div class="code-container" id="code-in-assistant">
                <div class="banner-wrap"><div data-code-block-banner>JS</div></div>
                <pre><code>y</code></pre>
              </div>
            </div>
            <div class="context-body" id="context-body">
              <button class="w30fQq_entry" id="context-entry">ctx</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`)
const d = dom.window.document

const targets = {
  composer: '[data-composer-card]',
  bubble: '[data-message-bubble]',
  presented: '[data-presented-file]',
  menuGlass: '[data-menu-material] > [aria-hidden="true"]:first-child',
  codeBlock: 'div:has(> div > [data-code-block-banner])',
  modal: '[role="dialog"][aria-modal="true"]',
  guide: '[data-sidebar-right-guide-entry], button[class$="_entry"], button[class*="_entry "]:not([class*="_entryCell"]):not([class*="_entryText"]):not([class*="_entryIcon"]):not([class*="_entryDescription"]):not([class*="_entryTitle"])',
  newSession: 'button[class*="_newSession"]',
}

for (const [name, sel] of Object.entries(targets)) {
  let ids
  try { ids = [...d.querySelectorAll(sel)].map(n => n.id || n.tagName) } catch (e) { ids = ['ERR:' + e.message] }
  console.log(name.padEnd(12) + ' -> ' + JSON.stringify(ids))
}

console.log('\n=== 谁命中了 chat-flow-slot 或它的祖先链？')
for (const [name, sel] of Object.entries(targets)) {
  const hit = [...d.querySelectorAll(sel)].some(n =>
    n.id === 'chat-flow-slot' || n.contains(d.getElementById('chat-flow-slot')))
  if (hit) console.log('  !! ' + name + ' 罩住了整个 chat flow')
}
