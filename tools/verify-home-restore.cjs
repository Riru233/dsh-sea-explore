// 验证核心场景：切到插件页再回首页，右侧恢复之前那个会话。
// 关键：宿主在离开首页后可能释放 mainView 引用，所以必须靠"离开前记住"的 id。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('remembers session before leaving', code.includes('function rememberCurrentSession()'))
check('uses remembered id first', /rememberedSessionId !== null \? rememberedSessionId : currentMainSessionId\(\)/.test(code))
check('declares uiWorkspace/sessions/layout as deps',
  /inject: \['slots', 'layout', 'uiWorkspace', 'sessions', 'accountUi'\]/.test(code))

// 清掉模块级全局
for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem',
  '__dshSeaExploreNavContext', '__dshSeaExploreLayout', '__dshSeaExploreWorkspace',
  '__dshSeaExploreSessions', '__dshSeaExploreLgReload']) delete globalThis[k]

const dom = new JSDOM(`<!doctype html><html><body>
<div class="mP3x-q_frame" id="frame" style="grid-template-columns: 260px minmax(0, 1fr) 0px">
  <div class="mP3x-q_sidebarCol">
    <div class="wtg9ga_root" id="root" style="width: 260px">
      <div class="wtg9ga_regionArea" id="region"></div>
      <nav class="wtg9ga_panelList" id="panelList">
        <button class="wtg9ga_panelRow" id="pluginBtn" aria-label="plugins"></button>
      </nav>
    </div>
  </div>
  <div class="mP3x-q_centerCol"></div>
</div>
</body></html>`)
const d = dom.window.document

globalThis.window = globalThis
globalThis.document = d
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => '1', setItem: () => {} }  // 默认首页
globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '', position: '', backgroundColor: '' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }
const ctxStub = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w*h*4), width: w, height: h }), putImageData: () => {} }
const origCreate = d.createElement.bind(d)
d.createElement = tag => { const el = origCreate(tag); if (tag === 'canvas') { el.getContext = () => ctxStub; el.toDataURL = () => '' } return el }

// 模拟宿主：会话列表在离开首页后清空 mainView（模拟引用释放）
let mainViewRetained = true
const calls = []
const workspace = {
  openSession: (id) => calls.push(['open', id]),
  startSession: () => calls.push(['start']),
}
const sessions = {
  list: {
    getSnapshot: () => ({
      byId: mainViewRetained
        ? { 'sess-A': { retainedBy: { mainView: 1 } } }
        : { 'sess-A': { retainedBy: {} } },  // 引用被释放
    }),
  },
}
const layout = { selectPanel: (p) => calls.push(['panel', p]) }

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)
let effects = [], overlayRender = null
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => { effects.push(fn) },
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} }
    : n === 'locale' ? { register: () => () => {} }
      : n === 'layout' ? layout
        : n === 'uiWorkspace' ? workspace
          : n === 'sessions' ? sessions
            : undefined),
  effect: fn => { fn(); return () => {} },
  slots: { inject: (k, cb) => { if (typeof cb === 'function') cb(); return () => {} }, register: (o, r) => { if (o && o.name === 'shell.overlay') overlayRender = r; return () => {} } },
}
plugin.apply(ctx)
if (overlayRender) { const el = overlayRender(); if (el && typeof el.type === 'function') el.type() }
for (const fn of effects) { try { fn() } catch (e) {} }

const homeBtn = d.querySelector('[data-shino-workspace-nav]')
check('home button exists', homeBtn !== null)

// 步骤 1：先点首页（建立记忆 sess-A）
homeBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
check('home opens current session', calls.some(c => c[0] === 'open' && c[1] === 'sess-A'),
  JSON.stringify(calls))

// 步骤 2：切到插件页（离开首页 → 宿主释放 mainView 引用）
calls.length = 0
d.getElementById('pluginBtn').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
mainViewRetained = false

// 步骤 3：切回首页 → 必须恢复 sess-A（即使 mainView 引用已释放）
calls.length = 0
homeBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
const restored = calls.some(c => c[0] === 'open' && c[1] === 'sess-A')
check('home restores remembered session after mainView released', restored, JSON.stringify(calls))
check('did not fall back to blank panel', !calls.some(c => c[0] === 'panel'),
  JSON.stringify(calls))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
