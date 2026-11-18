# dsh-sea-explore

A DeepSeek Harness web-UI bundle with three parts: liquid glass on the chat
bubbles and the composer input, a transparent shell (sidebar and the Windows
title bar), and one low-key session status line under the composer.

## Reload (HMR) safety

A fresh load is clean, but reloading the bundle inside the app — or HMR — used
to shrink/misalign the refraction and stack several light effects on one move.
Both come from module-level state in `vendor/liquidglass.js` that survives in
the DOM but is re-created in the new module instance:

- **Filter ids.** `makeGlass()` numbers filters `lg-0`, `lg-1`, … from a
  per-module counter. The old instance's `<filter>` nodes stay in the document,
  so the new instance reuses the same ids. The browser resolves `url(#lg-0)` to
  the *old* definition, whose displacement map was built for a differently
  sized element — the glass looks cropped or offset.
- **Effect listeners.** `installGlassJelly` / `installGlassLight` guard with a
  module-local boolean. On reload it resets, so a second full set of
  `pointer`/`touch` listeners is registered on `window` and several light
  layers react to one move.

`apply()` calls `resetLiquidGlassState()` first. It creates one shared
`<defs id="filter-defs">` (which the vendor's `getDefs()` prefers), clears last
round's `<filter>` nodes, and strips every glass marker so `paintGlass()`
rebuilds each surface against the new defs. `installGlassEffectsOnce()` uses a
`window`-level flag so the listeners are installed only on the first load;
later instances reuse the still-live ones. The vendor file itself is generated
and stays untouched. `tools/verify-reload.cjs` simulates two loads and checks
there is one defs, no stale filters, no stale markers, and no duplicate SVG
container.

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

Twelve host surfaces get glass:

| Surface | Selector | Host stylesheet / source |
|---|---|---|
| Composer input card | `[data-composer-card]` | `InputBar.tsx` |
| Conversation header (glass island) | `header[data-window-drag]:has(> [data-conversation-header-leading])` | `ConversationHeader.tsx` |
| User message bubble | `[data-message-bubble]` | `UserContent.tsx` |
| Presented file card | `[data-presented-file]` | `PresentedFileCard.tsx` |
| Changed-files card | `[data-changed-files]` | `ChangedFiles.tsx` |
| Model question card | `[data-question-key]` | `QuestionComposer.tsx` |
| Answer bubble in context | `[data-question-reply] > div > div` | `QuestionReplyView.tsx` |
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

### Conversation header as a glass island

`header[data-window-drag]:has(> [data-conversation-header-leading])` — the
`<header>` rendered by `ConversationHeader.tsx` — is turned into a floating
"glass island". The leading-child clause matters: the plugin manager, account
settings, and sidebar also render headers with `data-window-drag`, and a bare
attribute selector glassed the plugin page's `pageHead` by mistake. Only the
conversation header renders `[data-conversation-header-leading]`, so `:has()`
singles it out without touching the hashed `an3WzG_header` / `V7pFBG_pageHead`
classes. The island is:
`position: relative` (stays in flow), width `calc(100% - 20px)` with
`max-width: 800px`, `margin: 10px auto` (10px gutters and horizontal centering),
and a 20px radius over a translucent `--dsw-alias-bg-layer-1` fill. The filter
is hung on the element itself — its own `backdrop-filter` samples the page
behind it, which is exactly what an island should refract.

It is deliberately **not** `fixed`: this header is also the window drag region
(`data-window-drag`), so taking it out of flow would misalign the drag area and
let the content slide underneath. Staying in flow, it occupies a top band and
content begins below the island — an island, not a pinned bar.

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
- Model question card: 24% of `--dsw-specific-input-major` (the host's own
  fill for that card).
- Answer bubble in context: 38% of `--dsw-specific-bubble`, like the user
  bubble. The reply's own row also carries an actions line (time, copy); only
  the bubble inside it is glassed, not that line.
- Presented file card: 26% of `--dsw-alias-card-fill` at rest and 38% of
  `--dsw-alias-card-fill-hover` on hover. The hover state matters: the host
  repaints the card with an opaque hover fill, which would otherwise make the
  glass vanish the moment the pointer arrives. Its inner file-type tile is
  softened too (`--dsw-alias-card-tile-fill` at 30%) so the layers stay coherent.
- Changed-files card: 34% of `--dsw-alias-bg-layer-1` for the body. Its header —
  a `button` carrying the file title and added/deleted counts — is only slightly
  translucent (70% of `--dsw-alias-card-fill`, 78% on hover): it deliberately
  stays much more opaque than the body so the text keeps its contrast. The
  inner file-type tile is softened to 60%.
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

All glass surfaces share **one** rule, so the `outline` is identical everywhere
and is **not** altered by the dark palette; it is the glass's physical contour,
not a theme colour. Only the shadow deepens in dark mode
(`rgba(0,0,0,0.45)`), because a shadow tuned for a light page disappears on a
dark one.

Menus are the one exception to *where* the ring is drawn: their material layer
is an `inset:0` child, so its own `outline` would be clipped away by the
surface. The ring is therefore drawn on the menu **surface** itself
(`[data-menu-material]`), while the material layer only carries the fill.

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
| Surface (glass layer's parent) | builds a backdrop root | the glass is hung on the surface itself, so the surface's own pop transform does not truncate its own filter |
| Glass layer itself | breaks it | pinned with `animation: none; opacity: 1 !important` |

The host's own fade applies to the surface's direct children only — the
material layer and the content layer — not to the items. The material layer is
the content layer's **sibling**, so the content layer's fade never truncates
the glass layer's sampling.

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

### Context menus: the glass rides on the surface itself

A right-click menu carries `data-context-menu` together with
`data-menu-material` on the **same surface element**, with the material layer as
its child. Both the pop animation and the glass would otherwise land on
different levels: if the glass sat on the material layer (a descendant), the
surface's own `transform` animation would truncate it during the pop.

The bundle therefore hangs the glass on the surface itself for context menus:

- `CONTEXT_MENU_SURFACE = '[data-context-menu][data-menu-material]'` is a glass
  target with `menuSurface: true`;
- the host material layer's filter is switched off and its fill made
  transparent, so the two filters never stack;
- `MENU_GLASS_LAYER` excludes context menus with `:not([data-context-menu])`,
  so the same menu never gets glassed twice.

An element's own `transform` does not truncate its **own** `backdrop-filter` —
only that of its descendants. Keeping the filter and the pop on the same
element therefore preserves the refraction for the whole animation.

The pop (surface transform) and the item stagger run **in parallel**: the glass
rides on the surface, whose own transform does not touch its own filter, and the
items are the glass layer's nephews, outside its sampling ancestor chain. The
user sees the glass scale up while the rows slide in together.

### Submenus must not swallow the parent menu's glass

`protectMenuGlass()` suppresses ancestor `backdrop-filter`s so a menu layer can
sample the page. A submenu, however, has its parent menu in that ancestor chain;
a naive suppression would erase the parent's glass.

The traversal now skips any ancestor that is one of our glass surfaces —
`data-shino-glass`, `data-shino-card`, `data-shino-menu-surface`, or the
liquidglass mark `data-glass` — and stops climbing once it reaches another
`data-menu-material` (the parent menu). Both menus keep their filters.

`tools/verify-ctx-menu.cjs` and `tools/verify-menu-timing.cjs` cover all of this
in jsdom.

A transform on an ancestor makes Chromium composite that subtree into its own
layer, truncating a **descendant's** backdrop-filter. The glass is therefore hung
on the surface itself, not on a child material layer: an element's own transform
does not truncate its own filter. With filter and pop on the same element, both
animations run in parallel without losing the glass.

- **Pop** (0.32s): the surface scales from 0.92 to 1.
- **Stagger** (0.3s per item, 0.1s apart): the items slide in from
  `translateX(-10px)` with a fade, starting together with the pop.
  `animation-fill-mode: backwards` holds the start frame through each item's
  delay, so nothing flashes into its final position first.

Timing: item 1 runs 0–0.3s, item 2 0.1–0.4s, item 3 0.2–0.5s — adjacent items
overlap by 0.2s. The surface finishes scaling at 0.32s, while the stagger is
still finishing. `tools/verify-menu-timing.cjs` asserts the parallel start and
the arithmetic.

The input-trigger menu (`data-trigger-menu`) — the `/` and `@` candidate list and
the one the toolbar's "add files and run commands" button opens — is rendered
**inside** the composer card; the host's `MenuView` positions itself with
`closest('[data-composer-card]')`.

Per the CSS spec, an element with a `backdrop-filter` is itself a **Backdrop
Root**, and its descendants' filters sample only that root. So a filter on the
composer card would cut the popup's refraction off; and the only way to save
the popup was to switch the card's filter off — which took the composer's glass
with it.

The bundle instead moves the composer's filter onto a dedicated child layer:

```
[data-composer-card]              ← no backdrop-filter of its own
├── [data-shino-card-filter]      ← the filter lives here (z-index: -1)
└── [data-composer-overlay]
    └── [data-trigger-menu]       ← the popup, outside the filter layer
```

The filter layer is inserted as the **first child**, so it and the popup are
siblings that contain neither each other: each is its own backdrop root and
neither truncates the other. The composer's glass survives, and the popup
refracts normally. The card's translucent fill moved onto the filter layer so
the layer is visible above the (now transparent) card background.

The light/glow attribute sits on the **parent** card, not on the filter layer:
the layer covers the whole surface, so a glow on it would be swallowed by the
card's own translucent fill.

`tools/verify-card-filter.cjs` asserts the placement in jsdom: exactly one
filter layer, it is the first child, it does not contain the popup, the popup
branch does not contain it, the card itself carries no `backdrop-filter`, the
layer carries the filter and no light, and **no filter layer appears anywhere in
the chat transcript or the context panels**.

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

Two mechanisms cover both the steady state and the very first frame:

1. **CSS injected at module load** — `CHROME_TRANSPARENT_CSS` is inserted into
   `<head>` from `injectChromeCssEarly()` at module-factory time, the earliest
   point the plugin can reach — earlier than `apply()` and before any React
   component renders. Its first rule forces the token itself transparent:

   ```css
   body, body[data-ds-dark-theme] {
     --dsw-specific-sidebar-fill: transparent !important;
   }
   ```

   The selector is `body`, **not** `:root`: the host defines all tokens in
   `design-platform.css` on `body`, and a value inherited from `:root` loses to
   `body`'s own declaration even when the inherited value is `!important`.
   More decisively, the theme presenter writes tokens as **inline** values on
   `body` (`body.style.setProperty(name, value)`). So the plugin also pins the
   token as an inline `!important` value at factory time and re-applies it on
   each glass scan (`keepChromeTransparent`) — an inline `!important` outranks
   the presenter's ordinary inline write. Both are restored on unload.

   This is the fix for "the sidebar and window buttons are still opaque on
   first open": the sidebar root (`SidebarRoot.module.css .root`), the Windows
   caption band and its `::before` drag strip, and the window controls in
   `[data-shell-leading]` all read that token or carry an opaque fill. Setting
   the variable once covers every one of them, without guessing hashed class
   names like `_root_xxx` (which do **not** contain `sidebarRoot`, so the old
   element-selector approach missed the sidebar root entirely). Element-level
   `background: transparent !important` rules cover the fills that come from
   `--dsw-alias-bg-base` rather than the token. `apply()` reuses the same style
   by id so no duplicate is inserted, and takes over its disposal.
2. **Token override** — `theme.overrideTokens('dsh-sea-explore-chrome', …)`
   with `transparent` in both light and dark as the runtime-level layer.

The style is removed on unload by the `ctx.effect` disposer, so the host theme
is never permanently modified. `tools/verify-chrome.cjs` checks the earliest
injection, the token override, the window-button rule, and the cleanup.

### Language-less code blocks

A fenced block without a language tag renders as `.md-code-block` containing a
plain `<pre>` and **no** `data-code-block-banner`, so the code-block target
(`div:has(> div > [data-code-block-banner])`) never sees it. Its background —
`--dsl-code-block-background` on the `pre`, plus a translucent container —
stayed opaque while the language-tagged blocks were glassed.

A dedicated rule empties the `pre` background for `.md-code-block` (and for any
`[class*="block_"]` container that has no banner), and gives the container the
same translucent fill as the glassed code blocks. The stable `md-code-block`
class is emitted on every fence container in both web and native builds.

## Sidebar: navigation rail + content area

The host `SidebarRoot.tsx` stacks the brand row, new-session row, scroll region
and footer vertically. This bundle restructures it into a **navigation rail +
content area** layout:

```
frame (grid: 4 columns)
├─ navCol             48px, class mP3x-q_navCol (holds panelList)
├─ sidebarCol
│  └─ root           (logoRow/newSessionRow moved into regionArea)
│     ├─ scrollRegion → regionArea + workspaces (conversation history)
│     └─ footArea    settings
├─ centerCol         conversation / other main panels
└─ rightbarCol
```

`applySidebarLayout()` creates `navCol` as the frame's first child, moves
`panelList` into it, and prepends `48px` to the host's inline
`grid-template-columns` (re-applied on every style mutation so React rewrites
cannot drop it). The nav no longer uses `fixed` positioning and the sidebar's
`padding-left` hack is gone — it is a real grid column. Because nav buttons now
live outside the sidebar subtree, navigation state is resolved through
`getSidebar()` / `getNavScope()` helpers rather than `closest()`.

DOM migration cannot be done in CSS, so `applySidebarLayout()` moves
`logoRow` and `newSessionRow` into `regionArea` and marks the three key nodes.
Because React re-renders would put those nodes back, a MutationObserver
installed with the glass driver re-runs the (idempotent) migration on every DOM
change. The host's original `sidebar.workspaces` content in `regionArea` — the
conversation-history list — is **kept**, but only visible while the Workspace
nav icon is highlighted (see below).

`SIDEBAR_LAYOUT_CSS` turns `scrollArea` into a horizontal flex. The rail is
`nav.panelList`, **fixed** to the window's left edge — the host collapses the
sidebar column to width 0 on Windows, so a rail inside that column would vanish;
fixed positioning keeps it visible whether the sidebar is open or closed. The
SidebarRoot element gets `padding-left: 45px` to make room. (The padding cannot
go on `[data-slot="sidebar"]`: slot anchors are `display: contents` per the
renderer's `ANCHOR_STYLE`, so they generate no box and ignore margins/padding.)
Icons are 36px; each label is a CSS tooltip on row hover. `_5Qcc8a_trigger`
is sized to 36px too. `tools/verify-sidebar-layout.cjs` asserts the CSS and the
real DOM migration in jsdom.

A **Workspace** nav button (home icon) sits at the head of `panelList`. It is a
navigation button, not a toggle: the app opens on it by default (persisted in
localStorage), clicking a host panel (Plugins etc.) deactivates it, and clicking
"More" (`aria-haspopup`) leaves it active. `regionArea` collapses to width 0
when the Workspace button is inactive. Home-mode collapse state is remembered (only updated when the user manually
toggles while on Home — leaving Home force-collapses without overwriting the
memory); a deferred restore runs after the host settles, so returning to Home
reliably re-expands. Clicking Home restores the **current main session** via
`uiWorkspace.openSession(sessionId)` (found from `sessions.list` where
`retainedBy.mainView > 0`), which is the host's own one-step
`selection.set + selectPanel(null)` path — plain `selectPanel(null)` left the
conversation empty and forced a manual session click. Blank sessions still just
get `selectPanel(null)`. The panel "unpin" buttons are hidden and re-homed into
a small right-click menu on each nav entry.

## 3. Session status line

Slot `conversation.composer.dock`, entry id `dsh-sea-explore-strip`, order `20`.

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
  the `dsh-sea-explore` namespace and `client.js` registers Chinese and English with
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
`"dsh-sea-explore": "link:C:/Users/11251/dsh-plugins/dsh-sea-explore"`.
