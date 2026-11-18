// 验证折叠记忆逻辑：非首页强制折叠、首页恢复记忆。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('syncSidebarCollapse accepts force', /function syncSidebarCollapse\(homeActive, force = false\)/.test(code))
check('panel click defers collapse via setTimeout', /setTimeout\(\(\) => syncSidebarCollapse\(false, true\), 0\)/.test(code))
check('home click restores via force', /syncSidebarCollapse\(true, true\)/.test(code))
check('toggle click memorizes collapsed', /writeFlag\(HOME_COLLAPSED_KEY, currentCollapsed\(\)\)/.test(code))
check('restoreConversation fn exists', code.includes('function restoreConversation()'))
check('finds mainView session', /retainedBy\.mainView \?\? 0\) > 0/.test(code))
check('restores via uiWorkspace.openSession', /workspace\.openSession\(sessionId\)/.test(code))
check('non-home forces content collapse', /非首页（插件页 \/ 自动化任务页等）：强制折叠内容侧边栏/.test(code))
check('home restore deferred until host settles', /setTimeout\(\(\) => syncSidebarCollapse\(true, true\), 0\)/.test(code))

// 运行时：模拟折叠状态切换
const dom = new JSDOM(`<!doctype html><html><body>
<div id="frame" class="mP3x-q_frame" data-sidebar-collapsed style="grid-template-columns: 260px minmax(0, 1fr) 0px">
  <button id="toggle" data-sidebar-toggle>t</button>
  <div class="mP3x-q_sidebarCol">
    <div class="wtg9ga_root" id="root">
      <div class="wtg9ga_regionArea" id="region"></div>
      <nav class="wtg9ga_panelList">
        <button class="wtg9ga_panelRow" id="plugin" aria-label="plugins"></button>
      </nav>
    </div>
  </div>
  <div class="mP3x-q_centerCol"></div>
</div>
</body></html>`)
const d = dom.window.document
let toggled = 0
d.getElementById('toggle').addEventListener('click', () => {
  toggled++
  const f = d.getElementById('frame')
  if (f.hasAttribute('data-sidebar-collapsed')) f.removeAttribute('data-sidebar-collapsed')
  else f.setAttribute('data-sidebar-collapsed', '')
})

globalThis.window = globalThis
globalThis.document = d
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '', position: '', backgroundColor: '' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }
const ctxStub = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w*h*4), width: w, height: h }), putImageData: () => {} }
const origCreate = d.createElement.bind(d)
d.createElement = tag => { const el = origCreate(tag); if (tag === 'canvas') { el.getContext = () => ctxStub; el.toDataURL = () => '' } return el }

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)
let effects = []
let overlayRender = null
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => { effects.push(fn) },
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} } : n === 'locale' ? { register: () => () => {} } : undefined),
  effect: fn => { fn(); return () => {} },
  slots: { inject: (k, cb) => { if (typeof cb === 'function') cb(); return () => {} }, register: (o, r) => { if (o && o.name === 'shell.overlay') overlayRender = r; return () => {} } },
}
plugin.apply(ctx)
if (overlayRender) { const el = overlayRender(); if (el && typeof el.type === 'function') el.type() }
for (const fn of effects) { try { fn() } catch (e) {} }

// 初始：默认首页，frame 折叠
check('collapsed listener installed', typeof window.__dshSeaExploreToggleMem === 'function')
check('nav click listener installed', typeof window.__dshSeaExploreNavClicks === 'function')

// 点击插件 → 强制折叠内容侧边栏
const pluginBtn = d.getElementById('plugin')
pluginBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
setTimeout(() => {
  check('non-home forces content collapse', d.getElementById('frame').hasAttribute('data-sidebar-collapsed'),
    'toggles=' + toggled)

  // 手动展开（此时非首页，仅为验证下一次会再折叠）
  d.getElementById('toggle').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  const wasExpanded = !d.getElementById('frame').hasAttribute('data-sidebar-collapsed')
  check('manually expanded', wasExpanded)

  // 再点插件 → 再次强制折叠
  const before = toggled
  pluginBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  setTimeout(() => {
    check('non-home collapses again', d.getElementById('frame').hasAttribute('data-sidebar-collapsed')
      && toggled === before + 1, 'toggles=' + toggled)
    console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
    process.exit(bad ? 1 : 0)
  }, 10)
}, 10)
