// 验证：右键可固定导航图标弹出菜单。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('context menu does not require unpin', !/if \(unpin === null\) return;/.test(code))
check('context menu uses system menu contract', code.includes("menu.setAttribute('data-menu-material', '')")
  && code.includes("menu.setAttribute('role', 'menu')"))
check('context menu text fallback', code.includes("取消固定 / Unpin"))
check('context menu uses row label', /const label = row\.getAttribute\('aria-label'\)/.test(code))

const dom = new JSDOM(`<!doctype html><html><body>
<div class="wtg9ga_root" id="root">
  <nav class="wtg9ga_panelList">
    <div class="wtg9ga_panelEntry" id="entry1">
      <button class="wtg9ga_panelRow" aria-label="plugins">P</button>
      <!-- 窄栏模式：没有 panelUnpin -->
    </div>
    <div class="wtg9ga_panelEntry" id="entryHome">
      <button class="shino-workspace-nav" aria-label="workspace">H</button>
    </div>
  </nav>
</div>
</body></html>`)
const d = dom.window.document

globalThis.window = globalThis
globalThis.document = d
globalThis.window.innerWidth = 800
globalThis.window.innerHeight = 600
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => '0', setItem: () => {} }
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
let effects = [], overlayRender = null
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => { effects.push(fn) },
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
const ctx = {
  get: () => undefined,
  effect: fn => { fn(); return () => {} },
  slots: { inject: (k, cb) => { if (typeof cb === 'function') cb(); return () => {} }, register: (o, r) => { if (o && o.name === 'shell.overlay') overlayRender = r; return () => {} } },
}
plugin.apply(ctx)
if (overlayRender) { const el = overlayRender(); if (el && typeof el.type === 'function') el.type() }
for (const fn of effects) { try { fn() } catch (e) {} }

// 右键 plugins 图标（无 panelUnpin，窄栏）→ 应弹出菜单
const entry = d.getElementById('entry1')
entry.dispatchEvent(new dom.window.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 200 }))
const menu = d.getElementById('shino-nav-menu')
check('menu appears on right-click (no unpin)', menu !== null)
check('menu has unpin item', menu !== null && /取消固定|Unpin/.test(menu.textContent))
check('menu positioned at cursor', menu !== null && menu.style.left === '100px' && menu.style.top === '200px',
  menu ? menu.style.left + ',' + menu.style.top : '-')

// 右键首页按钮 → 不应弹出菜单（它是导航，不是可固定面板）
if (menu !== null) menu.remove()
const home = d.getElementById('entryHome')
home.dispatchEvent(new dom.window.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 200 }))
check('no menu on home nav right-click', d.getElementById('shino-nav-menu') === null)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
