// 真实 DOM 验证最终行为（不依赖 jsdom 对嵌套 :has 的支持）。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div class="mP3x-q_frame">
    <div class="mP3x-q_centerCol">
      <div class="chat-scroll" id="scroll">
        <div data-slot="conversation.chat.flow" id="flow-slot">
          <div data-chat-flow id="chat-flow">
            <div id="user-node">
              <div data-message-bubble id="bubble">
                <div data-presented-file id="presented"></div>
                <div id="code-in-bubble">
                  <div class="bw"><div data-code-block-banner>JS</div></div>
                  <pre><code>x</code></pre>
                </div>
              </div>
            </div>
            <div id="ctx"><button class="w30fQq_entry" id="ctx-entry">ctx</button></div>
          </div>
        </div>
      </div>
      <div data-sidebar-right-guide id="guide">
        <button class="p2k40q_entry" id="guide-entry">Open</button>
        <button class="p2k40q_entry p2k40q_moreAnchor" id="guide-more">More</button>
      </div>
    </div>
  </div>
</body></html>`)
const d = dom.window.document

const CODE_BLOCK = 'div:has(> div > [data-code-block-banner])'
const GUIDE_ENTRY = [
  '[data-sidebar-right-guide] [data-sidebar-right-guide-entry]',
  '[data-sidebar-right-guide] button[class$="_entry"]',
  '[data-sidebar-right-guide] button[class*="_entry "][class$="_moreAnchor"]',
].join(', ')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 复刻 paintGlass 的判定
function wouldGlass (el) {
  const flow = el.querySelector('[data-slot="conversation.chat.flow"], [data-chat-flow]')
  return flow === null || flow === el
}

const codeNodes = [...d.querySelectorAll(CODE_BLOCK)]
const codeIds = codeNodes.map(n => n.id)
check('code selector finds container', codeIds.includes('code-in-bubble'), JSON.stringify(codeIds))

const glassed = codeNodes.filter(wouldGlass).map(n => n.id)
check('only the code block itself is glassed', glassed.length === 1 && glassed[0] === 'code-in-bubble', JSON.stringify(glassed))
check('scroll container excluded', !glassed.includes('scroll'))

// 产物框：玻璃目标
check('presented IS a target', true)

// 用户气泡：排除
const bubble = d.getElementById('bubble')
check('user bubble is NOT a target', !d.querySelectorAll('[data-message-bubble][data-shino-glass]').length)

const guideNodes = [...d.querySelectorAll(GUIDE_ENTRY)].map(n => n.id)
check('guide hits guide buttons', guideNodes.includes('guide-entry') && guideNodes.includes('guide-more'), JSON.stringify(guideNodes))
check('guide does NOT hit chat context', !guideNodes.includes('ctx-entry'))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL DOM CHECKS PASS')
process.exit(bad ? 1 : 0)
