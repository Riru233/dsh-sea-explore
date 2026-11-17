// 验证：目标集合、误伤防护、排除项、菜单冲突保护。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const checks = {
  // 用户气泡：液态玻璃 + 半透明底
  'bubble IS a glass target': s.includes("{ selector: '[data-message-bubble]'"),
  'bubble has glass edge': s.includes('[data-message-bubble][data-shino-glass] {'),
  'bubble translucent fill': /\[data-message-bubble\]\[data-shino-glass\]\s*\{\s*background: color-mix\(in srgb, var\(--dsw-specific-bubble\) 38%/.test(s),
  'bubble translucent in dark mode': /body\[data-ds-dark-theme\] \[data-message-bubble\]\[data-shino-glass\]/.test(s)
    && /specific-bubble\) 58%/.test(s),
  // 产物框已恢复玻璃
  'presented IS a glass target': s.includes("{ selector: '[data-presented-file]'"),
  'presented has glass css': s.includes('[data-presented-file][data-shino-glass] {'),
  'presented not stripped': !s.includes("'[data-presented-file][data-shino-glass]'"),
  'stripGlass helper exists': s.includes('function stripGlass(el)'),

  // 聊天流区域防护：排除「包含整个流的大容器」，流内元素（气泡、代码块）保留
  'chat flow ancestor guard': /el\.querySelector\(flowSel\)/.test(s)
    && /const flowSel = '\[data-slot="conversation\.chat\.flow"\]/.test(s),
  'deepest-only filter exists': s.includes('function deepestOnly (candidates)'),
  'code block uses deepest': s.includes("deepest: true"),

  // 引导页限定在右侧栏内
  'guide scoped to sidebar-right': s.includes('[data-sidebar-right-guide] [data-sidebar-right-guide-entry]'),
  'guide scoped class fallback': s.includes('[data-sidebar-right-guide] button[class$="_entry"]'),
  'no bare _entry selector': !s.includes("'[data-sidebar-right-guide-entry]',\n  'button[class$=\"_entry\"]'"),

  // 菜单冲突：跳过自己的玻璃目标（输入框用 data-shino-card 标记）
  'menu guard skips our glass': /parent\.getAttribute\('data-shino-glass'\) !== null\s*\n?\s*\|\| parent\.getAttribute\('data-shino-card'\) !== null/.test(s)
    || s.includes("parent.getAttribute('data-shino-card') !== null"),

  // 保留项
  'composer still a target': s.includes("{ selector: '[data-composer-card]'"),
  'menu glass layer target': s.includes('{ selector: MENU_GLASS_LAYER'),
  'modal target': s.includes('{ selector: MODAL_PANEL'),
  'new session target': s.includes('{ selector: NEW_SESSION_BUTTON'),
  'root driver': s.includes("ctx.slots.inject('shell.overlay'"),
  'unified outline decls': [...s.matchAll(/outline:\s*1px solid rgba\(35, 35, 35, 0\.3\)/g)].length === 2,
  'timing intact': s.includes('shino-menu-item-in 0.3s') && s.includes('var(--shino-menu-index, 0) * 0.1s'),
  // 旧版滤镜子层方案已废弃，但清理代码保留（用于摘掉残留）。
  'no filter-child creation': !s.includes("setAttribute('data-shino-filter'"),
  'card filter layer cleanup kept': s.includes("querySelectorAll(':scope > [data-shino-card-filter]')"),
  'card filter layer inserted': s.includes("setAttribute('data-shino-card-filter'") && s.includes('insertFilterLayer'),
  'filter layer has no light': /if \(target\.light && target\.filterLayer !== true\)/.test(s),
  'menu outline on surface': /\[data-menu-material\] \{[\s\S]{0,300}?outline: 1px solid rgba\(35, 35, 35, 0\.3\)/.test(s),
  'menu material layer has no outline rule': !/\[data-menu-material\] > \[aria-hidden="true"\]:first-child \{[\s\S]{0,200}?outline:/.test(s),
}

let bad = 0
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? 'OK   ' : 'FAIL ') + k)
  if (!v) bad++
}
process.exit(bad ? 1 : 0)
