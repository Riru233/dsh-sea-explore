// 端到端：输入框与其它目标是否都拿到玻璃。
// 关键回归：makeGlass 抛错时，后续目标不能被连带跳过。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const dom = new JSDOM(`<!doctype html><html><body>
  <div data-composer-card id="card"></div>
  <header data-window-drag="true" id="header">
    <div data-conversation-header-leading></div>
  </header>
  <!-- 插件页 pageHead：同样带 data-window-drag，但没有 leading 子，不能玻璃化 -->
  <header class="V7pFBG_pageHead" data-window-drag="true" id="page-head">
    <div class="V7pFBG_pageHeading"></div>
  </header>
  <div data-presented-file id="presented"></div>
  <div data-menu-material="translucent" id="nsurf"><div aria-hidden="true" id="nmat"></div></div>
  <div data-question-key="k1" id="question"></div>
  <div data-question-reply="c1" id="reply">
    <div id="reply-width"><div id="reply-bubble"></div></div>
    <div id="reply-actions"></div>
  </div>
  <div data-changed-files id="changed-files">
    <button class="HOHHba_header" id="changed-header"></button>
    <ul id="changed-list"></ul>
  </div>
</body></html>`)
const d = dom.window.document

for (const el of d.querySelectorAll('*')) {
  Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 })
}

globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.getComputedStyle = (el) => ({
  backdropFilter: el.style.backdropFilter || '',
  borderRadius: '12px',
  position: 'relative',
})
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
// ResizeObserver 桩：liquidglass 依赖它触发 update() 写滤镜，
// 真实浏览器首次观察时会立即回调一次。新插入的元素在 jsdom 里没有
// 布局（尺寸为 0），这里补上，模拟真实浏览器的一次布局。
globalThis.ResizeObserver = class {
  constructor (cb) { this.cb = cb }
  observe (el) {
    if (el.offsetWidth === 0) {
      Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
      Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
      el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 })
    }
    this.cb([{ target: el, contentRect: { width: el.offsetWidth, height: el.offsetHeight } }], this)
  }
  disconnect () {}
}
globalThis.document = d

// canvas 桩：liquidglass 需要 2D context 生成位移图。
// 只对 canvas 标签特殊处理；其它标签用 jsdom 原生实现（滤镜层需要真的 DOM 节点）。
const noCanvas = process.argv.includes('--no-canvas')
if (!noCanvas) {
  const ctxStub = {
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    putImageData: () => {},
  }
  const origCreate = d.createElement.bind(d)
  d.createElement = tag => {
    const el = origCreate(tag)
    if (tag === 'canvas') {
      el.getContext = () => ctxStub
      el.toDataURL = () => 'data:image/png;base64,'
    }
    return el
  }
  globalThis.HTMLCanvasElement = class {}
}

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')
eval(code)

let layoutEffect = null
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => { layoutEffect = fn },
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
let key = null
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} } : n === 'locale' ? { register: () => () => {} } : undefined),
  effect: fn => { fn(); return () => {} },
  slots: { inject: (k, cb) => { key = k; cb(); return () => {} }, register: (o, c) => { if (key === 'shell.overlay') globalThis.__drv = c; return () => {} } },
}
plugin.apply(ctx)
const drvEl = globalThis.__drv()
if (drvEl && typeof drvEl.type === 'function') drvEl.type()
if (typeof layoutEffect === 'function') layoutEffect()

const card = d.getElementById('card')
const presented = d.getElementById('presented')
const nmat = d.getElementById('nmat')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 输入框的滤镜在专用子层上（卡片自身不带滤镜）
const cardFilterLayer = card.querySelector(':scope > [data-shino-card-filter]')
check('composer card has a filter layer', cardFilterLayer !== null)
check('composer card itself has NO backdrop-filter',
  (card.style.getPropertyValue('-webkit-backdrop-filter') || card.style.backdropFilter || '') === '')
const layerFilter = cardFilterLayer
  ? (cardFilterLayer.style.getPropertyValue('-webkit-backdrop-filter') || cardFilterLayer.style.backdropFilter || '')
  : ''
check('filter layer HAS the inline filter',
  layerFilter.includes('blur(') || layerFilter.includes('url('), layerFilter || '(none)')
check('filter layer has NO data-glass-light', cardFilterLayer && cardFilterLayer.getAttribute('data-glass-light') === null)
check('parent card carries data-glass-light', card.getAttribute('data-glass-light') !== null)
check('presented card has glass marker', presented.getAttribute('data-shino-glass') !== null)
check('menu material has glass marker', nmat.getAttribute('data-glass') !== null)

// 模型提问卡与上下文里的用户回答气泡
const question = d.getElementById('question')
const replyBubble = d.getElementById('reply-bubble')
const replyActions = d.getElementById('reply-actions')
check('question card has glass marker', question.getAttribute('data-shino-glass') !== null)
check('reply bubble has glass marker', replyBubble.getAttribute('data-shino-glass') !== null)
check('reply actions row NOT glassed', replyActions.getAttribute('data-shino-glass') === null)

// 产物改动展示卡：卡片拿到玻璃，头部列表项不单独玻璃
const changedCard = d.getElementById('changed-files')
const changedHeader = d.getElementById('changed-header')
const changedList = d.getElementById('changed-list')
check('changed-files card has glass marker', changedCard.getAttribute('data-shino-glass') !== null)
check('changed-files header NOT separately glassed', changedHeader.getAttribute('data-shino-glass') === null)
check('changed-files list NOT separately glassed', changedList.getAttribute('data-shino-glass') === null)

// 会话头部玻璃岛：只有 conversation header（带 leading 子）命中，pageHead 不误伤
const header = d.getElementById('header')
const pageHead = d.getElementById('page-head')
check('header[data-window-drag] has glass marker', header.getAttribute('data-shino-glass') !== null)
check('pageHead NOT glassed (no leading child)', pageHead.getAttribute('data-shino-glass') === null)

// 关键回归：某个目标 makeGlass 抛错时，扫描循环不能被中断，
// 后面的目标仍要拿到玻璃。这正是「输入框的玻璃莫名丢了」的成因。
console.log('\n--- 回归：单个目标抛错不牵连其它目标 ---')
const dom2 = new JSDOM(`<!doctype html><html><body>
  <div data-composer-card id="card2"></div>
  <div data-presented-file id="presented2"></div>
</body></html>`)
const d2 = dom2.window.document
for (const el of d2.querySelectorAll('*')) {
  Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 })
}
globalThis.document = d2
// 只让第一个目标失败：card2 首次成图时 canvas 不可用，
// presented2 之后正常。
const origCreate2 = d2.createElement.bind(d2)
let canvasCalls = 0
d2.createElement = tag => {
  const el = origCreate2(tag)
  if (tag === 'canvas') {
    canvasCalls++
    const bad = canvasCalls === 1
    el.getContext = () => (bad ? null : { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), putImageData: () => {} })
    el.toDataURL = () => 'data:image/png;base64,'
  }
  return el
}
let layoutEffect2 = null
React.useLayoutEffect = fn => { layoutEffect2 = fn }
plugin.apply(ctx)
const drv2 = globalThis.__drv()
if (drv2 && typeof drv2.type === 'function') drv2.type()
let threw = false
if (typeof layoutEffect2 === 'function') {
  try { layoutEffect2() } catch (e) { threw = true; console.log('UNEXPECTED THROW:', e.message) }
}
const card2 = d2.getElementById('card2')
const presented2 = d2.getElementById('presented2')
check('scan did not abort on failure', threw === false)
// 失败的目标：标记被撤销（下一轮重试），但扫描继续
check('failed target marker withdrawn', card2.getAttribute('data-shino-glass') === null,
  String(card2.getAttribute('data-shino-glass')))
// 后续目标：不受牵连，仍拿到玻璃
check('later target still reached', presented2.getAttribute('data-shino-glass') !== null,
  String(presented2.getAttribute('data-shino-glass')))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL GLASS TARGETS OK')
process.exit(bad ? 1 : 0)
