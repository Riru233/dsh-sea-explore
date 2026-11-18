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
// 静态：CSS 规则存在。首帧透明改为模块 factory 执行时最早注入。
check('chrome CSS constant exists', code.includes('CHROME_TRANSPARENT_CSS'))
check('chrome style injected at module scope (earliest)', code.includes('injectChromeCssEarly'))
check('early inject appends to head',
  /\(document\.head \|\| document\.documentElement\)\.appendChild\(style\)/.test(code))
check('early inject dedupes by id', /document\.getElementById\(ID\) !== null\) return/.test(code))
check('token itself forced transparent on body',
  /body,\s*\n\s*body\[data-ds-dark-theme\][\s\S]{0,120}?--dsw-specific-sidebar-fill: transparent !important/.test(code))
check('token rule not on :root (body defines it)',
  !/:root,\s*\n\s*html\[data-ds-dark-theme\][\s\S]{0,120}?--dsw-specific-sidebar-fill/.test(code))
check('inline important pinned at factory time',
  /document\.body\.style\.setProperty\('--dsw-specific-sidebar-fill', 'transparent', 'important'\)/.test(code))
check('keepChromeTransparent guard exists', code.includes('function keepChromeTransparent()'))
check('guard called each paint', /keepChromeTransparent\(\);[\s\S]{0,120}?菜单/.test(code))
check('dispose restores prior token', /removeProperty\('--dsw-specific-sidebar-fill'\)/.test(code))
check('window leading buttons transparent', /\[data-shell-leading\] button[\s\S]{0,160}?background: transparent !important/.test(code))
check('chrome style has cleanup', /style\.remove\(\);/.test(code)
  && /removeProperty\('--dsw-specific-sidebar-fill'\)/.test(code))
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

// 模块 factory 执行时（调用 plugin 之前）就已注入，这是首帧最早时机
const earlyStyle = d.getElementById('dsh-sea-explore-chrome')
check('chrome style injected at factory time (before apply)', earlyStyle !== null)
check('early style forces token transparent',
  earlyStyle && /--dsw-specific-sidebar-fill: transparent !important/.test(earlyStyle.textContent))
check('body inline token is transparent important',
  d.body.style.getPropertyValue('--dsw-specific-sidebar-fill') === 'transparent'
  && d.body.style.getPropertyPriority('--dsw-specific-sidebar-fill') === 'important',
  d.body.style.getPropertyValue('--dsw-specific-sidebar-fill') + ' / ' + d.body.style.getPropertyPriority('--dsw-specific-sidebar-fill'))

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
  // effect 接管已存在的 style，不重复插入
  const before = d.querySelectorAll('style#dsh-sea-explore-chrome').length
  const dispose = chromeEffect.fn()
  const inserted = d.getElementById('dsh-sea-explore-chrome')
  check('no duplicate style after effect', d.querySelectorAll('style#dsh-sea-explore-chrome').length === before)
  check('chrome style present in head after effect', inserted !== null)
  check('chrome style contains transparent rules',
    inserted && inserted.textContent.includes('sidebarCol') && inserted.textContent.includes('transparent !important'))
  if (typeof dispose === 'function') {
    dispose()
    check('chrome style removed on dispose', d.getElementById('dsh-sea-explore-chrome') === null)
  }
}

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
