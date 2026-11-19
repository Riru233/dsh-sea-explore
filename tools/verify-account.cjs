// 验证：用户按钮（账号区）迁到侧边导航栏底部，只显示头像，hover 显示用户名。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('account moved to navCol', /navCol\.appendChild\(accountRoot\)/.test(code))
check('account found via _5Qcc8a_root', /_5Qcc8a_root/.test(code))
check('account fallback via avatar', /data-avatar-status/.test(code))
check('user name captured', code.includes("'data-shino-user-name'"))
check('tooltip content attr', /content: attr\(data-shino-user-name\)/.test(code))
check('label hidden', /\[data-shino-account\] \[class\*="label"\] \{[\s\S]{0,60}?display: none !important/.test(code))
check('pushed to bottom', /\[data-shino-account\] \{[\s\S]{0,120}?margin-top: auto !important/.test(code))
check('trigger 36px', /\[data-shino-account\] button \{[\s\S]{0,120}?width: 36px !important/.test(code))

for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem',
  '__dshSeaExploreNavContext', '__dshSeaExploreLayout', '__dshSeaExploreWorkspace',
  '__dshSeaExploreSessions', '__dshSeaExploreLgReload']) delete globalThis[k]

const dom = new JSDOM(`<!doctype html><html><body>
<div class="mP3x-q_frame" id="frame" style="grid-template-columns: 260px minmax(0, 1fr) 0px">
  <div class="mP3x-q_sidebarCol">
    <div class="wtg9ga_root" id="root" style="width: 260px">
      <div class="wtg9ga_regionArea" id="region"></div>
      <nav class="wtg9ga_panelList" id="panelList"><button class="wtg9ga_panelRow" aria-label="plugins"></button></nav>
      <div class="_5Qcc8a_root" id="acct" data-inset="false">
        <button class="_5Qcc8a_trigger" id="acctBtn" aria-label="menu">
          <span class="_5Qcc8a_avatar" data-avatar-status="ready"></span>
          <span class="_5Qcc8a_label">Alice</span>
        </button>
      </div>
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
globalThis.localStorage = { getItem: () => '', setItem: () => {} }
globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '', position: '', backgroundColor: '' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }
const cs = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), putImageData: () => {} }
const oc = d.createElement.bind(d)
d.createElement = t => { const el = oc(t); if (t === 'canvas') { el.getContext = () => cs; el.toDataURL = () => '' } return el }

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)
var effects = []
let overlay = null
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => effects.push(fn),
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

const navCol = d.querySelector('[data-shino-navcol]')
const acct = d.getElementById('acct')
check('account element inside navCol', acct.parentElement === navCol)
check('account is last child (bottom)', navCol.lastElementChild === acct)
check('user name stored', acct.getAttribute('data-shino-user-name') === 'Alice',
  acct.getAttribute('data-shino-user-name'))
check('account removed from sidebar', d.getElementById('root').querySelector('#acct') === null)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
