// 验证 apply() 把驱动注册到 shell.overlay（root），状态条留在 composer dock。
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

globalThis.window = globalThis
globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.matchMedia = () => ({ matches: false })
globalThis.navigator = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', platform: 'Win32' }
const store = {}
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v) } }

function mkEl (tag) {
  return {
    tagName: tag,
    style: { _v: {}, setProperty (k, v) { this._v[k] = v }, removeProperty (k) { delete this._v[k] } },
    dataset: {}, children: [], offsetWidth: 220, offsetHeight: 96, isConnected: true,
    parentElement: null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 220, height: 96 }),
    setAttribute (k, v) { this.dataset[k] = v },
    getAttribute (k) { return this.dataset[k] ?? null },
    removeAttribute (k) { delete this.dataset[k] },
    appendChild (c) { this.children.push(c); return c }, append () {}, remove () {},
    addEventListener () {}, removeEventListener () {},
    querySelectorAll () { return [] },
  }
}
globalThis.document = {
  documentElement: { append () {}, style: { setProperty () {} } },
  body: { hasAttribute: () => false, appendChild () {}, setAttribute () {} },
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: mkEl,
  createElementNS: (ns, t) => mkEl(t),
  addEventListener () {}, removeEventListener () {},
}
globalThis.getComputedStyle = () => ({ backdropFilter: 'none', borderRadius: '12px', position: 'relative' })
globalThis.requestAnimationFrame = fn => { fn(); return 1 }
globalThis.cancelAnimationFrame = () => {}
globalThis.MutationObserver = class { observe () {} disconnect () {} }
globalThis.ResizeObserver = class { observe () {} disconnect () {} }

let captured = null
globalThis.__ModuleLoader__ = { load (m) { captured = m } }
eval(code)

const React = {
  Fragment: Symbol('Fragment'),
  createElement: (t, p, ...c) => ({ type: t, props: p, children: c }),
  useLayoutEffect: () => {},
  useRef: v => ({ current: v }),
}
const plugin = captured.factory(n => {
  if (n === 'react') return React
  throw new Error('unexpected require: ' + n)
})

const registered = []
const effects = []
let currentInjectKey = null
const ctx = {
  get: n => (n === 'theme' ? { overrideTokens: () => () => {} }
    : n === 'locale' ? { register: () => () => {} } : undefined),
  effect: fn => { effects.push(fn); fn(); return () => {} },
  slots: {
    inject: (key, cb) => {
      currentInjectKey = key
      cb()
      currentInjectKey = null
      return () => {}
    },
    register: (o, c) => {
      registered.push({ key: currentInjectKey || o.name, id: o.id, order: o.order, comp: c })
      return () => {}
    },
  },
}
plugin.apply(ctx)
console.log('all registrations:', JSON.stringify(registered.map(r => ({ key: r.key, id: r.id }))))
for (const r of registered) {
  console.log('slot:', r.key, '| id:', r.id, '| order:', r.order)
}

const overlay = registered.find(r => r.key === 'shell.overlay')
const dock = registered.find(r => r.key === 'conversation.composer.dock')
console.log('root-scoped driver:', overlay && overlay.id === 'shinoinject-glass-driver' ? 'PASS' : 'FAIL')
console.log('dock status strip:', dock && dock.id === 'shinoinject-strip' ? 'PASS' : 'FAIL')

if (!overlay || overlay.id !== 'shinoinject-glass-driver' || !dock || dock.id !== 'shinoinject-strip') process.exit(1)
