# shinoinject

A DeepSeek Harness web-UI bundle with three parts: liquid glass on the chat
bubbles and the composer input, a transparent shell (sidebar and the Windows
title bar), and one low-key session status line under the composer.

## Source layout

`client.js` is generated — do not edit it. It is assembled from two inputs by
`tools/build.cjs`:

| Input | Origin |
|---|---|
| `vendor/liquidglass.js` | `example-tsx/liquidglass.ts`, converted by `tools/convert.cjs` |
| `src/app-body.js` | Hand-written plugin logic (glass wiring, strip, theme override) |

Rebuild after changing either input:

```sh
node tools/convert.cjs   # TS/TSX -> plain JS (esbuild, types stripped only)
node tools/build.cjs     # vendor + app-body -> client.js
```

### Why the conversion is lossless

`example-tsx/liquidglass.ts` is 1070 lines of numerical code (rounded-rect SDF,
per-pixel displacement-field generation, spring integration, pointer session
state). Hand-porting it would lose details, so the conversion is mechanical:
esbuild's TypeScript loader strips type annotations, `interface`/`type`
declarations, `as const`, and generic parameters, and emits the same statements
in the same order. Only two module-boundary edits exist:

1. The source imports `isWindowsPlatform`, `isApplePlatform`,
   `isChromiumRenderer` from `@/utils/platform`, which is not part of this
   package. `tools/convert.cjs` substitutes an equivalent inline `navigator`
   probe; the algorithm never sees the difference.
2. Output is an IIFE (`globalName: __ShinoLiquidGlass`) so the browser module
   loader can embed it without a module resolver.

`tools/convert.cjs` fails loudly if the platform import line does not match, so
a changed upstream cannot silently produce a wrong build.

Verified after conversion: all 18 exports present, `node --check` passes, and a
stubbed-DOM smoke test exercises `clampLiquidGlassParam` (clamping to bounds),
`readStoredLiquidGlassParams` / `readStoredLiquidGlassEffects` (defaults),
`LIQUID_GLASS_PRESETS`, and the platform-derived
`LIQUID_GLASS_DISTORTION_SUPPORTED`.

## 1. Liquid glass

Eight host surfaces get glass:

| Surface | Selector | Host stylesheet / source |
|---|---|---|
| Composer input card | `[data-composer-card]` | `InputBar.tsx` |
| User message bubble | `[data-message-bubble]` | `UserContent.tsx` |
| Presented file card | `[data-presented-file]` | `PresentedFileCard.tsx` |
| Menu glass layer | `[data-menu-material] > [aria-hidden]:first-child` | frontend bundle (`Ed`) |
| Code block in a reply | `div:has(> div > [data-code-block-banner])` | frontend bundle (`FenceCodeBlock`) |
| Any modal panel | `[role="dialog"][aria-modal="true"]` | shared dialog primitive |
| Right-hand guide entry | `[data-sidebar-right-guide] …` | `GuideBody.tsx` |
| Sidebar "New session" | `button[class*="_newSession"]` | `Rows.tsx` / `SidebarRoot` |

Most are attributes the host publishes itself, not hashed CSS-module class names.
Two need extra work and get a marker written by `paintGlass()`:

- **Code block** has only `data-code-block-banner` on its header. The real nesting
  is `container > bannerWrap > banner`, so the selector needs **two** levels of
  `:has()` — one level lands on `bannerWrap`, the sticky wrapper, not the rounded
  container. `data-shino-code-block` is stamped on the container to scope the
  transparency rules (container fill, banner fill, wrapper fill).
- **New session** has no attribute at all. It is matched by its own module class
  `_newSession`, **not** by `aria-label`: the host's brand-logo button carries
  the same `session.new.label` text, so an `aria-label` match also hit
  `wtg9ga_brand` / `wtg9ga_wide` and glassed the whole brand block by mistake.
  The earlier mistake is now cleaned up at scan time — any element still marked
  `data-shino-new-session` without a `_newSession` class has its glass attributes
  and `backdrop-filter` removed, so no restart is needed.
- **Guide entry** exists twice in `GuideBody`: the kind-carrying entries have
  `data-sidebar-right-guide-entry`, but the "More" menu anchor shares the same
  `entry` class and has no attribute. Both are found through the
  `[data-sidebar-right-guide]` container — see "Scoping the guide entries" below.

`tools/verify-selectors.cjs` builds the real nesting in jsdom and asserts each
selector hits its intended element and nothing else (inline `<code>` is not a
code block; `role="menu"` is not a modal; an unrelated icon button is not the
new-session button).

The wiring, because neither surface belongs to this plugin:

1. `paintGlass()` queries those selectors, stamps `data-glass` (and
   `data-glass-light` for the hover glow), then calls `makeGlass()` from the
   converted module. `makeGlass` is idempotent via its own `WeakMap`, so
   repeated scans are cheap.
2. A `useLayoutEffect` runs it after every commit — the same reason the
   reference `useGlass` hook moved out of the render body: conditionally
   rendered panels would otherwise wait for an unrelated re-render.
3. A `MutationObserver` on `document.body` catches nodes arriving between
   commits (history paging), coalesced through `requestAnimationFrame`.

`installGlassJelly()` and `installGlassLight()` are installed once from the same
effect; both are module-level idempotent and add `window` pointer listeners.

### Transparency (the part the reference did not cover)

Both host surfaces are painted with opaque fills (`--dsw-specific-input-major`,
`--dsw-specific-bubble`), so a `backdrop-filter` on top of them has nothing to
sample and the glass reads as a flat colour. The bundle therefore makes them
translucent itself, using `color-mix` over those same tokens so the result
follows the active palette instead of hard-coding a colour:

- Composer card: 22% of its fill.
- User bubble: 38% of `--dsw-specific-bubble` (58% in the dark palette, where the
  base colour is already deep and body text needs more backing).
- Presented file card: 26% of `--dsw-alias-card-fill` at rest and 38% of
  `--dsw-alias-card-fill-hover` on hover. The hover state matters: the host
  repaints the card with an opaque hover fill, which would otherwise make the
  glass vanish the moment the pointer arrives. Its inner file-type tile is
  softened too (`--dsw-alias-card-tile-fill` at 30%) so the layers stay coherent.
- Code block: 40% of `--dsw-alias-markdown-code-block`, its banner 42% of
  `--dsw-alias-markdown-code-block-banner`, and the sticky `bannerWrap` forced
  transparent — the host paints that wrapper with an opaque `--dsw-alias-bg-base`,
  which would otherwise hide the glass behind a solid bar at the top.
- Modal panel: 34% of `--dsw-alias-bg-overlay`. The overlay scrim keeps its
  opaque mask: it exists to darken what is behind it.
- Guide entry and new-session button: thin veils of `--dsw-alias-bg-layer-1/2`
  (30%/44% and 26%/40% including hover).
- The conversation column behind them becomes a 58% veil of `--dsw-alias-bg-base`
  — fully transparent would put body text straight on the wallpaper.

### Keeping the glass off the transcript column

`:has()` matches ancestors as well as the intended element. The code-block
selector therefore also hits the message node and the scrolling container that
wrap it — glazing those would turn the whole message column into one sheet of
glass.

Two rules keep it to the intended surfaces:

- **deepest-only** (`deepestOnly`): among the candidates, only the ones that
  contain no other candidate survive. Those are the code block containers
  themselves; the ancestors drop out.
- **chat-flow guard**: an element that contains the whole
  `[data-slot="conversation.chat.flow"]` is a region container, not a surface,
  and is skipped. Elements *inside* the flow (bubbles, code blocks) are kept.

`tools/verify-bubble.cjs` asserts both in jsdom: the bubble and the code block
are glassed, while the message node, the flow column, and the flow wrapper are
not.

`prefers-reduced-transparency: reduce` restores the stock opaque fills, and
`LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE` (localStorage `gpu_preference` =
`low-power`) suppresses the whole effect, as in the reference.

### The four edge properties

The reference decoration is four declarations, all of them reproduced verbatim:

| Property | Value | Role |
|---|---|---|
| `border-top` | `1px solid #fff6` | upper light catch |
| `border-bottom` | `1px solid #fff6` | lower light catch |
| `outline` | `1px solid rgba(35,35,35,0.3)` | dark separation ring (no layout cost) |
| `box-shadow` | `0 8px 16px rgba(40,40,40,0.2)` | drop shadow |

All three glass surfaces — composer card, user bubble, menu — share **one**
rule, so the `outline` is identical everywhere and is **not** altered by the
dark palette; it is the glass's physical contour, not a theme colour. Only the
shadow deepens in dark mode (`rgba(0,0,0,0.45)`), because a shadow tuned for a
light page disappears on a dark one.

Two deliberate notes:

- **Only the top and bottom borders** are drawn. Glass is a lens: total internal
  reflection happens on the horizontal tangents, so a full four-side white
  border turns it back into an ordinary card. `border: 0` resets the host's own
  hairline first, then the two edges are set.
- These four are optical constants (white + neutral grey), not UI semantic
  colours, so they are not routed through `--dsw-alias-*`.

## 1b. Menu glass and its animation

Host menu structure (the `Ed` component in the frontend bundle):

```
<div data-menu-material="translucent" data-menu-phase="enter|dismiss">
  <div aria-hidden="true">          ← glass layer, inset:0, z-index:-1
  <div role="menu">                 ← content
    <div><button role="menuitem">…  ← items
```

Two host facts drive the design:

1. The host animates `[data-menu-phase] > *` with an **opacity** keyframe.
   An element with `opacity < 1` becomes its own backdrop root, so
   `backdrop-filter` stops sampling the page behind it and the glass is a dead
   flat colour for the whole animation — exactly the pitfall called out in the
   request. The bundle therefore **pins the glass layer to `opacity: 1` with
   `animation: none`**, and lets the host's fade apply to the content layer only.
2. Only context menus get `data-menu-phase`. Ordinary dropdowns are inserted with
   no phase and no transition at all, so the bundle adds the fade-in for them.

Animation layers:

| Effect | Applied to | Notes |
|---|---|---|
| Pop in (from centre) | `[data-menu-material]` surface | `scale(0.92) → 1`, 0.32s with a slight overshoot — the transform lives above the glass layer so refraction keeps sampling the page (2D transform does not create a backdrop root; `translateZ`/`preserve-3d` would) |
| Pop out | same surface on `data-menu-phase="dismiss"` | `scale(1) → 0.94`, 0.14s |
| Fade | content layer | Host-owned for context menus; supplied by this bundle for plain dropdowns |
| Item stagger | every `[role="menuitem"]` | `translateX(-10px) → 0` **plus `opacity: 0 → 1`**, 0.3s each, delay `index × 0.1s` (so adjacent items overlap 0.2s) |

The item index is written by `paintGlass()` into `--shino-menu-index`; the CSS
reads `calc(var(--shino-menu-index, 0) * 0.1s)`.

### Why item opacity does not break the parent's glass

`backdrop-filter` samples the content behind its own box, and the sampling is
only interrupted by an **ancestor** of the filtered element having
`opacity < 1`, `filter`, or `mask` — at which point that ancestor becomes the
new backdrop root and the filter can no longer see the page.

The menu tree is:

```
[data-menu-material]        ← surface (isolation: isolate)
├─ [aria-hidden]            ← glass layer: backdrop-filter lives HERE
└─ [role="menu"]            ← content layer
   └─ [role="menuitem"]     ← items
```

Items are **nephews** of the glass layer, not ancestors: the glass layer and the
content layer are siblings. Giving an item `opacity` only composites that item
above the glass; it does not change what the glass samples. The same holds for
the content layer.

Only two places can break it, and both are already handled:

| Where | Effect on glass | Handling |
|---|---|---|
| Surface (glass layer's parent) | breaks it | pop animation uses no `fill-mode`, so no leftover `opacity`/`transform` |
| Glass layer itself | breaks it | pinned with `animation: none; opacity: 1 !important` |

### fill-mode choice

Asymmetric, and deliberate:

- **Items use `backwards`.** They hold the start frame during their delay (so an
  item does not flash at its final position before sliding), and hand styling
  back to CSS at the end. `both`/`forwards` would pin `opacity: 1` and
  `translateX(0)` permanently at animation-level priority, overriding the host's
  own low opacity on disabled items.
- **The surface uses no fill mode at all.** A leftover `transform` would make the
  surface a containing block and disturb the `anchor()` positioning submenus
  rely on.

## 1c. Why the glass follows you across every page

The glass driver is registered in `shell.overlay`, a **root-scoped, frame-wide**
slot. It must not live in `conversation.composer.dock`: that slot is
session-scoped, so leaving the conversation for a new session, the Plugins page,
or the automation-tasks page unmounts the driver entirely and nothing keeps
scanning for new glass surfaces. With the driver at root, a `MutationObserver`
on `document.body` keeps working on every page.

The host's centre column is painted with an opaque `--dsw-alias-bg-base`, which
would make the glass sample its own surface. The bundle turns it into a 58%
veil on **every** main-panel page, not just sessions. AppFrame's CSS-module class
names differ between builds (`_centerCol_<hash>_<n>` in web, `<hash>_centerCol`
in native), so the rule matches the `centerCol` token in either shape while
excluding lookalikes such as `centerColIcon`, and pins the scope with
`frame:has(> centerCol)`.

### The trigger menu (`/` and `@` candidates)

The input-trigger menu (`data-trigger-menu`) is rendered **inside** the composer
card — the host's `MenuView` positions itself with
`closest('[data-composer-card]')`. Since the composer card is a glass target
and therefore a Backdrop Root, the trigger menu's material layer could only
sample content *inside* that card, and its refraction was dead.

The bundle lifts the composer card's own filter while the trigger menu is
present:

```css
[data-composer-card]:has([data-trigger-menu]) {
  backdrop-filter: none !important;
}
```

The card is the only filtered element on that ancestor chain (the overlay
wrapper and the menu surface carry no filter), so removing it restores the
menu's sampling of the page. The composer loses its refraction only while the
candidate menu is open.

### Scoping the guide entries

The right-hand guide entries are found through the container attribute
`[data-sidebar-right-guide]`. A bare `button[class$="_entry"]` is unsafe: three
packages end a class name with `_entry` — `p2k40q_entry` (the guide, wanted),
`w30fQq_entry` (the **chat context** list, not wanted) and `-4GESq_entry`
(the terminal sidebar, not wanted). Scoping by container keeps the other two out.

CSS makes any element with a `backdrop-filter` a **Backdrop Root**. A descendant's
filter then samples only that root's contents, not the page behind it. So when
a menu is rendered inside another glass surface (the trigger menu inside the
composer card, for instance), the inner filter cannot see the page.

`paintGlass()` ends every scan with `protectMenuGlass()`, which:

1. restores any ancestor filters it suppressed in an earlier pass;
2. re-runs `makeGlass()` on a menu layer whose inline filter lost its
   `url(#lg-)` / `blur(` value;
3. suppresses ancestor `backdrop-filter`s so the menu layer samples the page —
   **skipping our own glass targets**, because suppressing them would kill the
   composer's glass whenever a menu opened.

The suppression is transient and self-restoring, so host state is never
permanently altered.

The trigger menu needs the opposite treatment (it lives *inside* the composer
card), so it is handled in CSS instead — see above.

The host paints four surfaces from a single token, `--dsw-specific-sidebar-fill`:

| Surface | Stylesheet |
|---|---|
| Frame background on Windows (the whole caption band) | `AppFrame.module.css` `[data-windows-titlebar] .frame` |
| The caption band pseudo-element (drag region) | `AppFrame.module.css` `.frame::before` |
| The sidebar column | `AppFrame.module.css` `.sidebarCol` |
| The sidebar content root | `SidebarRoot.module.css` `.root` |

`apply()` stacks one theme override layer over that token
(`theme.overrideTokens('shinoinject-chrome', …)`) with `transparent` in both
light and dark. One token turns all four surfaces transparent, so the page
background reaches under the sidebar and under the caption row. The layer is
removed by its disposer on unload; the host theme is never modified.

## 3. Session status line

Slot `conversation.composer.dock`, entry id `shinoinject-strip`, order `20`.

| Element | Source | Meaning |
|---|---|---|
| Status word | `useSessionStatus()`, `useSession().running` | **Needs your answer** (pending interaction), **Working**, **New result** (finished while unread), or **Idle** |
| Status dot | Host theme tokens | Green pulsing while working, amber while waiting, accent for an unread result, neutral when idle |
| N draft chars | `useInput().draft` | Length of the unsent draft; hidden while working |

A pending interaction outranks "working", because at that moment the user is the
blocker. Queued messages are not repeated — the host's queue dock above the
composer already lists them with actions.

- Only host theme tokens (`--dsw-alias-*`) colour the strip; its size follows
  `--dsh-content-font-size-secondary`, so it scales with the font preference.
- Only the status word is a live region, so the draft counter does not announce
  on every keystroke.
- Text is translated through the Client locale service: the registration declares
  the `shinoinject` namespace and `client.js` registers Chinese and English with
  an English fallback.

## Files

```
package.json          bundle manifest (dsh.bundle.patch + dsh.client)
cordis.patch.yml      inserts the plugin row
index.js              Host half (empty apply)
client.js             GENERATED browser bundle
src/app-body.js       hand-written plugin logic (the build input)
vendor/liquidglass.js GENERATED from example-tsx (the other build input)
tools/convert.cjs     TS/TSX -> JS conversion
tools/build.cjs       assembles client.js
example-tsx/          the original reference implementation (kept for provenance)
locale/{en,zh}.json   Plugin Manager title, description, detail document
docs/DETAIL*.md       one-image detail documents
docs/preview.svg      feature illustration
icon.svg              plugin icon
```

## Install

Add the package directory through **Plugins** > **Add plugin** (local directory),
or install it as a bundle; the profile keeps the dependency as
`"shinoinject": "link:C:/Users/11251/dsh-plugins/shinoinject"`.
