// 在真实 DOM 上验证八个玻璃目标的选择器是否命中，且不误伤。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div data-composer-card id="composer"></div>
  <div data-message-bubble id="bubble"></div>

  <div data-presented-file id="presented">
    <div class="fileIcon"></div>
    <span data-presented-description></span>
  </div>

  <div data-menu-material="translucent" data-menu-phase="enter" id="menu">
    <div aria-hidden="true" id="menu-glass"></div>
    <div role="menu">
      <div><button role="menuitem" id="mi1">A</button></div>
      <div><button role="menuitem" id="mi2">B</button></div>
    </div>
  </div>

  <div class="block_kjs70_4" id="codeblock">
    <div class="bannerWrap" id="codebannerwrap">
      <div data-code-block-banner id="codebanner"></div>
    </div>
    <div><pre><code>let x = 1</code></pre></div>
  </div>

  <span class="inlineCode" id="inline">inline <code>x</code></span>

  <div role="dialog" aria-modal="true" id="modal">
    <div data-shortcut-modal></div>
  </div>

  <button data-sidebar-right-guide-entry="tab" id="guide">Open</button>

  <!-- GuideBody：entry 与它的同前缀兄弟，验证只有 entry 被选中 -->
  <div class="p2k40q_guide" data-sidebar-right-guide id="guide-page">
    <button class="p2k40q_entry" id="guide-entry-plain">Plain entry</button>
    <button class="p2k40q_entry p2k40q_moreAnchor" id="guide-entry-more">More</button>
    <div class="p2k40q_entryCell">
      <span class="p2k40q_entryIcon"></span>
      <span class="p2k40q_entryText">
        <span class="p2k40q_entryTitle">T</span>
        <span class="p2k40q_entryDescription">D</span>
      </span>
    </div>
  </div>

  <!-- 聊天上下文区：类名同样以 _entry 结尾，必须不被引导页选择器命中 -->
  <div class="context-body" id="chat-context">
    <button class="w30fQq_entry" id="context-entry">ctx</button>
  </div>
  <!-- 终端侧边栏：另一个 _entry 结尾的类名 -->
  <div id="terminal-panel">
    <button class="-4GESq_entry" id="terminal-entry">term</button>
  </div>

  <button class="iconButton" aria-label="在“proj”中新建会话" id="newsession-cn">+</button>
  <button class="iconButton" aria-label="New session in proj" id="newsession-en">+</button>
  <button class="iconButton" aria-label="归档会话" id="other-btn">x</button>

  <div class="wtg9ga_logoRow" id="logoRow">
    <button class="wtg9ga_brand wtg9ga_wide" aria-label="新会话" id="brand-btn">
      <span class="wtg9ga_brandIdentity"><span class="wtg9ga_brandName">DeepSeek</span></span>
    </button>
  </div>
  <div class="wtg9ga_newSessionRow" id="newSessionRow">
    <button class="wtg9ga_newSession" id="real-newsession">新会话</button>
  </div>

  <div role="menu" id="ctxmenu-not-modal"></div>
</body></html>`)

const d = dom.window.document

const selectors = {
  composer: '[data-composer-card]',
  bubble: '[data-message-bubble]',
  presented: '[data-presented-file]',
  menuGlass: '[data-menu-material] > [aria-hidden="true"]:first-child',
  codeBlock: 'div:has(> div > [data-code-block-banner])',
  modal: '[role="dialog"][aria-modal="true"]',
  // 必须限定在右侧引导页容器内，否则会命中聊天上下文的 w30fQq_entry
  guide: [
    '[data-sidebar-right-guide] [data-sidebar-right-guide-entry]',
    '[data-sidebar-right-guide] button[class$="_entry"]',
    '[data-sidebar-right-guide] button[class*="_entry "][class$="_moreAnchor"]',
  ].join(', '),
  newSession: 'button[class*="_newSession"]',
}

const expected = {
  composer: ['composer'],
  bubble: ['bubble'],
  presented: ['presented'],
  menuGlass: ['menu-glass'],
  // 只取最内层容器；banner 的 sticky 包裹不单独立项
  codeBlock: ['codeblock'],
  modal: ['modal'],
  // 引导页内的两个按钮；entryCell 等包裹不是按钮，不该进来
  guide: ['guide-entry-plain', 'guide-entry-more'],
  // 只有真正的「新会话」按钮；品牌区（wtg9ga_brand/wide）不得命中
  newSession: ['real-newsession'],
}

let bad = 0
for (const [name, sel] of Object.entries(selectors)) {
  let ids
  try {
    ids = [...d.querySelectorAll(sel)].map(n => n.id || n.className || '(no-id)')
  } catch (e) {
    console.log('FAIL ' + name + ' -> selector error: ' + e.message)
    bad++
    continue
  }
  const want = expected[name]
  const missing = want.filter(w => !ids.includes(w))
  const extra = ids.filter(n => !want.includes(n))
  const ok = missing.length === 0 && extra.length === 0
  console.log((ok ? 'OK   ' : 'FAIL ') + name + ' -> [' + ids.join(', ') + ']'
    + (missing.length ? '  missing: ' + missing.join(',') : '')
    + (extra.length ? '  extra: ' + extra.join(',') : ''))
  if (!ok) bad++
}

// 明确不该命中的元素
const negatives = [
  ['inline code is not a block', 'div:has(> div > [data-code-block-banner])', 'inline'],
  ['plain menu is not a modal', '[role="dialog"][aria-modal="true"]', 'ctxmenu-not-modal'],
  ['unrelated button', 'button[class*="_newSession"]', 'other-btn'],
  ['brand logo is not the new-session button', 'button[class*="_newSession"]', 'brand-btn'],
  ['brand wide wrapper not matched', 'button[class*="_newSession"]', 'logoRow'],
  ['newSessionRow wrapper not matched', 'button[class*="_newSession"]', 'newSessionRow'],
  // entryCell 不是按钮，即使含 entry 前缀也不该被选中
  ['entryCell wrapper not matched', selectors.guide, 'guide-page'],
]
for (const [label, sel, forbiddenId] of negatives) {
  const hit = [...d.querySelectorAll(sel)].some(n => n.id === forbiddenId)
  console.log((hit ? 'FAIL ' : 'OK   ') + label)
  if (hit) bad++
}

// entryCell 内部的 span 不能被当作入口按钮
const spanHit = [...d.querySelectorAll(selectors.guide)].some(n => n.tagName === 'SPAN')
console.log((spanHit ? 'FAIL ' : 'OK   ') + 'no span matched as guide entry')
if (spanHit) bad++

// guide 命中的元素必须恰好是引导页内的两个按钮，
// 且聊天上下文 / 终端侧边栏的 _entry 一律不得命中。
const guideNodes = [...d.querySelectorAll(selectors.guide)]
const guideIds = guideNodes.map(n => n.id)
const guideOk = guideIds.length === 2 && expected.guide.every(g => guideIds.includes(g))
console.log((guideOk ? 'OK   ' : 'FAIL ') + 'guide entry count = 2 buttons (guide-scoped)')
if (!guideOk) bad++

for (const [label, id] of [['chat context entry excluded', 'context-entry'], ['terminal entry excluded', 'terminal-entry']]) {
  const hit = guideIds.includes(id)
  console.log((hit ? 'FAIL ' : 'OK   ') + label)
  if (hit) bad++
}

console.log(bad ? '\n' + bad + ' FAILURES' : '\nALL SELECTOR CHECKS PASS')
process.exit(bad ? 1 : 0)

