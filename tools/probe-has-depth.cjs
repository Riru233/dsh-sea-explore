// 复现 :has() 向上穿透问题：多层嵌套时，选择器命中了多少祖先。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const dom = new JSDOM(`<!doctype html><html><body>
  <div class="app-frame" id="frame">
    <div class="conversation-root" id="conv-root">
      <div class="chat-scroll" id="chat-scroll">
        <div class="chat-view" id="chat-view">
          <div class="chat-flow" id="chat-flow">
            <div class="message-item" id="msg">
              <div class="code-block-container" id="code-container">
                <div class="banner-wrap" id="banner-wrap">
                  <div data-code-block-banner id="banner">JS</div>
                </div>
                <pre><code>x</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`)
const d = dom.window.document

// 当前错误选择器
const bad = 'div:has(> div > [data-code-block-banner])'
// 候选：用 banner 的直接父级的父级，并要求它自身含 pre
const good = 'div:has(> div > [data-code-block-banner]):has(> pre)'

for (const [name, sel] of [['current', bad], ['candidate', good]]) {
  const ids = [...d.querySelectorAll(sel)].map(n => n.id)
  console.log(name + ' (' + sel + ') -> [' + ids.join(', ') + ']')
}
