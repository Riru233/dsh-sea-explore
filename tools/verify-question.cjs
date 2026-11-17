// 验证提问卡与问答回复卡的定位选择器。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <!-- 模型提问：QuestionComposer 的 frame -->
  <div class="q_frame" data-question-key="k1" id="question">
    <header><h2>提问</h2></header>
    <div class="q_body" id="q-body"></div>
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

const QUESTION_CARD = '[data-question-key]'
// 问答回复里的气泡：row > bubbleWidth > bubble（排除 actions 行）
const REPLY_BUBBLE = '[data-question-reply] > div > div'

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

const q = [...d.querySelectorAll(QUESTION_CARD)].map(n => n.id)
check('question card matched', q.includes('question'), JSON.stringify(q))

const r = [...d.querySelectorAll(REPLY_BUBBLE)].map(n => n.id)
check('reply bubble matched', r.includes('reply-bubble'), JSON.stringify(r))
check('reply actions NOT matched', !r.includes('reply-actions'), JSON.stringify(r))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
