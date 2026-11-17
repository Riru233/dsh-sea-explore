// 验证菜单动画的串行时序：父级缩放 → 结束后物品才错位。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const popDur = /shino-menu-pop-in ([\d.]+)s/.exec(s)
const itemDur = /shino-menu-item-in ([\d.]+)s/.exec(s)
const step = /--shino-menu-index, 0\) \* ([\d.]+)s/.exec(s)
const pop = popDur ? Number(popDur[1]) : NaN
const item = itemDur ? Number(itemDur[1]) : NaN
const st = step ? Number(step[1]) : NaN

const checks = {
  'single item animation (no hold)': /animation: shino-menu-item-in [\d.]+s[^\n]*backwards;\s*\n\s*animation-delay:/.test(s),
  'no serial delay variable': !s.includes('--shino-menu-pop-ms'),
  'no hold keyframe': !s.includes('shino-menu-item-hold'),
  'item delay is pure stagger': /animation-delay: calc\(var\(--shino-menu-index, 0\) \* [\d.]+s\)/.test(s),
  'pop and items start together (no pop duration in item delay)': !/animation-delay:[\s\S]{0,80}--shino-menu-pop/.test(s),
  'item duration 0.3s': item === 0.3,
  'step 0.1s (overlap 0.2s)': st === 0.1 && Math.abs((item - st) - 0.2) < 1e-9,
  'pop duration 0.32s': pop === 0.32,
  'glass layer opacity still pinned': /animation: none !important;\s*\n\s*opacity: 1 !important/.test(s),
}

let bad = 0
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? 'OK   ' : 'FAIL ') + k)
  if (!v) bad++
}
console.log(`\ntiming: pop=${pop}s and items start at 0s in parallel, item=${item}s step=${st}s`)
console.log(`        item 1 ends at ${item.toFixed(2)}s, last item ends at ${(2 * st + item).toFixed(2)}s`)
process.exit(bad ? 1 : 0)
