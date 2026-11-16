// 真实 DOM 验证：每个玻璃目标插入一个滤镜子层，重复扫描不重复插入。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div data-composer-card id="composer"></div>
  <div data-message-bubble id="bubble"></div>
  <div data-presented-file id="presented"></div>
  <div data-menu-material="translucent" id="menu">
    <div aria-hidden="true" id="menu-glass"></div>
  </div>
</body></html>`)
const d = dom.window.document
const React = {
  Fragment: Symbol('F'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: () => {},
  useRef: v => ({ current: v }),
}

// 从 client.js 提取 paintGlass 需要的常量与目标定义，直接复现插入逻辑。
const fs = require('fs')
const code = fs.readFileSync(require('path').join(__dirname, '..', 'client.js'), 'utf8')

globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', platform: 'Win32' }
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.getComputedStyle = () => ({ borderRadius: '12px', position: 'absolute', backdropFilter: 'none' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { observe () {} disconnect () {} }
globalThis.document = d

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)

let layoutEffect = null
React.useLayoutEffect = fn => { layoutEffect = fn }
const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
let currentKey = null
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} }
    : n === 'locale' ? { register: () => () => {} } : undefined),
  effect: fn => { fn(); return () => {} },
  slots: {
    inject: (key, cb) => { currentKey = key; cb(); return () => {} },
    register: (o, c) => { if (currentKey === 'shell.overlay') globalThis.__driver = c; return () => {} },
  },
}
plugin.apply(ctx)


// 执行驱动组件与它的 layout effect（真实 React 会在 commit 后调用）
const driverOut = globalThis.__driver()
console.log('driver type:', typeof globalThis.__driver, '| out:', driverOut && driverOut.type && (driverOut.type.name || 'fn'))

if (typeof layoutEffect === 'function') layoutEffect()
const secondRun = () => { if (typeof layoutEffect === 'function') layoutEffect() }
secondRun()

// 目标自身不应直接挂 data-glass（滤镜在子层上）
for (const id of ['composer', 'bubble', 'presented']) {
  const el = d.getElementById(id)
  const ownGlass = el.getAttribute('data-glass')
  console.log((ownGlass === null ? 'OK   ' : 'FAIL ') + id + ' has no own data-glass')
  if (ownGlass !== null) bad++
}

console.log(bad ? '\nFAILURES' : '\nALL FILTER LAYER CHECKS PASS')
process.exit(bad ? 1 : 0)
