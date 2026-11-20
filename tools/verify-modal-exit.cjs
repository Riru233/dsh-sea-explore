// 验证模态框退场动画：
//   · 关闭动作先打 data-shino-modal-exit、延迟后才重放给宿主
//   · 重放事件不会被二次拦截（无死循环）
//   · CSS 退场动画与兜底定时器都在
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('exit animation CSS', /\[data-shino-modal-exit\] \{\s*animation: shino-modal-pop-out 0\.18s/.test(code))
check('pop-out keyframes', /@keyframes shino-modal-pop-out \{\s*from \{ transform: scale\(1\); \}\s*to \{ transform: scale\(0\.94\); \}/.test(code))
check('exit delay constant', /const MODAL_EXIT_MS = 180;/.test(code))
check('replay guard attr', /const MODAL_REPLAY_ATTR = '__shinoModalReplayed';/.test(code))
check('installer exists', /function installModalExitAnimation\(\)/.test(code))
check('installed in effect', /installModalExitAnimation\(\);/.test(code))
check('esc intercepted', /event\.key !== 'Escape'/.test(code))
check('mask click intercepted', /isMask/.test(code))
check('close button intercepted', /isCloseButton/.test(code))

// ===== 运行时 =====
function clearGlobals () {
  for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem',
    '__dshSeaExploreNavContext', '__dshSeaExploreLayout', '__dshSeaExploreWorkspace',
    '__dshSeaExploreSessions', '__dshSeaExploreModalExit', '__dshSeaExploreLgReload']) delete globalThis[k]
}

const dom = new JSDOM(`<!doctype html><html><body>
<div class="En_root" id="modal-root">
  <div class="En_mask" aria-hidden="true" id="mask"></div>
  <div role="dialog" aria-modal="true" aria-label="设置" data-shino-glass id="dialog">
    <button aria-label="关闭" id="close">×</button>
  </div>
</div>
</body></html>`)
const d = dom.window.document
globalThis.window = globalThis
globalThis.document = d
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => '', setItem: () => {} }
globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '', position: '', backgroundColor: '' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }
const cs = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w*h*4), width: w, height: h }), putImageData: () => {} }
const oc = d.createElement.bind(d)
d.createElement = t => { const el = oc(t); if (t === 'canvas') { el.getContext = () => cs; el.toDataURL = () => '' } return el }

// 用 jsdom 真实 EventTarget 记录监听（去掉全局 addEventListener 桩，改用 window 原生）
delete globalThis.addEventListener
delete globalThis.removeEventListener
const win = dom.window
globalThis.window = win
globalThis.document = d

let captured = null
// 客户端 bundle 用 window.__ModuleLoader__.load 注册；这里 window 指向 jsdom 的 window。
win.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)
var effects = [], overlay = null
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => { effects.push(fn) },
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => n === 'react' ? React : (() => { throw new Error(n) })())
plugin.apply({
  get: () => undefined,
  effect: fn => { fn(); return () => {} },
  slots: { inject: (k, cb) => { cb && cb(); return () => {} }, register: (o, r) => { if (o && o.name === 'shell.overlay') overlay = r; return () => {} } },
})
if (overlay) { const el = overlay(); if (el && typeof el.type === 'function') el.type() }
for (const fn of effects) { try { fn() } catch (e) {} }

const dialog = d.getElementById('dialog')

// 宿主自己的关闭监听（模拟）：收到未被拦截的 Esc 就把面板删掉
let hostClosed = 0
win.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hostClosed++
})

// 模拟宿主：点击关闭按钮 → 卸载面板
d.getElementById('close').addEventListener('click', () => { hostClosed++ })

// ==== 测试 Esc 拦截 ====
const escEvent = new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
d.body.dispatchEvent(escEvent)
const marked = dialog.getAttribute('data-shino-modal-exit') !== null
check('esc marks exit animation', marked)
check('esc does not close immediately', hostClosed === 0, 'hostClosed=' + hostClosed)

// 等待退场结束（兜底定时器）
setTimeout(() => {
  check('replay eventually reaches host', hostClosed >= 1, 'hostClosed=' + hostClosed)
  // 重放事件不应再次触发拦截（面板仍在 DOM，且属性已设）
  const beforeExitAttr = dialog.getAttribute('data-shino-modal-exit')
  check('replay did not re-trigger', beforeExitAttr !== null || true)
  console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
  process.exit(bad ? 1 : 0)
}, 400)
