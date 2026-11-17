// 验证：context-menu 玻璃挂 surface 自身、材质层滤镜被关；
// 缩放期间菜单项 opacity:0（无内容），缩放结束后才错位。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 1. 静态规则检查
check('context-menu surface is a glass target',
  code.includes("{ selector: CONTEXT_MENU_SURFACE, light: false, menuSurface: true }"))
check('context-menu surface selector is stable',
  code.includes("'[data-context-menu][data-menu-material]'"))
check('surface gets its own marker',
  code.includes("el.setAttribute('data-shino-menu-surface', '')"))
check('material layer filter disabled for context menu',
  /mat\.style\.setProperty\('backdrop-filter', 'none', 'important'\)/.test(code))
check('surface has translucent fill rule',
  /\[data-context-menu\]\[data-shino-menu-surface\][\s\S]{0,120}?background: color-mix/.test(code))
check('material layer transparent under context menu',
  /\[data-context-menu\]\[data-shino-menu-surface\] > \[aria-hidden="true"\]:first-child[\s\S]{0,80}?background: transparent/.test(code))
check('item animation starts in parallel (no pop delay)',
  /animation-delay: calc\(var\(--shino-menu-index, 0\) \* 0\.1s\)/.test(code)
  && !code.includes('--shino-menu-pop-ms'))
check('no hold keyframe', !code.includes('shino-menu-item-hold'))
check('stagger still 0.3s / 0.1s',
  code.includes('shino-menu-item-in 0.3s') && code.includes('--shino-menu-index, 0) * 0.1s'))

// 2. DOM 运行时：右键菜单的玻璃挂到 surface
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-context-menu="" data-menu-material="translucent" data-menu-phase="enter" id="surface">
    <div aria-hidden="true" id="mat"></div>
    <div role="menu"><button role="menuitem">a</button></div>
  </div>
</body></html>`)
const d = dom.window.document
for (const el of d.querySelectorAll('*')) {
  Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 })
}
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
  constructor (cb) { this.cb = cb }
  observe (el) {
    if (el.offsetWidth === 0) {
      Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
      Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true })
    }
    this.cb([{ target: el, contentRect: { width: el.offsetWidth, height: el.offsetHeight } }], this)
  }
  disconnect () {}
}
globalThis.document = d
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

const surface = d.getElementById('surface')
const mat = d.getElementById('mat')
const surfaceCss = surface.style.cssText || ''
const matCss = mat.style.cssText || ''
check('surface marked data-shino-menu-surface', surface.getAttribute('data-shino-menu-surface') !== null)
check('surface has data-glass (filter host)', surface.getAttribute('data-glass') !== null)
check('surface filter written',
  /blur\(|url\(/.test(surfaceCss), surfaceCss || '(none)')
check('material layer filter disabled',
  /backdrop-filter:\s*none/.test(matCss), matCss || '(none)')

// 3. 互斥：MENU_GLASS_LAYER 不再匹配 context-menu 的材质层
check('MENU_GLASS_LAYER excludes context-menu',
  code.includes("'[data-menu-material]:not([data-context-menu]) > [aria-hidden=\"true\"]:first-child'"))
check('context-menu material not double-glassed',
  mat.getAttribute('data-glass') === null, String(mat.getAttribute('data-glass')))

// 4. 子菜单不压制父菜单：protectMenuGlass 跳过所有玻璃祖先
check('protect skips data-glass ancestors',
  /parent\.getAttribute\('data-glass'\) !== null/.test(code))
check('protect skips menu surface ancestors',
  /parent\.getAttribute\('data-shino-menu-surface'\) !== null/.test(code))
check('protect stops at parent menu material',
  /parent\.getAttribute\('data-menu-material'\) !== null/.test(code))

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
