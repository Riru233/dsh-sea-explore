// 验证行内代码 <code> 液态玻璃：
//   · 行内 code 有玻璃标记，代码块 <pre><code> 不被重复玻璃化
//   · 首次加载 / 重载插件 场景一致、滤镜不累积
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('INLINE_CODE selector defined', /const INLINE_CODE = 'code:not\(pre code\):not\(\[data-shino-code-block\] code\)'/.test(code))
check('inline code target defined', /selector: INLINE_CODE, light: true, mark: 'data-shino-inline-code'/.test(code))
check('inline code mark in reset list', /'\[data-shino-inline-code\]'/.test(code))
check('inline code mark in stripGlass', /removeAttribute\('data-shino-inline-code'\)/.test(code))
check('inline code glass CSS', /\[data-shino-inline-code\]\[data-shino-glass\] \{\s*background: color-mix/.test(code))
check('inline code in unified edge CSS', /\[data-shino-inline-code\],/.test(code))
check('inline code outline inset', /\[data-shino-inline-code\]\[data-shino-glass\] \{[\s\S]{0,160}?outline-offset: -1px/.test(code))

function makeDom () {
  const dom = new JSDOM(`<!doctype html><html><body>
<div id="app">
  <p>使用 <code id="inline1">npm install</code> 安装依赖。</p>
  <p>另一个 <code id="inline2">const x = 1</code> 示例。</p>
  <!-- 代码块：里面的 code 不应被行内规则命中 -->
  <div data-shino-code-block data-shino-glass>
    <div><div data-code-block-banner>js</div></div>
    <pre><code id="block-code">let y = 2;</code></pre>
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

clearGlobals()
const d = makeDom()
loadPlugin()
const i1 = d.getElementById('inline1')
const i2 = d.getElementById('inline2')
const bc = d.getElementById('block-code')
check('inline1 has glass', i1.getAttribute('data-shino-glass') !== null)
check('inline2 has glass', i2.getAttribute('data-shino-glass') !== null)
check('inline1 has mark', i1.getAttribute('data-shino-inline-code') !== null)
check('block code NOT inline-glassed', bc.getAttribute('data-shino-inline-code') === null)

// 重载
loadPlugin()
const i1b = d.getElementById('inline1')
check('reload: inline still glassed', i1b.getAttribute('data-shino-glass') !== null)
const defs = d.querySelector('#filter-defs')
const filters = defs ? defs.querySelectorAll('filter').length : -1
check('reload: filters not duplicated', filters > 0 && filters < 50, 'count=' + filters)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
