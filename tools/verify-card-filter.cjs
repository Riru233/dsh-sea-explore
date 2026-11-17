// 验证：滤镜层只插在输入框卡片上，且与弹窗并列、不进聊天上下文。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const dom = new JSDOM(`<!doctype html><html><body>
  <div data-composer-card id="card">
    <div data-composer-overlay id="overlay">
      <div class="menu" data-trigger-menu id="trigger">
        <div data-menu-material="translucent" id="tsurf"><div aria-hidden="true" id="tmat"></div></div>
      </div>
    </div>
    <div id="editor"></div>
  </div>

  <div data-slot="conversation.chat.flow" id="flow">
    <div data-chat-flow id="flow2">
      <div id="msg-node">
        <div data-message-bubble id="bubble"></div>
      </div>
      <div class="context-body" id="context">
        <ul data-context-entries id="ctx-entries"><li class="w30fQq_entry" id="ctx-entry"></li></ul>
        <dl data-context-sections id="ctx-sections"></dl>
      </div>
    </div>
  </div>
</body></html>`)
const d = dom.window.document

const sizeAll = (root) => {
  for (const el of root.querySelectorAll('*')) {
    Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
    Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 })
  }
}
sizeAll(d)
globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.getComputedStyle = el => ({ backdropFilter: el.style.backdropFilter || '', borderRadius: '12px', position: 'relative' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class {
  constructor (cb) { this.cb = cb; globalThis.__ro = (globalThis.__ro || 0) + 1 }
  observe (el) {
    // jsdom 没有布局：新插入的元素尺寸为 0，而 liquidglass 的 update()
    // 会因尺寸为 0 直接跳过。这里补上尺寸，模拟真实浏览器的一次布局。
    if (el.offsetWidth === 0) {
      Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
      Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
      el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 })
    }
    globalThis.__observed = (globalThis.__observed || []).concat([el])
    this.cb([{ target: el, contentRect: { width: el.offsetWidth, height: el.offsetHeight } }], this)
  }
  disconnect () {}
}
globalThis.document = d
const ctxStub = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), putImageData: () => {} }
// 只对 canvas 标签给 2D context；其它标签用 jsdom 原生实现（滤镜层需要真的 DOM 节点）。
const origCreate = d.createElement.bind(d)
d.createElement = tag => {
  const el = origCreate(tag)
  if (tag === 'canvas') {
    el.getContext = () => ctxStub
    el.toDataURL = () => 'data:image/png;base64,'
  }
  return el
}

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8'))

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
const drv = globalThis.__drv()
if (drv && typeof drv.type === 'function') drv.type()
if (typeof layoutEffect === 'function') layoutEffect()

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

const card = d.getElementById('card')
const layers = [...card.querySelectorAll(':scope > [data-shino-card-filter]')]
check('composer card has exactly 1 filter layer', layers.length === 1, String(layers.length))
check('filter layer is FIRST child', card.firstElementChild === layers[0],
  card.firstElementChild && card.firstElementChild.getAttribute('data-shino-card-filter'))

// 关键：滤镜层不能包含弹窗，两者必须互不包含
const trigger = d.getElementById('trigger')
const overlay = d.getElementById('overlay')
check('filter layer does NOT contain the popup', !layers[0].contains(trigger))
check('popup is NOT inside the filter layer', layers[0].querySelector('[data-trigger-menu]') === null)
// 弹窗所在分支（overlay）与滤镜层互不包含 —— 两者在 DOM 上并列
check('filter layer is not an ancestor of the popup', !layers[0].contains(overlay))
check('popup branch is not an ancestor of the filter layer', !overlay.contains(layers[0]))

// 上下文区域：绝不能出现滤镜层
for (const id of ['bubble', 'msg-node', 'context', 'ctx-entries', 'ctx-entry', 'ctx-sections', 'flow', 'flow2']) {
  const el = d.getElementById(id)
  const n = el.querySelectorAll('[data-shino-card-filter]').length
  check('no filter layer in #' + id, n === 0, String(n))
}
check('no stray filter layers outside the composer card',
  d.querySelectorAll('[data-shino-card-filter]').length === 1,
  String(d.querySelectorAll('[data-shino-card-filter]').length))

// 输入框卡片自身不该再带 backdrop-filter（滤镜在子层上）
// 注意：jsdom 不实现 style.backdropFilter，但支持 -webkit-backdrop-filter，
// 而 liquidglass 两个都会写，所以读后者即可。
const layerFilter = layers[0].style.getPropertyValue('-webkit-backdrop-filter')
  || layers[0].style.backdropFilter || ''
const cardFilter = card.style.getPropertyValue('-webkit-backdrop-filter') || card.style.backdropFilter || ''
check('composer card itself has NO backdrop-filter', cardFilter === '', cardFilter || '(none)')
check('filter layer HAS the backdrop-filter',
  layerFilter.includes('blur(') || layerFilter.includes('url('), layerFilter || '(none)')
// 滤镜层不挂 light；父层挂 light
check('filter layer has NO data-glass-light', layers[0].getAttribute('data-glass-light') === null)
check('parent card HAS data-glass-light', card.getAttribute('data-glass-light') !== null)
check('parent card marked data-shino-card', card.getAttribute('data-shino-card') !== null)
console.log('  ResizeObserver 构造次数:', globalThis.__ro, '| 观察目标数:', (globalThis.__observed || []).length)
console.log('  观察的是滤镜层:', (globalThis.__observed || []).includes(layers[0]))
console.log('  滤镜层 style.cssText:', layers[0].style.cssText)
console.log('  滤镜层 outerHTML:', layers[0].outerHTML.slice(0, 300))
console.log('  滤镜层 offsetWidth/Height:', layers[0].offsetWidth, layers[0].offsetHeight)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
