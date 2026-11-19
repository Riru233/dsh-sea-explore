// 验证提问卡玻璃目标：只命中内层 card，不命中外层 frame。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const dom = new JSDOM(`<!doctype html><html><body>
  <!-- 模型提问：QuestionComposer 的 frame > card -->
  <div class="wnLwla_frame" data-question-key="k1" id="question-frame">
    <div class="wnLwla_card" id="question-card">
      <header><h2>提问</h2></header>
      <div class="wnLwla_body"></div>
    </div>
  </div>

  <!-- 上下文里的用户问答回复：QuestionReplyView -->
  <div class="r_row" data-question-reply="call-1" data-reply-outcome="answered" id="reply">
    <div class="r_bubbleWidth" id="bubble-width">
      <div class="_bubble_1sgyj_1" id="reply-bubble"><dl><dt>Q</dt><dd>A</dd></dl></div>
    </div>
    <div class="r_actions" id="reply-actions"><span>10:00</span><button>copy</button></div>
  </div>
</body></html>`)
const d = dom.window.document

// 从 client.js 中提取实际常量（验证源码与选择器一致）
const qMatch = /const QUESTION_CARD = '([^']+)'/.exec(code)
const QUESTION_CARD = qMatch !== null ? qMatch[1] : '[data-question-key]'
const REPLY_BUBBLE = '[data-question-reply] > div > div'

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('selector targets inner card', /\[data-question-key\] > \[class\*="?_?card"?\]/.test(QUESTION_CARD), QUESTION_CARD)
check('glass marked on card', code.includes("'data-shino-question-card'"))

const q = [...d.querySelectorAll(QUESTION_CARD)].map(n => n.id)
check('inner card matched', q.includes('question-card'), JSON.stringify(q))
check('outer frame NOT matched', !q.includes('question-frame'), JSON.stringify(q))

// frame 保持透明无边框
check('frame forced transparent', /\[data-question-key\] \{\s*background: transparent !important;\s*border: 0 !important/.test(code))
check('card glass CSS', /\[data-shino-question-card\] \{\s*background: color-mix/.test(code))

const r = [...d.querySelectorAll(REPLY_BUBBLE)].map(n => n.id)
check('reply bubble matched', r.includes('reply-bubble'), JSON.stringify(r))
check('reply actions NOT matched', !r.includes('reply-actions'), JSON.stringify(r))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
