// 验证两处修复：
// 1. 首帧透明：apply 阶段同步向 head 插入 chrome style（不依赖 React）。
// 2. 无语言代码块：.md-code-block 下的 pre 背景被掏空。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')

const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

// 静态：CSS 规则存在
check('chrome CSS constant exists', code.includes('CHROME_TRANSPARENT_CSS'))
check('chrome style inserted at apply',
  /document\.head\.appendChild\(style\)/.test(code)
  && /style\.textContent = CHROME_TRANSPARENT_CSS/.test(code))
check('chrome style has cleanup', /return \(\) => style\.remove\(\)/.test(code))
check('chrome selector: frame with centerCol',
  code.includes('[class*="frame"]:has(> [class*="centerCol"])'))
check('chrome selector: frame ::before',
  code.includes('[class*="frame"]:has(> [class*="centerCol"])::before'))
check('chrome selector: sidebarCol',
  code.includes('[class*="sidebarCol"]') && code.includes('[class$="sidebarCol"]'))
check('plain code block: md-code-block pre transparent',
  /\.md-code-block :where\(pre\)[\s\S]{0,160}?background: transparent !important/.test(code))
check('plain code block: md-code-block translucent fill',
  /\.md-code-block \{[\s\S]{0,140}?background: color-mix/.test(code))
check('token override still present as fallback',
  code.includes("overrideTokens('dsh-sea-explore-chrome'"))

// 运行时：apply 是否同步插入了 style 到 head
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>')
const d = dom.window.document
globalThis.window = globalThis
globalThis.document = d
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'x', platform: 'Win32' }
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.getComputedStyle = () => ({ backdropFilter: '', borderRadius: '', position: '' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { constructor (cb) { this.cb = cb } observe () {} disconnect () {} }

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
let effects = []
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} } : n === 'locale' ? { register: () => () => {} } : undefined),
  effect: (fn, id) => { effects.push({ fn, id }); return () => {} },
  slots: { inject: () => () => {}, register: () => () => {} },
}
plugin.apply(ctx)

const chromeEffect = effects.find(e => e.id === 'dsh-sea-explore-chrome-css')
check('chrome effect registered at apply', chromeEffect !== undefined)
if (chromeEffect) {
  const dispose = chromeEffect.fn()
  const inserted = d.querySelector('style[data-dsh-sea-explore="chrome"]')
  check('chrome style present in head after effect', inserted !== null)
  check('chrome style contains transparent rules',
    inserted && inserted.textContent.includes('sidebarCol') && inserted.textContent.includes('transparent !important'))
  if (typeof dispose === 'function') {
    dispose()
    check('chrome style removed on dispose', d.querySelector('style[data-dsh-sea-explore="chrome"]') === null)
  }
}

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
