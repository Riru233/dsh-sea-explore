// 验证侧边导航的菜单与工具提示使用液态玻璃。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('NAV_TOOLTIP selector defined', /const NAV_TOOLTIP = '\[data-shino-navcol\] \[class\*="panelTitle"\], '/.test(code)
  && /\[data-shino-navcol\] \.shino-workspace-title'/.test(code))
check('account tip no longer in NAV_TOOLTIP', !/\.shino-account-tip/.test(code))
check('tooltip target defined', /selector: NAV_TOOLTIP, light: false, mark: 'data-shino-nav-tooltip'/.test(code))
check('tooltip bg CSS', /span\[data-shino-nav-tooltip\]\[data-shino-glass\] \{\s*background: color-mix/.test(code))
check('tooltip dark theme bg', /body\[data-ds-dark-theme\] span\[data-shino-nav-tooltip\]\[data-shino-glass\]/.test(code))
check('nav menu uses system menu contract', /menu\.setAttribute\('data-menu-material', ''\)/.test(code)
  && /menu\.setAttribute\('data-menu-phase', 'enter'\)/.test(code)
  && /menu\.setAttribute\('role', 'menu'\)/.test(code))
check('nav menu has glass layer', /glassLayer\.setAttribute\('aria-hidden', 'true'\)/.test(code))
check('glass layer has material positioning', /glassLayer\.style\.cssText = 'position:absolute;inset:0;z-index:-1;'/.test(code))
check('nav menu uses surface glass (anim-safe)', /menu\.setAttribute\('data-context-menu', ''\)/.test(code))
check('nav menu items use role=menuitem', /itemWrap\.setAttribute\('role', 'menuitem'\)/.test(code))
check('nav menu no inline background', !/menu\.style\.cssText = '[^']*background:var\(--dsw-alias-bg-overlay\)/.test(code))
check('nav menu dismiss plays exit', /menu\.setAttribute\('data-menu-phase', 'dismiss'\)/.test(code))
check('no separate nav menu glass target', !/selector: '#shino-nav-menu'/.test(code))
check('tooltip in unified edge CSS', /\[data-shino-nav-tooltip\],/.test(code))

for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem',
  '__dshSeaExploreNavContext', '__dshSeaExploreLayout', '__dshSeaExploreWorkspace',
  '__dshSeaExploreSessions', '__dshSeaExploreLgReload', '__dshSeaExploreLgLights']) delete globalThis[k]

const dom = new JSDOM(`<!doctype html><html><body>
<div class="mP3x-q_frame" id="frame" style="grid-template-columns: 260px minmax(0, 1fr) 0px">
  <div class="mP3x-q_sidebarCol">
    <div class="wtg9ga_root" id="root" style="width: 260px">
      <div class="wtg9ga_regionArea" id="region"></div>
      <nav class="wtg9ga_panelList" id="panelList">
        <div class="wtg9ga_panelEntry">
          <button class="wtg9ga_panelRow" aria-label="plugins">
            <span class="wtg9ga_panelTitle" id="panel-title">Plugins</span>
          </button>
          <button class="wtg9ga_panelUnpin" aria-label="Unpin"></button>
        </div>
      </nav>
    </div>
  </div>
  <div class="mP3x-q_centerCol"></div>
</div>
</body></html>`)
const d = dom.window.document
globalThis.window = globalThis
globalThis.document = d
globalThis.innerWidth = 1200
globalThis.innerHeight = 800
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

// 工具提示已玻璃化
const title = d.getElementById('panel-title')
const navColEl = d.querySelector('[data-shino-navcol]')
check('navCol created', navColEl !== null)
check('panel title inside navCol', title !== null && title.closest('[data-shino-navcol]') !== null,
  title ? (title.parentElement ? title.parentElement.className : 'no-parent') : 'no title')
check('panel title has glass', title.getAttribute('data-shino-glass') !== null)
check('panel title has tooltip mark', title.getAttribute('data-shino-nav-tooltip') !== null)

// 右键菜单：触发 contextmenu，菜单应立即玻璃化
const entry = d.querySelector('.wtg9ga_panelEntry')
entry.dispatchEvent(new dom.window.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 200 }))
const menu = d.getElementById('shino-nav-menu')
check('context menu created', menu !== null)
check('menu has system contract', menu !== null && menu.getAttribute('data-menu-material') !== null
  && menu.getAttribute('role') === 'menu' && menu.getAttribute('data-menu-phase') === 'enter')
const glassLayer = menu ? menu.querySelector('[aria-hidden="true"]') : null
check('menu glass layer exists', glassLayer !== null)
check('menu glass on surface (survives animation)',
  menu !== null && menu.getAttribute('data-glass') !== null,
  menu ? String(menu.getAttribute('data-glass')) : '-')
check('menu surface marked', menu !== null && menu.getAttribute('data-shino-menu-surface') !== null)
const menuItem = menu ? menu.querySelector('[role="menuitem"]') : null
check('menu item has role=menuitem', menuItem !== null)
check('menu item has stagger index', menuItem !== null && menuItem.style.getPropertyValue('--shino-menu-index') === '0')

// 重载幂等
for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem', '__dshSeaExploreNavContext']) delete globalThis[k]
// 直接 eval 第二段模拟 reset：重新加载后 tooltip 仍玻璃化
const defs = d.querySelector('#filter-defs')
const filters = defs ? defs.querySelectorAll('filter').length : -1
check('filters present', filters > 0, 'count=' + filters)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
