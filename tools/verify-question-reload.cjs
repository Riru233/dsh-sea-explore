// 验证提问卡玻璃在「重载插件」场景的健壮性：
// 旧玻璃标记能被清掉、重新扫描后玻璃落在 card 而非 frame。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

let bad = 0
function check (label, ok, detail) {
  console.log((ok ? 'OK   ' : 'FAIL ') + label + (detail ? ' -> ' + detail : ''))
  if (!ok) bad++
}

check('question-card mark in reset list', /'\[data-shino-question-card\]'/.test(code))
check('question-card mark in stripGlass', /removeAttribute\('data-shino-question-card'\)/.test(code))
check('question target uses mark', /selector: QUESTION_CARD, light: true, mark: 'data-shino-question-card'/.test(code))

for (const k of ['__dshSeaExploreSidebarObserver', '__dshSeaExploreNavClicks', '__dshSeaExploreToggleMem',
  '__dshSeaExploreNavContext', '__dshSeaExploreLayout', '__dshSeaExploreWorkspace',
  '__dshSeaExploreSessions', '__dshSeaExploreLgReload', '__dshSeaExploreLgLights']) delete globalThis[k]

const dom = new JSDOM(`<!doctype html><html><body>
<div class="mP3x-q_frame" id="frame" style="grid-template-columns: 260px minmax(0, 1fr) 0px">
  <div class="mP3x-q_sidebarCol">
    <div class="wtg9ga_root" id="root" style="width: 260px">
      <div class="wtg9ga_regionArea" id="region"></div>
      <nav class="wtg9ga_panelList"><button class="wtg9ga_panelRow" aria-label="plugins"></button></nav>
    </div>
  </div>
  <div class="mP3x-q_centerCol">
    <div data-slot="conversation.chat.flow" id="chatflow">
      <div class="wnLwla_frame" data-question-key="k1" id="qframe">
        <div class="wnLwla_card" id="qcard"></div>
      </div>
    </div>
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
const cs = {
  createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
  putImageData: () => {},
}
const oc = d.createElement.bind(d)
d.createElement = t => {
  const el = oc(t)
  if (t === 'canvas') { el.getContext = () => cs; el.toDataURL = () => '' }
  return el
}
// SVG 相关
const ocs = d.createElementNS.bind(d)
d.createElementNS = (ns, t) => {
  const el = ocs(ns, t)
  if (el.setAttribute) { /* pass */ }
  return el
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
    slots: {
      inject: (k, cb) => { cb && cb(); return () => {} },
      register: (o, r) => { if (o && o.name === 'shell.overlay') overlay = r; return () => {} },
    },
  })
  if (overlay) { const el = overlay(); if (el && typeof el.type === 'function') el.type() }
  for (const fn of effects) { try { fn() } catch (e) {} }
}

// 第一次加载：card 应该有玻璃标记，frame 不该有
loadPlugin()
const qframe = d.getElementById('qframe')
const qcard = d.getElementById('qcard')
check('fresh load: card has glass', qcard.getAttribute('data-shino-glass') !== null)
check('fresh load: no question-card mark on frame', qframe.getAttribute('data-shino-question-card') === null)

// 重载插件（不清 DOM）：先执行 reset，应该清掉旧标记
const defs = d.querySelector('#filter-defs')
check('defs exists for filters', defs !== null)
loadPlugin()
const qcard2 = d.getElementById('qcard')
check('reload: card re-glassed', qcard2.getAttribute('data-shino-glass') !== null)
check('reload: frame still no glass', d.getElementById('qframe').getAttribute('data-shino-glass') === null)

// defs 里的 filter 数量不应因重载翻倍（reset 清旧的、重建新的）
const filters = defs ? defs.querySelectorAll('filter').length : 0
check('filters not duplicated after reload', filters > 0 && filters < 30, 'filter count=' + filters)

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL OK')
process.exit(bad ? 1 : 0)
