// 验证计划窗（TodoPanel）液态玻璃：
//   · 玻璃挂在 [data-testid="todo-panel"] > .body，外层 section 透明
//   · 首次加载 / 重载插件（含 reset 清理）/ 干净重启 三种场景一致、滤镜不累积
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 静态
check('PLAN_BODY selector defined', /const PLAN_BODY = '\[data-testid="todo-panel"\] > \[class\*="_body"\]'/.test(code))
check('plan target has mark', /selector: PLAN_BODY, light: true, mark: 'data-shino-plan-body'/.test(code))
check('plan mark in reset list', /'\[data-shino-plan-body\]'/.test(code))
check('plan mark in stripGlass', /removeAttribute\('data-shino-plan-body'\)/.test(code))
check('plan glass background CSS', /\[data-shino-plan-body\] \{\s*background: color-mix/.test(code))
check('plan section transparent', /\[data-testid="todo-panel"\] \{\s*background: transparent !important/.test(code))
check('plan in edge CSS', /\[data-shino-plan-body\],/.test(code))
check('plan outline offset inward', /\[data-shino-plan-body\] \{\s*outline-offset: -1px !important/.test(code))
check('plan section overflow visible', /\[data-testid="todo-panel"\] \{[\s\S]{0,180}?overflow: visible !important/.test(code))

function makeDom () {
  const dom = new JSDOM(`<!doctype html><html><body>
<div id="app">
  <section class="DXuOLW_root" data-testid="todo-panel" id="plan-section">
    <div class="DXuOLW_body" id="plan-body">
      <button class="DXuOLW_header">Plan</button>
      <ul class="DXuOLW_list"><li class="DXuOLW_item">step1</li></ul>
    </div>
  </section>
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
  return d
}

function loadPlugin () {
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
}

function clearGlobals () {
  for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem',
    '__dshSeaExploreNavContext', '__dshSeaExploreLayout', '__dshSeaExploreWorkspace',
    '__dshSeaExploreSessions', '__dshSeaExploreLgReload', '__dshSeaExploreLgLights']) delete globalThis[k]
}

// 场景 1：首次加载（模拟刷新页面 / 重启 DSH 的干净状态）
clearGlobals()
let d = makeDom()
loadPlugin()
let body = d.getElementById('plan-body')
let section = d.getElementById('plan-section')
check('fresh: body has glass', body.getAttribute('data-shino-glass') !== null)
check('fresh: body has plan mark', body.getAttribute('data-shino-plan-body') !== null)
check('fresh: section has no glass', section.getAttribute('data-shino-glass') === null)

// 场景 2：重载插件（同一 DOM，不清空）——reset 应清旧标记再重建
loadPlugin()
body = d.getElementById('plan-body')
section = d.getElementById('plan-section')
check('reload: body re-glassed', body.getAttribute('data-shino-glass') !== null)
check('reload: section still no glass', section.getAttribute('data-shino-glass') === null)
const defs = d.querySelector('#filter-defs')
const filters = defs ? defs.querySelectorAll('filter').length : -1
check('reload: filters not duplicated', filters > 0 && filters < 30, 'count=' + filters)

// 场景 3：再次重载，确认幂等稳定
loadPlugin()
check('reload2: body still glassed', d.getElementById('plan-body').getAttribute('data-shino-glass') !== null)
const filters2 = defs ? defs.querySelectorAll('filter').length : -1
check('reload2: filters stable', filters2 === filters, 'count=' + filters2 + ' vs ' + filters)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
