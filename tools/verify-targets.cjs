// 验证：目标集合、误伤防护、排除项、菜单冲突保护。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const checks = {
  // 排除项：气泡与产物框不再是玻璃目标
  'bubble not a glass target': !s.includes("{ selector: '[data-message-bubble]'"),
  'presented not a glass target': !s.includes("{ selector: '[data-presented-file]'"),
  'bubble has no glass css': !s.includes('[data-message-bubble][data-shino-glass] {'),
  'presented has no glass css': !s.includes('[data-presented-file][data-shino-glass] {'),
  'bubble cleaned at runtime': s.includes('[data-message-bubble][data-shino-glass], [data-presented-file][data-shino-glass]'),
  'stripGlass helper exists': s.includes('function stripGlass(el)'),

  // 聊天流区域防护
  'chat flow guard present': s.includes("el.closest('[data-slot=\"conversation.chat.flow\"], [data-chat-flow]')"),
  'code block requires pre': s.includes('div:has(> div > [data-code-block-banner]):has(> pre)'),

  // 引导页限定在右侧栏内
  'guide scoped to sidebar-right': s.includes('[data-sidebar-right-guide] [data-sidebar-right-guide-entry]'),
  'guide scoped class fallback': s.includes('[data-sidebar-right-guide] button[class$="_entry"]'),
  'no bare _entry selector': !s.includes("'[data-sidebar-right-guide-entry]',\n  'button[class$=\"_entry\"]'"),

  // 菜单冲突：跳过自己的玻璃目标
  'menu guard skips our glass': s.includes("if (parent.getAttribute('data-shino-glass') !== null)"),

  // 保留项
  'composer still a target': s.includes("{ selector: '[data-composer-card]'"),
  'menu glass layer target': s.includes('{ selector: MENU_GLASS_LAYER'),
  'modal target': s.includes('{ selector: MODAL_PANEL'),
  'new session target': s.includes('{ selector: NEW_SESSION_BUTTON'),
  'root driver': s.includes("ctx.slots.inject('shell.overlay'"),
  'unified outline single decl': [...s.matchAll(/outline:\s*1px solid rgba\(35, 35, 35, 0\.3\)/g)].length === 1,
  'timing intact': s.includes('shino-menu-item-in 0.3s') && s.includes('var(--shino-menu-index, 0) * 0.1s'),
  'no filter-child leftovers': !s.includes('data-shino-filter'),
}

let bad = 0
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? 'OK   ' : 'FAIL ') + k)
  if (!v) bad++
}
process.exit(bad ? 1 : 0)
