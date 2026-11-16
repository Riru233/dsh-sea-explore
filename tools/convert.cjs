/**
 * 把 example-tsx 下的 TypeScript 参考实现无损转换成纯 JS。
 *
 * 为什么用转译器而不是手抄：
 *   liquidglass.ts 有 1070 行，手抄必然漏细节（浮点边界、`as const`、泛型调用、
 *   大量常量注释里的量程约定）。esbuild 只剥离类型标注与 TS 语法，不改变运行时
 *   语义，产出与原 TS 逐语句等价。
 *
 * 两处必要改写（都只影响模块边界，不碰算法）：
 *   1. 源文件从 `@/utils/platform` 导入三个平台判定，插件包里没有该模块：
 *      换成内联的 navigator 探测，判定条件与原实现一致。
 *   2. 输出改为 IIFE（globalName），供最终在浏览器模块加载器里内嵌，
 *      避免插件包需要额外的模块解析能力。
 *
 * 用法：node tools/convert.cjs
 * 产出：vendor/liquidglass.js
 */
const fs = require('node:fs')
const path = require('node:path')
const esbuild = require('C:/Users/11251/node_modules/esbuild')

const root = path.resolve(__dirname, '..')
const src = path.join(root, 'example-tsx', 'liquidglass.ts')
const outDir = path.join(root, 'vendor')
const outFile = path.join(outDir, 'liquidglass.js')

const source = fs.readFileSync(src, 'utf8')

const PLATFORM_IMPORT =
  'import { isApplePlatform, isChromiumRenderer, isWindowsPlatform } from "@/utils/platform";'

if (!source.includes(PLATFORM_IMPORT)) {
  throw new Error('平台导入行与预期不一致，转换前先核对源文件')
}

// 等价于 @/utils/platform 的判定：
//   isWindowsPlatform  —— UA 里出现 Windows
//   isApplePlatform    —— macOS / iOS / iPadOS
//   isChromiumRenderer —— 带 Chrome 内核标记（Safari 的 UA 没有 Chrome/ 或 Edg/）
const PLATFORM_SHIM = `const __ua = typeof navigator === 'undefined' ? '' : String(navigator.userAgent || '');
const __platform = typeof navigator === 'undefined' ? '' : String(navigator.platform || '');
const isWindowsPlatform = /Windows|Win32|Win64|WOW64/i.test(__ua) || /^Win/i.test(__platform);
const isApplePlatform = /Mac OS X|Macintosh|iPhone|iPad|iPod/i.test(__ua) || /^Mac/i.test(__platform);
const isChromiumRenderer = /Chrome\\/|Chromium\\/|Edg\\/|OPR\\//.test(__ua);`

const rewritten = source.replace(PLATFORM_IMPORT, PLATFORM_SHIM)

const result = esbuild.transformSync(rewritten, {
  loader: 'ts',
  format: 'iife',
  globalName: '__ShinoLiquidGlass',
  target: 'es2022',
  charset: 'utf8',
  legalComments: 'inline',
})

fs.mkdirSync(outDir, { recursive: true })

const banner = `/* AUTO-GENERATED from example-tsx/liquidglass.ts by tools/convert.cjs — do not edit by hand. */
`
fs.writeFileSync(outFile, banner + result.code, 'utf8')

const warnings = result.warnings ?? []
console.log('converted ->', path.relative(root, outFile))
console.log('bytes:', result.code.length, 'warnings:', warnings.length)
for (const w of warnings) console.log('  warn:', w.text, w.location && w.location.line)
