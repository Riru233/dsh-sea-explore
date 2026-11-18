// 验证重载（HMR）后：filter defs 不重复、旧标记被清理、光效只装一次。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 静态结构检查
check('reset function exists', code.includes('function resetLiquidGlassState()'))
check('reset called at apply', /apply\(ctx\) \{[\s\S]{0,1500}?resetLiquidGlassState\(\);/.test(code))
check('shared defs id used', code.includes("getElementById('filter-defs')"))
check('old filters cleared', /querySelectorAll\(':scope > filter'\)\] \)?old\.remove/.test(code)
  || /for \(const old of \[\.\.\.defs\.querySelectorAll\(':scope > filter'\)\]\) old\.remove\(\)/.test(code))
check('glass marks cleared on reload', code.includes("'[data-shino-glass]'") && code.includes('stripGlass(el)'))
check('effects install wrapped once', code.includes('function installGlassEffectsOnce()'))
check('window-level guard present', /state\[LG_RELOAD_NS\]\.lightsInstalled === true\) return/.test(code))
check('driver uses wrapped install', /paintGlass\(document\);\s*\n\s*installGlassEffectsOnce\(\);/.test(code))

// 运行时：模拟两次模块加载（重载），检查 defs 只有一个且 filter id 不重复
const dom = new JSDOM('<!doctype html><html><head></head><body><div data-composer-card id="card"></div></body></html>')
const d = dom.window.document
let installCount = 0

function setupGlobals () {
  globalThis.window = globalThis
  globalThis.document = d
  globalThis.addEventListener = () => {}
  globalThis.removeEventListener = () => {}
  globalThis.matchMedia = () => ({ matches: false })
  globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
  globalThis.localStorage = { getItem: () => null, setItem: () => {} }
  globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '12px', position: '' })
  globalThis.requestAnimationFrame = fn => { fn(); return 1 }
  globalThis.MutationObserver = class { observe () {} disconnect () {} }
  globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }
}
setupGlobals()

const ctxStub = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), putImageData: () => {} }
const origCreate = d.createElement.bind(d)
d.createElement = tag => {
  const el = origCreate(tag)
  if (tag === 'canvas') { el.getContext = () => ctxStub; el.toDataURL = () => 'data:image/png;base64,' }
  return el
}

function loadModule () {
  let captured = null
  globalThis.__ModuleLoader__ = { load (m) { captured = m } }
  eval(code)
  const React = {
    Fragment: Symbol('F'),
    createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
    useLayoutEffect: () => {},
    useRef: v => ({ current: v }),
  }
  const plugin = captured.factory(n => (n === 'react' ? React : (() => { throw new Error(n) })()))
  const ctx = {
    get: n => (n === 'theme' ? { overrideTokens: () => () => {} } : n === 'locale' ? { register: () => () => {} } : undefined),
    effect: fn => { fn(); return () => {} },
    slots: { inject: () => () => {}, register: () => () => {} },
  }
  plugin.apply(ctx)
  return plugin
}

// 第一次加载
loadModule()
const defs1 = d.getElementById('filter-defs')
check('first load creates shared defs', defs1 !== null)
const svgCount1 = d.documentElement.querySelectorAll('svg[aria-hidden="true"]').length

// 模拟第一实例玻璃化：加一个 filter 与标记
const f1 = d.createElementNS('http://www.w3.org/2000/svg', 'filter')
f1.setAttribute('id', 'lg-0')
defs1.appendChild(f1)
d.getElementById('card').setAttribute('data-shino-glass', '')

// 第二次加载（重载）
loadModule()
const allDefs = d.querySelectorAll('defs#filter-defs')
check('only one shared defs after reload', allDefs.length === 1, String(allDefs.length))
const defs2 = d.getElementById('filter-defs')
check('old filter cleared on reload', defs2.querySelectorAll(':scope > filter').length === 0,
  String(defs2.querySelectorAll(':scope > filter').length))
check('old glass mark cleared on reload', d.getElementById('card').getAttribute('data-shino-glass') === null)
const svgCount2 = d.documentElement.querySelectorAll('svg[aria-hidden="true"]').length
check('no duplicate svg container', svgCount2 === svgCount1, svgCount1 + ' -> ' + svgCount2)

// 光效安装跨重载幂等：window 标记对象在 reset 时建立，install 时置 true。
// 测试桩的 useLayoutEffect 为空，不会真正调 install，这里验证标记对象已建立
// 且初值为 false（待首次 effect 安装时置 true）。
check('light guard object survives reload', globalThis.__dshSeaExploreLgReload !== undefined
  && typeof globalThis.__dshSeaExploreLgReload.lightsInstalled === 'boolean')

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
