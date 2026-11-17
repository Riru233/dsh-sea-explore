// 校验菜单逐项动画的时序，以及产物框玻璃。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const dur = /shino-menu-item-in ([\d.]+)s/.exec(s)
const step = /--shino-menu-index, 0\) \* ([\d.]+)s/.exec(s)
const overlap = dur && step ? Number(dur[1]) - Number(step[1]) : NaN

const checks = {
  'item duration 0.3s': !!dur && Number(dur[1]) === 0.3,
  'item stagger 0.1s': !!step && Number(step[1]) === 0.1,
  'overlap = 0.2s': Math.abs(overlap - 0.2) < 1e-9,
  'item keyframe has translateX': s.includes('translateX(-10px)'),
  'item keyframe opacity 0→1': /from\s*\{\s*transform:\s*translateX\(-10px\);\s*opacity:\s*0;/.test(s)
    && /to\s*\{\s*transform:\s*translateX\(0\);\s*opacity:\s*1;/.test(s),
  'item fill backwards not both': /shino-menu-item-in 0\.3s[^;]*backwards/.test(s)
    && !/shino-menu-item-in 0\.3s[^;]*\bboth\b/.test(s),
  'surface pop no fill-mode': !/shino-menu-pop-in 0\.32s[^;]*\bboth\b/.test(s),
  'glass layer opacity pinned': /animation:\s*none !important;\s*\n\s*opacity:\s*1 !important/.test(s),

  // 产物框已恢复玻璃；用户气泡排除
  'presented-file IS a glass target': s.includes("selector: '[data-presented-file]'"),
  'presented-file edge shared rule': /data-presented-file\]\[data-shino-glass\][^{]*\{[\s\S]{0,200}?outline: 1px solid rgba\(35, 35, 35, 0\.3\)/.test(s),
  'presented-file translucent fill': s.includes('--dsw-alias-card-fill) 26%'),
  'presented-file hover translucent': s.includes('--dsw-alias-card-fill-hover) 38%'),
  'presented-file tile translucent': s.includes('--dsw-alias-card-tile-fill) 30%'),
  'bubble IS a glass target': s.includes("selector: '[data-message-bubble]'"),
  'bubble has glass edge': s.includes('[data-message-bubble][data-shino-glass] {'),

  'unified outline single decl': [...s.matchAll(/outline:\s*1px solid rgba\(35, 35, 35, 0\.3\)/g)].length === 1,
  'no dark outline override': !s.includes('outline-color: rgba(255, 255, 255'),
  // 八个玻璃目标：composer / bubble / presented / menu / codeblock / modal / guide / newsession
  'eight glass targets registered': (() => {
    const want = [
      '{ selector: \'[data-composer-card]\'',
      '{ selector: \'[data-message-bubble]\'',
      '{ selector: \'[data-presented-file]\'',
      '{ selector: MENU_GLASS_LAYER',
      '{ selector: CODE_BLOCK',
      '{ selector: MODAL_PANEL',
      '{ selector: GUIDE_ENTRY',
      '{ selector: NEW_SESSION_BUTTON',
    ]
    return want.every(w => s.includes(w))
  })(),
  'guide entry gets its own mark': s.includes("mark: 'data-shino-guide-entry'"),
  'brand excluded via _newSession class': s.includes('button[class*="_newSession"]'),
  'stale brand marks are cleaned': s.includes("querySelectorAll('[data-shino-new-session][data-shino-glass]')"),
  'code block selector two-level has': s.includes("div:has(> div > [data-code-block-banner])"),
  'code block gets its own mark': s.includes("mark: 'data-shino-code-block'"),
  'new session gets its own mark': s.includes("mark: 'data-shino-new-session'"),
}

let bad = 0
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? 'OK   ' : 'FAIL ') + k)
  if (!v) bad++
}
console.log(`\ntiming: duration=${dur && dur[1]}s step=${step && step[1]}s overlap=${overlap}s`)
process.exit(bad ? 1 : 0)
