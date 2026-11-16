// 验证：native/web 两种 AppFrame 类名格式都被薄纱规则命中，且不误伤。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div class="mP3x-q_frame" id="native-frame">
    <div class="mP3x-q_sidebarCol"></div>
    <div class="mP3x-q_centerCol" id="native-center">
      <div class="content-panel" id="plugin-page">Plugins</div>
    </div>
  </div>
  <div class="_frame_1hfzl_1" id="web-frame">
    <div class="_centerCol_2abcd_9" id="web-center"></div>
  </div>
  <!-- 不相关的 frame / centerCol 字样，不该被 :has 的 frame 规则命中 -->
  <div class="some_frame_decoration" id="decor"></div>
  <div class="centerColIcon" id="icon"></div>
</body></html>`)
const d = dom.window.document

const veil = '[data-phase][class]:has(> [data-conversation-content]), [class*="centerCol_"], [class$="centerCol"]'
const frame = '[class*="frame"]:has(> [class*="centerCol"])'

let bad = 0
for (const [label, sel, wants, forbids] of [
  ['veil hits both centerCols', veil, ['native-center', 'web-center'], ['icon']],
  ['frame rule hits both frames', frame, ['native-frame', 'web-frame'], ['decor']],
]) {
  const ids = [...d.querySelectorAll(sel)].map(n => n.id)
  const ok = wants.every(w => ids.includes(w)) && forbids.every(f => !ids.includes(f))
  console.log((ok ? 'OK   ' : 'FAIL ') + label + ' -> [' + ids.join(', ') + ']')
  if (!ok) bad++
}
process.exit(bad ? 1 : 0)
