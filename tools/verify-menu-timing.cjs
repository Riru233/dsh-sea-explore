// 验证菜单动画的串行时序：父级缩放 → 结束后物品才错位。
const fs = require('fs')
const path = require('path')
const s = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

const popDur = /shino-menu-pop-in var\(--shino-menu-pop-ms, ([\d.]+)s\)/.exec(s)
const itemDur = /shino-menu-item-in ([\d.]+)s/.exec(s)
const step = /--shino-menu-index, 0\) \* ([\d.]+)s/.exec(s)
const pop = popDur ? Number(popDur[1]) : NaN
const item = itemDur ? Number(itemDur[1]) : NaN
const st = step ? Number(step[1]) : NaN

const checks = {
  'pop uses --shino-menu-pop-ms var': /shino-menu-pop-in var\(--shino-menu-pop-ms/.test(s),
  'item has two animations (hold + in)': /shino-menu-item-in [\d.]+s[^;]*backwards,\s*\n?\s*shino-menu-item-hold var\(--shino-menu-pop-ms/.test(s),
  'hold keyframe changes no transform/opacity': /@keyframes shino-menu-item-hold \{[\s\S]{0,120}?from \{ transform: none; opacity: 1; \}/.test(s),
  'item delay includes pop duration': /animation-delay:\s*\n?\s*calc\(\s*var\(--shino-menu-pop-ms[^)]*\)\s*\+\s*var\(--shino-menu-index/.test(s),
  'hold delay is 0 (starts immediately)': /animation-delay:[\s\S]{0,120}?0s;/.test(s),
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
console.log(`\ntiming: pop=${pop}s item=${item}s step=${st}s -> item starts at ${pop}s, ${st}s apart`)
console.log(`        last item starts at ${(pop + 2 * st).toFixed(2)}s, ends at ${(pop + 2 * st + item).toFixed(2)}s`)
process.exit(bad ? 1 : 0)
