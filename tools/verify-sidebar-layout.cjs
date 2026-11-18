// 验证侧边栏布局：DOM 迁移（logo/newSession 进 regionArea）+ CSS 左右排布。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 静态 CSS 检查
check('sidebar layout CSS constant', code.includes('SIDEBAR_LAYOUT_CSS'))
check('layout CSS in early inject', /style\.textContent = CHROME_TRANSPARENT_CSS \+ SIDEBAR_LAYOUT_CSS/.test(code))
check('navCol is 48px', /\[data-shino-navcol\] \{[\s\S]{0,400}?width: 48px !important/.test(code))
check('navCol starts below titlebar', /\[data-shino-navcol\] \{[\s\S]{0,300}?top: var\(--dsh-frame-chrome-top, 0px\) !important/.test(code))
check('navCol class mP3x-q_navCol', code.includes("navCol.className = 'mP3x-q_navCol'"))
check('panelList not fixed (inside navCol)', /nav\[class\*="wtg9ga_panelList"\] \{[\s\S]{0,160}?position: static !important/.test(code))
check('frame reserves 48px via padding',
  /\[class\*="frame"\]:has\(> \[data-shino-navcol\]\) \{[\s\S]{0,80}?padding-left: 48px !important/.test(code))
check('grid-template-columns NOT touched by JS', !/style\.gridTemplateColumns = '48px/.test(code))
check('frame gets padding-left 48px',
  /\[class\*="frame"\]:has\(> \[data-shino-navcol\]\) \{[\s\S]{0,80}?padding-left: 48px !important/.test(code))
check('navCol no longer overlaps content (frame reserves space)', !/\[class\*="sidebarCol"\] \{\s*padding-left: 48px/.test(code))
check('sidebar root follows content width (no clipping)',
  /\[class\*="sidebarCol"\] \[class\*="wtg9ga_root"\] \{[\s\S]{0,120}?width: 100% !important/.test(code))
check('root width NOT modified', !/data-shino-orig-width/.test(code))
check('no handle transform hack', !/data-side="sidebar"\] \{\s*transform/.test(code))
check('panelRow 36px', /button\[class\*="wtg9ga_panelRow"\] \{[\s\S]{0,200}?width: 36px !important/.test(code))
check('title hidden by default', /\[class\*="wtg9ga_panelTitle"\] \{[\s\S]{0,300}?opacity: 0 !important/.test(code))
check('title visible on its own row hover',
  /button\[class\*="wtg9ga_panelRow"\]:hover \[class\*="wtg9ga_panelTitle"\] \{[\s\S]{0,80}?opacity: 1 !important/.test(code))
check('tooltip styling present',
  code.includes('background: var(--dsw-alias-bg-overlay) !important')
  && code.includes('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important'))
check('workspaces NOT hidden (conversation history kept)',
  !/regionArea"\] > :not\(\[class\*="wtg9ga_logoRow"\]\):not\(\[class\*="wtg9ga_newSessionRow"\]\)[\s\S]{0,60}?display: none/.test(code))
check('workspace nav button created', code.includes('function createWorkspaceNavButton(doc)'))
check('workspace nav uses home icon', /M3 10\.5 12 3l9 7\.5/.test(code))
check('home icon inserted as path', code.includes("svg.appendChild(path)"))
check('region zero width by default', /\[class\*="wtg9ga_root"\] \[class\*="wtg9ga_regionArea"\] \{[\s\S]{0,160}?width: 0 !important/.test(code))
check('region expands when visible', /\[data-shino-region-visible\] \[class\*="wtg9ga_regionArea"\] \{[\s\S]{0,160}?flex: 1 1 auto !important/.test(code))
check('home suppresses plugin highlight',
  /\[data-shino-home-active\][\s\S]{0,200}?panelEntryActive[\s\S]{0,120}?background: transparent !important/.test(code))
check('nav click delegation exists', code.includes('function installSidebarNavClicks()'))
check('nav delegation clears home state', /removeAttribute\('data-shino-home-active'\)/.test(code))
check('nav delegation skips More (aria-haspopup)', /hostBtn\.hasAttribute\('aria-haspopup'\)\) return/.test(code))
check('trigger 36px', /\[class\*="_5Qcc8a_trigger"\] \{[\s\S]{0,120}?height: 36px !important/.test(code))
check('trigger tooltip hidden/shown', /data-shino-workspace-nav]:hover \.shino-workspace-title/.test(code))
check('collapsed keeps navList visible', /\[data-shino-navcol\] nav\[class\*="wtg9ga_panelList"\] \{[\s\S]{0,80}?display: flex !important/.test(code))
check('sidebar padding-left removed', !/\[class\*="wtg9ga_root"\] \{[\s\S]{0,220}?padding-left: 45px/.test(code))
check('slot margin-left removed (display:contents ignores it)',
  !/\[data-slot="sidebar"\] \{[\s\S]{0,80}?margin-left/.test(code))
check('collapse memory fn exists', code.includes('function syncSidebarCollapse(homeActive, force = false)'))
check('collapse memory guards re-entry', code.includes('if (!force && homeActive === lastHomeActiveForCollapse) return;'))
check('collapse toggle via data-sidebar-toggle', code.includes("document.querySelector('[data-sidebar-toggle]')"))
check('home collapse persisted', code.includes('HOME_COLLAPSED_KEY'))
// 会话上下文：首页按钮只切导航标记，不新建/切换会话（无 session API 调用）
check('home click stops propagation', /btn\.addEventListener\('click', \(event\) => \{\s*\n\s*event\.stopPropagation\(\);/.test(code))
check('home nav never calls session create/open',
  !/data-shino-workspace-nav[\s\S]{0,600}?(startSession|createSession)\(/.test(code))
check('uiWorkspace/sessions exposed for session restore',
  code.includes('window.__dshSeaExploreWorkspace') && code.includes('window.__dshSeaExploreSessions'))
check('panelUnpin hidden in CSS', /\[class\*="wtg9ga_panelUnpin"\] \{[\s\S]{0,60}?display: none !important/.test(code))
check('context menu handler exists', code.includes('function showPanelContextMenu(doc, x, y, unpinBtn, label)'))
check('contextmenu delegated on document', /document\.addEventListener\('contextmenu', onContextMenu\)/.test(code))
check('context menu invokes hidden unpin', /unpinBtn\.click\(\);/.test(code))
check('no forced home on startup', !code.includes('function initHomeState()')
  && !code.includes('HOME_STATE_KEY') && !code.includes('homeStateInitialized'))
check('home active only by click', /sidebar\.setAttribute\('data-shino-home-active', ''\)/.test(code)
  && !/localStorage\.setItem\('dsh-sea-explore-home-active'/.test(code))
check('collapse memory still persisted', code.includes("'dsh-sea-explore-home-collapsed'"))

// 运行时 DOM 迁移
const dom = new JSDOM(`<!doctype html><html><body>
<div class="mP3x-q_frame" id="frame" style="grid-template-columns: 260px minmax(0, 1fr) 0px">
  <div class="mP3x-q_sidebarCol" id="sidebarCol">
    <div class="wtg9ga_root wtg9ga_quietBars" id="root" style="width: 260px">
      <div class="wtg9ga_logoRow" id="logo">brand</div>
      <div class="wtg9ga_newSessionRow" id="newsession">new</div>
      <div class="wtg9ga_scrollRegion" id="scrollregion">
        <div class="wtg9ga_scrollArea" id="scrollarea">
          <nav class="wtg9ga_panelList" id="panelList">
            <button class="wtg9ga_panelRow" id="pluginBtn" aria-current="page" aria-label="plugins"><span class="wtg9ga_panelGlyph"><svg></svg></span><span class="wtg9ga_panelTitle">Plugins</span></button>
            <button class="wtg9ga_panelRow" id="moreBtn" aria-haspopup="menu" aria-label="more"><span class="wtg9ga_panelGlyph"><svg></svg></span></button>
          </nav>
          <div class="wtg9ga_regionArea" id="region">
            <div class="workspaces" id="workspaces">ws</div>
          </div>
        </div>
      </div>
      <div class="wtg9ga_footArea" id="foot">settings</div>
    </div>
  </div>
  <div class="mP3x-q_centerCol" id="centerCol">center</div>
</div>
</body></html>`)
const d = dom.window.document

// 提取 applySidebarLayout 逻辑执行（从模块里 eval 需要完整环境，这里直接复制核心逻辑验证 DOM 结构可迁移）
// 更简单：eval 整段 client factory，然后触发 observer。
globalThis.window = globalThis
globalThis.document = d
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => '0', setItem: () => {} }  // 预设非首页，测试点击切换
globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '', position: '', backgroundColor: '' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.cancelAnimationFrame = () => {}
// 捕获 MutationObserver 实例以便手动触发
let moInstance = null
globalThis.MutationObserver = class {
  constructor (cb) { this.cb = cb; moInstance = this }
  observe () {}
  disconnect () {}
}
globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }
const ctxStub = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), putImageData: () => {} }
const origCreate = d.createElement.bind(d)
d.createElement = tag => {
  const el = origCreate(tag)
  if (tag === 'canvas') { el.getContext = () => ctxStub; el.toDataURL = () => 'data:image/png;base64,' }
  return el
}

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)
// 让 useLayoutEffect 收集回调，触发后才会执行 DOM 迁移
let layoutEffects = []
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: fn => { layoutEffects.push(fn) },
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
let overlayRender = null
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} } : n === 'locale' ? { register: () => () => {} } : undefined),
  effect: fn => { fn(); return () => {} },
  slots: {
    inject: (key, cb) => { if (typeof cb === 'function') cb(); return () => {} },
    register: (o, render) => { if (o && o.name === 'shell.overlay') overlayRender = render; return () => {} },
  },
}
plugin.apply(ctx)

// 触发 shell.overlay 的 GlassDriver 渲染与其 layout effect
if (overlayRender !== null) {
  const el = overlayRender()
  if (el && typeof el.type === 'function') el.type()
}
for (const fn of layoutEffects) {
  try { fn() } catch (e) { console.log('  layout effect error:', e.message) }
}

check('sidebar observer helper defined', code.includes('function installSidebarLayoutObserver()'))
check('migration helper defined', code.includes('function applySidebarLayout(root)'))
check('observer installed', moInstance !== null || globalThis.__dshSeaExploreSidebarObserver !== undefined)

// 真实迁移结果（由 GlassDriver 的 layout effect 触发 applySidebarLayout）
const region = d.getElementById('region')
const logo = d.getElementById('logo')
const newsession = d.getElementById('newsession')
check('logo moved into region', logo.parentElement === region,
  logo.parentElement && logo.parentElement.id)
check('newsession moved into region', newsession.parentElement === region,
  newsession.parentElement && newsession.parentElement.id)
check('newsession after logo', logo.nextElementSibling === newsession)
check('root marked', d.getElementById('root').getAttribute('data-shino-sidebar-layout') !== null)
check('panelList marked', d.getElementById('panelList').getAttribute('data-shino-sidebar-layout') === 'nav')
check('region marked', region.getAttribute('data-shino-sidebar-layout') === 'region')

// navCol：在 frame 下创建为第一列，panelList 已迁入
const navCol = d.querySelector('[data-shino-navcol]')
const frameEl = d.getElementById('frame')
check('navCol created under frame', navCol !== null && navCol.parentElement === frameEl)
check('navCol is first child of frame', frameEl.firstElementChild === navCol)
check('navCol class is mP3x-q_navCol', navCol !== null && navCol.className === 'mP3x-q_navCol')
check('panelList moved into navCol', d.getElementById('panelList').parentElement === navCol,
  d.getElementById('panelList').parentElement && d.getElementById('panelList').parentElement.id)
check('frame grid untouched (padding does the reserving)', frameEl.style.getPropertyValue('grid-template-columns').indexOf('48px') !== 0,
  frameEl.style.getPropertyValue('grid-template-columns'))
check('root width untouched (no clipping)', d.getElementById('root').style.width === '260px',
  d.getElementById('root').style.width)

// 首页导航按钮：导航语义（非开关）。默认不高亮；点击首页高亮+显示 region；
// 再点首页仍保持激活；点击插件（宿主面板）后首页取消高亮、region 收起。
const workspaceNav = d.querySelector('[data-shino-workspace-nav]')
const pluginBtn = d.getElementById('pluginBtn')
const rootEl = d.getElementById('root')
check('workspace nav button inserted', workspaceNav !== null)
check('workspace nav has home svg', workspaceNav && workspaceNav.querySelector('svg') !== null)
check('workspace nav has tooltip label', workspaceNav && workspaceNav.querySelector('.shino-workspace-title') !== null)
check('region hidden by default', rootEl.hasAttribute('data-shino-region-visible') === false)
if (workspaceNav !== null) {
  // 第一次点击首页
  workspaceNav.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  check('home highlighted on click', rootEl.hasAttribute('data-shino-home-active'))
  check('home button marked active', workspaceNav.getAttribute('data-shino-workspace-active') !== null)
  check('region visible after home click', rootEl.hasAttribute('data-shino-region-visible'))

  // 再次点击首页：仍保持激活（导航按钮，不是开关）
  workspaceNav.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  check('home stays active on second click', rootEl.hasAttribute('data-shino-home-active'))

  // 点击「更多」按钮（aria-haspopup=menu）不应取消首页激活态
  const moreBtn = d.getElementById('moreBtn')
  if (moreBtn !== null) {
    moreBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    check('home stays active after More click', rootEl.hasAttribute('data-shino-home-active'))
    check('region stays visible after More click', rootEl.hasAttribute('data-shino-region-visible'))
  }

  // 点击插件（宿主面板）→ 首页取消高亮，region 收起
  if (pluginBtn !== null) {
    pluginBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    check('home cleared after plugin click', rootEl.hasAttribute('data-shino-home-active') === false)
    check('region hidden after plugin click', rootEl.hasAttribute('data-shino-region-visible') === false)
    check('home button no longer active', workspaceNav.getAttribute('data-shino-workspace-active') === null)
  }
}

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
