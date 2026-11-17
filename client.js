/* ============================================================================
 * shinoinject —— 浏览器产物（勿手改）
 *
 * 由 tools/build.cjs 从下面两部分拼装：
 *   vendor/liquidglass.js  —— example-tsx/liquidglass.ts 的无损转译产物
 *                             （tools/convert.cjs，esbuild 只剥离类型）
 *   src/app-body.js        —— 插件的接入与界面逻辑
 *
 * 功能：
 *   1. 聊天消息气泡与用户输入框做成液态玻璃（输入框原本是实底，已透明化）
 *   2. 侧边栏与 Windows 顶部标题带透明
 *   3. 输入框下方一行会话状态
 * ========================================================================== */
window.__ModuleLoader__.load({
  id: 'shinoinject',
  factory(require) {
      /* AUTO-GENERATED from example-tsx/liquidglass.ts by tools/convert.cjs — do not edit by hand. */
      var __ShinoLiquidGlass = (() => {
        var __defProp = Object.defineProperty;
        var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
        var __getOwnPropNames = Object.getOwnPropertyNames;
        var __hasOwnProp = Object.prototype.hasOwnProperty;
        var __export = (target, all) => {
          for (var name in all)
            __defProp(target, name, { get: all[name], enumerable: true });
        };
        var __copyProps = (to, from, except, desc) => {
          if (from && typeof from === "object" || typeof from === "function") {
            for (let key of __getOwnPropNames(from))
              if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
          }
          return to;
        };
        var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
        var stdin_exports = {};
        __export(stdin_exports, {
          LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE: () => LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE,
          LIQUID_GLASS_DEFAULTS: () => LIQUID_GLASS_DEFAULTS,
          LIQUID_GLASS_DISTORTION_SUPPORTED: () => LIQUID_GLASS_DISTORTION_SUPPORTED,
          LIQUID_GLASS_EFFECT_KEYS: () => LIQUID_GLASS_EFFECT_KEYS,
          LIQUID_GLASS_PARAM_BOUNDS: () => LIQUID_GLASS_PARAM_BOUNDS,
          LIQUID_GLASS_PRESETS: () => LIQUID_GLASS_PRESETS,
          LIQUID_GLASS_STORAGE_KEYS: () => LIQUID_GLASS_STORAGE_KEYS,
          applyLiquidGlassParams: () => applyLiquidGlassParams,
          clampLiquidGlassParam: () => clampLiquidGlassParam,
          installGlassJelly: () => installGlassJelly,
          installGlassLight: () => installGlassLight,
          isGlassJellyDragging: () => isGlassJellyDragging,
          makeGlass: () => makeGlass,
          readStoredLiquidGlassEffects: () => readStoredLiquidGlassEffects,
          readStoredLiquidGlassParams: () => readStoredLiquidGlassParams,
          releaseGlassJelly: () => releaseGlassJelly,
          setLiquidGlassJellyEnabled: () => setLiquidGlassJellyEnabled,
          setLiquidGlassLightEnabled: () => setLiquidGlassLightEnabled
        });
        const __ua = typeof navigator === "undefined" ? "" : String(navigator.userAgent || "");
        const __platform = typeof navigator === "undefined" ? "" : String(navigator.platform || "");
        const isWindowsPlatform = /Windows|Win32|Win64|WOW64/i.test(__ua) || /^Win/i.test(__platform);
        const isApplePlatform = /Mac OS X|Macintosh|iPhone|iPad|iPod/i.test(__ua) || /^Mac/i.test(__platform);
        const isChromiumRenderer = /Chrome\/|Chromium\/|Edg\/|OPR\//.test(__ua);
        let uid = 0;
        const SVGNS = "http://www.w3.org/2000/svg";
        const global = { strength: 2.5, blur: 1, sat: 180, bend: 15, gamma: 2 };
        const LIQUID_GLASS_DEFAULTS = { ...global };
        const LIQUID_GLASS_DISTORTION_SUPPORTED = isWindowsPlatform || isApplePlatform && isChromiumRenderer();
        const LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE = typeof window !== "undefined" && localStorage.getItem("gpu_preference") === "low-power";
        const LIQUID_GLASS_STORAGE_KEYS = {
          strength: "liquidglass_strength",
          blur: "liquidglass_blur",
          sat: "liquidglass_sat",
          bend: "liquidglass_bend",
          gamma: "liquidglass_gamma"
        };
        const LIQUID_GLASS_PARAM_BOUNDS = {
          strength: { min: 0, max: 6 },
          blur: { min: 0, max: 40 },
          sat: { min: 100, max: 300 },
          // ★ 配置位置③：设置面板滑杆量程（弯曲距离最终还会被容器半个短边封顶，见 rebuild）。
          bend: { min: 0, max: 300 },
          // 设置面板滑杆量程；小于 1 让折射带更宽，大于 1 更集中在边缘。
          // 只限制设置面板（以及全局值），data-glass-gamma 单元素覆盖不受上限约束，可传更大的值。
          gamma: { min: 1, max: 3 }
        };
        const LIQUID_GLASS_PRESETS = [
          { id: "frosted", strength: 0, blur: 12, bend: 0, needsDistortion: false },
          { id: "clear", strength: 2.5, blur: 1, bend: 15, needsDistortion: true },
          { id: "hazy", strength: 2.5, blur: 6, bend: 15, needsDistortion: true },
          { id: "eco", strength: 0, blur: 0, bend: 0, needsDistortion: false }
        ];
        const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
        const clampLiquidGlassParam = (key, value) => {
          if (!LIQUID_GLASS_DISTORTION_SUPPORTED && key === "strength") return LIQUID_GLASS_DEFAULTS.strength;
          if (!LIQUID_GLASS_DISTORTION_SUPPORTED && key === "sat") return 1;
          if (!LIQUID_GLASS_DISTORTION_SUPPORTED && key === "bend") return LIQUID_GLASS_DEFAULTS.bend;
          if (!LIQUID_GLASS_DISTORTION_SUPPORTED && key === "gamma") return LIQUID_GLASS_DEFAULTS.gamma;
          const { min, max } = LIQUID_GLASS_PARAM_BOUNDS[key];
          return Number.isFinite(value) ? clamp(value, min, max) : LIQUID_GLASS_DEFAULTS[key];
        };
        const readStoredParam = (key) => {
          if (typeof window === "undefined") return LIQUID_GLASS_DEFAULTS[key];
          const saved = localStorage.getItem(LIQUID_GLASS_STORAGE_KEYS[key]);
          return saved === null ? LIQUID_GLASS_DEFAULTS[key] : clampLiquidGlassParam(key, parseFloat(saved));
        };
        const readStoredLiquidGlassParams = () => ({
          strength: readStoredParam("strength"),
          blur: readStoredParam("blur"),
          sat: readStoredParam("sat"),
          bend: readStoredParam("bend"),
          gamma: readStoredParam("gamma")
        });
        const LIQUID_GLASS_EFFECT_KEYS = {
          light: "liquidglass_light",
          jelly: "liquidglass_jelly"
        };
        const readStoredFlag = (key) => {
          if (typeof window === "undefined") return true;
          return localStorage.getItem(key) !== "0";
        };
        const readStoredLiquidGlassEffects = () => ({
          light: readStoredFlag(LIQUID_GLASS_EFFECT_KEYS.light),
          jelly: readStoredFlag(LIQUID_GLASS_EFFECT_KEYS.jelly)
        });
        Object.assign(global, readStoredLiquidGlassParams());
        const roundedRectSDF = (x, y, hw, hh, r) => {
          const qx = Math.abs(x) - hw + r, qy = Math.abs(y) - hh + r;
          return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
        };
        let ownDefs = null;
        const getDefs = () => {
          const shared = document.querySelector("#filter-defs");
          if (shared) return shared;
          if (ownDefs && ownDefs.isConnected) return ownDefs;
          const svg = document.createElementNS(SVGNS, "svg");
          svg.setAttribute("width", "0");
          svg.setAttribute("height", "0");
          svg.setAttribute("aria-hidden", "true");
          svg.style.position = "absolute";
          const defs = document.createElementNS(SVGNS, "defs");
          svg.append(defs);
          document.documentElement.append(svg);
          ownDefs = defs;
          return defs;
        };
        const MAX_DISPLACE_DIM = 512;
        const REBUILD_GAP = 64;
        const GLASS_LEN_MIN = 0.2;
        const GLASS_LEN_MAX = 4;
        const glasses = /* @__PURE__ */ new WeakMap();
        const buildDisplacementMap = (w, h, bw, bh, radius, bezel, gamma, strength, zoom, lens) => {
          const canvas = document.createElement("canvas");
          canvas.width = bw;
          canvas.height = bh;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("[liquidglass] 2d canvas context unavailable");
          const img = ctx.createImageData(bw, bh);
          const raw = new Float32Array(bw * bh * 2);
          let maxD = 1e-4;
          const hw = w / 2, hh = h / 2;
          const k = strength * global.strength;
          const lensK = lens === 1 ? 0 : 1 / lens - 1;
          const stepX = w / bw, stepY = h / bh;
          for (let y = 0; y < bh; y++) {
            for (let x = 0; x < bw; x++) {
              const cx = (x + 0.5) * stepX - hw, cy = (y + 0.5) * stepY - hh;
              const d = roundedRectSDF(cx, cy, hw, hh, radius);
              const e = clamp(1 + d / bezel, 0, 1);
              const m = Math.pow(e, gamma);
              const len = Math.hypot(cx, cy) || 1;
              const dx = -(cx / len) * m * k * bezel - cx * zoom + cx * lensK;
              const dy = -(cy / len) * m * k * bezel - cy * zoom + cy * lensK;
              const i = (y * bw + x) * 2;
              raw[i] = dx;
              raw[i + 1] = dy;
              maxD = Math.max(maxD, Math.abs(dx), Math.abs(dy));
            }
          }
          const scale = maxD * 2;
          const data = img.data;
          for (let i = 0, p = 0; i < raw.length; i += 2, p += 4) {
            data[p] = clamp(raw[i] / scale + 0.5, 0, 1) * 255;
            data[p + 1] = clamp(raw[i + 1] / scale + 0.5, 0, 1) * 255;
            data[p + 2] = 128;
            data[p + 3] = 255;
          }
          ctx.putImageData(img, 0, 0);
          return { url: canvas.toDataURL(), scale };
        };
        const parseGlassOverride = (raw, key) => {
          if (raw === void 0) return null;
          const parsed = parseFloat(raw);
          if (!Number.isFinite(parsed)) return null;
          if (key === "gamma") {
            if (!LIQUID_GLASS_DISTORTION_SUPPORTED) return LIQUID_GLASS_DEFAULTS.gamma;
            return parsed > 0 ? parsed : null;
          }
          return clampLiquidGlassParam(key, parsed);
        };
        const parseGlassLen = (raw) => {
          if (raw === void 0) return null;
          const parsed = parseFloat(raw);
          if (!Number.isFinite(parsed) || parsed <= 0) return null;
          return clamp(parsed, GLASS_LEN_MIN, GLASS_LEN_MAX);
        };
        const makeGlass = (el) => {
          const existing = glasses.get(el);
          if (existing) {
            const nextLens = parseGlassLen(el.dataset.glassLen);
            if (nextLens !== existing.lenOverride) {
              existing.lenOverride = nextLens;
              existing.update();
            }
            return existing;
          }
          if (LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE) return null;
          const id = "lg-" + uid++;
          let filter = null;
          let feImage = null;
          let feDisp = null;
          if (LIQUID_GLASS_DISTORTION_SUPPORTED) {
            const defs = getDefs();
            filter = document.createElementNS(SVGNS, "filter");
            filter.setAttribute("id", id);
            filter.setAttribute("filterUnits", "userSpaceOnUse");
            filter.setAttribute("color-interpolation-filters", "sRGB");
            feImage = document.createElementNS(SVGNS, "feImage");
            feImage.setAttribute("result", "map");
            feImage.setAttribute("preserveAspectRatio", "none");
            feDisp = document.createElementNS(SVGNS, "feDisplacementMap");
            feDisp.setAttribute("in", "SourceGraphic");
            feDisp.setAttribute("in2", "map");
            feDisp.setAttribute("xChannelSelector", "R");
            feDisp.setAttribute("yChannelSelector", "G");
            filter.append(feImage, feDisp);
            defs.appendChild(filter);
          }
          const g = {
            el,
            filter,
            feImage,
            feDisp,
            id,
            strength: parseFloat(el.dataset.strength || "0.5"),
            zoom: parseFloat(el.dataset.zoom || "0"),
            blurOverride: parseGlassOverride(el.dataset.glassBlur, "blur"),
            strengthOverride: parseGlassOverride(el.dataset.glassStrength, "strength"),
            satOverride: parseGlassOverride(el.dataset.glassSat, "sat"),
            bendOverride: parseGlassOverride(el.dataset.glassBend, "bend"),
            gammaOverride: parseGlassOverride(el.dataset.glassGamma, "gamma"),
            lenOverride: parseGlassLen(el.dataset.glassLen),
            builtW: 0,
            builtH: 0,
            builtKey: "",
            builtAt: 0,
            rebuildTimer: 0,
            // 在元素当前尺寸上逐像素重建成图（贵的那步，O(w·h) + PNG 编码），成功后刷新指纹与时刻。
            rebuild() {
              const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
              if (!w || !h) return;
              const { filter: curFilter, feImage: curFeImage, feDisp: curFeDisp } = this;
              const effGlobalStrength = this.strengthOverride ?? global.strength;
              const effBend = this.bendOverride ?? global.bend;
              const effGamma = this.gammaOverride ?? global.gamma;
              const effLens = this.lenOverride ?? 1;
              const lensOn = effLens !== 1;
              if (!(curFilter && (lensOn || this.strength > 0 && effGlobalStrength > 0 && effBend > 0))) return;
              if (curFilter && curFeImage && curFeDisp) {
                const cs = getComputedStyle(el);
                let radius = parseFloat(cs.borderRadius) || 0;
                radius = Math.min(radius, w / 2, h / 2);
                const bezel = Math.min(effBend, Math.min(w, h) / 2);
                const k = Math.min(1, MAX_DISPLACE_DIM / Math.max(w, h));
                const { url, scale } = buildDisplacementMap(
                  w,
                  h,
                  Math.max(1, Math.round(w * k)),
                  Math.max(1, Math.round(h * k)),
                  radius,
                  bezel,
                  effGamma,
                  this.strength,
                  this.zoom * effGlobalStrength,
                  effLens
                );
                curFilter.setAttribute("width", String(w));
                curFilter.setAttribute("height", String(h));
                curFeImage.setAttribute("width", String(w));
                curFeImage.setAttribute("height", String(h));
                curFilter.setAttribute("x", "0");
                curFilter.setAttribute("y", "0");
                curFeImage.setAttribute("href", url);
                curFeDisp.setAttribute("scale", scale.toFixed(2));
              }
              this.builtW = w;
              this.builtH = h;
              this.builtKey = `${w}x${h}|${this.strength}|${this.zoom}|${effGlobalStrength}|${effBend}|${effGamma}|${effLens}`;
              this.builtAt = performance.now();
            },
            // 长宽变化的节流入口：窗口内只排一次尾补（窗口到期才成图），窗口已过则同步成图。
            // 首图（builtKey 为空）不节流：保证挂上玻璃的第一帧位移图就是对的。
            scheduleRebuild() {
              if (this.rebuildTimer) return;
              const wait = REBUILD_GAP - (performance.now() - this.builtAt);
              if (wait <= 0 || !this.builtKey) {
                this.rebuild();
                return;
              }
              this.rebuildTimer = window.setTimeout(() => {
                this.rebuildTimer = 0;
                this.rebuild();
              }, wait);
            },
            update() {
              const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
              if (!w || !h) return;
              const { filter: curFilter, feImage: curFeImage, feDisp: curFeDisp } = this;
              if (curFilter && curFeImage && curFeDisp) {
                curFilter.setAttribute("width", String(w));
                curFilter.setAttribute("height", String(h));
                curFeImage.setAttribute("width", String(w));
                curFeImage.setAttribute("height", String(h));
                curFilter.setAttribute("x", "0");
                curFilter.setAttribute("y", "0");
              }
              const blur = this.blurOverride ?? global.blur;
              const sat = this.satOverride ?? global.sat;
              const effGlobalStrength = this.strengthOverride ?? global.strength;
              const effBend = this.bendOverride ?? global.bend;
              const effGamma = this.gammaOverride ?? global.gamma;
              const effLens = this.lenOverride ?? 1;
              const lensOn = effLens !== 1;
              const refractionOn = !!curFilter && (lensOn || this.strength > 0 && effGlobalStrength > 0 && effBend > 0);
              const parts = [];
              if (curFilter) parts.push(`saturate(${sat}%)`);
              if (blur > 0) parts.push(`blur(${blur}px)`);
              if (refractionOn) parts.push(`url(#${id})`);
              const backdrop = parts.length ? parts.join(" ") : "none";
              el.style.backdropFilter = backdrop;
              el.style.setProperty("-webkit-backdrop-filter", backdrop);
              if (!curFilter || !curFeImage || !curFeDisp) return;
              const key = `${w}x${h}|${this.strength}|${this.zoom}|${effGlobalStrength}|${effBend}|${effGamma}|${effLens}`;
              if (key === this.builtKey) return;
              if (!refractionOn) return;
              if (w !== this.builtW || h !== this.builtH) this.scheduleRebuild();
              else this.rebuild();
            }
          };
          new ResizeObserver(() => g.update()).observe(el);
          glasses.set(el, g);
          return g;
        };
        let refreshQueued = false;
        const refreshAllGlasses = () => {
          if (refreshQueued) return;
          refreshQueued = true;
          requestAnimationFrame(() => {
            refreshQueued = false;
            document.querySelectorAll("[data-glass]").forEach((el) => glasses.get(el)?.update());
          });
        };
        const applyLiquidGlassParams = (next) => {
          if (next.strength !== void 0) global.strength = clampLiquidGlassParam("strength", next.strength);
          if (next.blur !== void 0) global.blur = clampLiquidGlassParam("blur", next.blur);
          if (next.sat !== void 0) global.sat = clampLiquidGlassParam("sat", next.sat);
          if (next.bend !== void 0) global.bend = clampLiquidGlassParam("bend", next.bend);
          if (next.gamma !== void 0) global.gamma = clampLiquidGlassParam("gamma", next.gamma);
          refreshAllGlasses();
        };
        const JELLY_TRANS_DELTA_MAX = 60;
        const JELLY_TRANS_RATIO = 10;
        const JELLY_DEFORM_RATIO = 20;
        const JELLY_SIZE_DELTA_MAX = 20;
        const JELLY_PERP = 0.35;
        const JELLY_SIZE_MIN_RATIO = 0.5;
        const JELLY_SIZE_MAX_RATIO = 1.4;
        const JELLY_POS_K = 400;
        const JELLY_POS_C = 24;
        const JELLY_STR_K = 120;
        const JELLY_STR_C = 27;
        const JELLY_POS_K_BACK = 6e3;
        const JELLY_POS_C_BACK = 100;
        const JELLY_STR_K_BACK = 6e3;
        const JELLY_STR_C_BACK = 160;
        const JELLY_STEP = 1 / 120;
        const JELLY_MAX_SUBSTEPS = 8;
        const JELLY_REST_OFF = 0.05;
        const JELLY_REST_SIZE_OFF = 0.05;
        const JELLY_REST_V = 0.6;
        const JELLY_REST_SIZE_V = 2;
        const jellySaturate = (d, max, k) => max * d / (d + k);
        const jellyIntegrate = (x, v, target, dt, k, c) => {
          const a = k * (target - x) - c * v;
          const v2 = v + a * dt;
          return [x + v2 * dt, v2];
        };
        let jellyInstalled = false;
        let jellyEnabled = !LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE && readStoredFlag(LIQUID_GLASS_EFFECT_KEYS.jelly);
        let jEl = null;
        let jPointerId = -1;
        let jTouchId = null;
        let jDragging = false;
        let jStartPX = 0;
        let jStartPY = 0;
        let jPx = 0;
        let jPy = 0;
        let jOx = 0;
        let jVoX = 0;
        let jOy = 0;
        let jVoY = 0;
        let jW0 = 0;
        let jH0 = 0;
        let jW = 0;
        let jVW = 0;
        let jH = 0;
        let jVH = 0;
        let jTW = 0;
        let jTH = 0;
        let jTOx = 0;
        let jTOy = 0;
        let jBase = "";
        let jLastWritten = null;
        let jRaf = 0;
        let jLastFrame = 0;
        let jAcc = 0;
        const jellyStopLoop = () => {
          if (jRaf) cancelAnimationFrame(jRaf);
          jRaf = 0;
          jLastFrame = 0;
          jAcc = 0;
        };
        const jellyFinish = () => {
          jellyStopLoop();
          const el = jEl;
          const ownsTransform = el !== null && el.style.transform === jLastWritten;
          jEl = null;
          jDragging = false;
          jPointerId = -1;
          jTouchId = null;
          jOx = jVoX = jOy = jVoY = 0;
          jW = jVW = jH = jVH = 0;
          jTW = jTH = 0;
          jW0 = jH0 = 0;
          jTOx = jTOy = 0;
          jLastWritten = null;
          if (el?.isConnected && ownsTransform) el.style.transform = jBase;
        };
        const jellyAtRest = () => Math.abs(jOx - jTOx) < JELLY_REST_OFF && Math.abs(jOy - jTOy) < JELLY_REST_OFF && Math.abs(jW - jTW) < JELLY_REST_SIZE_OFF && Math.abs(jH - jTH) < JELLY_REST_SIZE_OFF && Math.abs(jVoX) < JELLY_REST_V && Math.abs(jVoY) < JELLY_REST_V && Math.abs(jVW) < JELLY_REST_SIZE_V && Math.abs(jVH) < JELLY_REST_SIZE_V;
        const jellyUpdateTarget = () => {
          const dx = jPx - jStartPX;
          const dy = jPy - jStartPY;
          const d = Math.hypot(dx, dy);
          if (d < 1) {
            jTOx = jTOy = 0;
            jTW = jW0;
            jTH = jH0;
            return;
          }
          const tk = JELLY_TRANS_DELTA_MAX * JELLY_TRANS_RATIO;
          const t = jellySaturate(d, JELLY_TRANS_DELTA_MAX, tk);
          jTOx = dx / d * t;
          jTOy = dy / d * t;
          if (!jW0 || !jH0) return;
          const adx = Math.abs(dx);
          const ady = Math.abs(dy);
          const dw = clamp((adx - ady * JELLY_PERP) / JELLY_DEFORM_RATIO, -JELLY_SIZE_DELTA_MAX, JELLY_SIZE_DELTA_MAX);
          const dh = clamp((ady - adx * JELLY_PERP) / JELLY_DEFORM_RATIO, -JELLY_SIZE_DELTA_MAX, JELLY_SIZE_DELTA_MAX);
          jTW = clamp(jW0 + dw, jW0 * JELLY_SIZE_MIN_RATIO, jW0 * JELLY_SIZE_MAX_RATIO);
          jTH = clamp(jH0 + dh, jH0 * JELLY_SIZE_MIN_RATIO, jH0 * JELLY_SIZE_MAX_RATIO);
        };
        const jellyReadBase = (value) => {
          const trimmed = value.trim();
          return !trimmed || trimmed === "none" ? "" : trimmed;
        };
        const jellyWrite = () => {
          const el = jEl;
          if (!el || !el.isConnected) {
            jellyFinish();
            return;
          }
          const cur = el.style.transform;
          if (cur !== jLastWritten) jBase = jellyReadBase(cur);
          const sx = jW0 ? jW / jW0 : 1;
          const sy = jH0 ? jH / jH0 : 1;
          if (Math.abs(jOx) < 0.01 && Math.abs(jOy) < 0.01 && Math.abs(sx - 1) < 1e-3 && Math.abs(sy - 1) < 1e-3) {
            el.style.transform = jBase;
            jLastWritten = jBase;
            return;
          }
          el.style.transform = `${jBase ? jBase + " " : ""}translate(${jOx.toFixed(2)}px, ${jOy.toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
          jLastWritten = el.style.transform;
        };
        const jellyFrame = (t) => {
          jRaf = 0;
          const dtMs = jLastFrame ? Math.min(t - jLastFrame, 64) : JELLY_STEP * 1e3;
          jLastFrame = t;
          jAcc += dtMs / 1e3;
          let steps = 0;
          const back = !jDragging;
          const pk = back ? JELLY_POS_K_BACK : JELLY_POS_K;
          const pc = back ? JELLY_POS_C_BACK : JELLY_POS_C;
          const sk = back ? JELLY_STR_K_BACK : JELLY_STR_K;
          const sc = back ? JELLY_STR_C_BACK : JELLY_STR_C;
          while (jAcc >= JELLY_STEP && steps < JELLY_MAX_SUBSTEPS) {
            [jOx, jVoX] = jellyIntegrate(jOx, jVoX, jTOx, JELLY_STEP, pk, pc);
            [jOy, jVoY] = jellyIntegrate(jOy, jVoY, jTOy, JELLY_STEP, pk, pc);
            [jW, jVW] = jellyIntegrate(jW, jVW, jTW, JELLY_STEP, sk, sc);
            [jH, jVH] = jellyIntegrate(jH, jVH, jTH, JELLY_STEP, sk, sc);
            jAcc -= JELLY_STEP;
            steps++;
          }
          if (steps >= JELLY_MAX_SUBSTEPS) jAcc = 0;
          if (!jDragging && jellyAtRest()) {
            jellyFinish();
            return;
          }
          jellyWrite();
          if (jDragging && jellyAtRest()) {
            jellyStopLoop();
            return;
          }
          jRaf = requestAnimationFrame(jellyFrame);
        };
        const jellyEnsureLoop = () => {
          if (!jRaf) {
            jLastFrame = 0;
            jRaf = requestAnimationFrame(jellyFrame);
          }
        };
        const jellyOnPointerDown = (e) => {
          if (!jellyEnabled || jDragging || typeof window === "undefined") return;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          if (e.pointerType === "touch" && !e.isPrimary) return;
          const el = e.target instanceof Element ? e.target.closest("[data-glass-jelly]") : null;
          if (!el) return;
          if (jEl) jellyFinish();
          jEl = el;
          jPointerId = e.pointerId;
          jTouchId = null;
          jDragging = true;
          jStartPX = jPx = e.clientX;
          jStartPY = jPy = e.clientY;
          jOx = jVoX = jOy = jVoY = 0;
          jW0 = el.offsetWidth;
          jH0 = el.offsetHeight;
          jW = jTW = jW0;
          jH = jTH = jH0;
          jVW = jVH = 0;
          jTOx = jTOy = 0;
          jBase = jellyReadBase(el.style.transform);
          jLastWritten = el.style.transform;
        };
        const jellyOnPointerMove = (e) => {
          if (!jDragging || e.pointerId !== jPointerId) return;
          if (!jEl?.isConnected) {
            jellyFinish();
            return;
          }
          jPx = e.clientX;
          jPy = e.clientY;
          jellyUpdateTarget();
          jellyEnsureLoop();
        };
        const jellyEndPointer = () => {
          if (!jDragging) return;
          jDragging = false;
          jPointerId = -1;
          jTouchId = null;
          jTOx = jTOy = 0;
          jTW = jW0;
          jTH = jH0;
          jellyEnsureLoop();
        };
        const JELLY_TOUCH_SLOP = 8;
        const jellyTouchPoint = (e) => {
          if (jTouchId === null) return e.touches[0] ?? null;
          for (let i = 0; i < e.touches.length; i += 1) {
            if (e.touches[i].identifier === jTouchId) return e.touches[i];
          }
          return null;
        };
        const jellyOnTouchStart = (e) => {
          if (!jDragging || jTouchId !== null) return;
          const t = e.changedTouches[0];
          if (!t) return;
          jTouchId = t.identifier;
        };
        const jellyOnTouchMove = (e) => {
          if (!jDragging) return;
          const t = jellyTouchPoint(e);
          if (!t) return;
          if (jTouchId === null) jTouchId = t.identifier;
          if (!jEl?.isConnected) {
            jellyFinish();
            return;
          }
          if (Math.hypot(t.clientX - jStartPX, t.clientY - jStartPY) < JELLY_TOUCH_SLOP) return;
          jPx = t.clientX;
          jPy = t.clientY;
          jellyUpdateTarget();
          jellyEnsureLoop();
        };
        const jellyOnTouchEnd = () => {
          if (!jDragging) return;
          jellyEndPointer();
        };
        const jellyOnPointerCancel = (e) => {
          if (e.pointerType !== "mouse") return;
          jellyEndPointer();
        };
        const installGlassJelly = () => {
          if (jellyInstalled || typeof window === "undefined") return;
          jellyInstalled = true;
          window.addEventListener("pointerdown", jellyOnPointerDown, { capture: true });
          window.addEventListener("pointermove", jellyOnPointerMove, { passive: true });
          window.addEventListener("pointerup", jellyEndPointer);
          window.addEventListener("pointercancel", jellyOnPointerCancel);
          window.addEventListener("touchstart", jellyOnTouchStart, { passive: true });
          window.addEventListener("touchmove", jellyOnTouchMove, { passive: true });
          window.addEventListener("touchend", jellyOnTouchEnd);
          window.addEventListener("touchcancel", jellyOnTouchEnd);
          window.addEventListener("blur", jellyEndPointer);
          document.addEventListener("visibilitychange", jellyEndPointer);
        };
        const setLiquidGlassJellyEnabled = (enabled) => {
          jellyEnabled = enabled && !LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE;
          if (!jellyEnabled) jellyFinish();
        };
        const releaseGlassJelly = () => {
          if (jEl || jDragging) jellyFinish();
        };
        const isGlassJellyDragging = () => jDragging;
        const LIGHT_DEFAULT_RANGE = 160;
        const LIGHT_FALLBACK_COLOR = "rgba(255,255,255,0.6)";
        const LIGHT_FADE_MS = 200;
        const LIGHT_HOVER_OPACITY = 0.32;
        const LIGHT_PRESS_OPACITY = 1;
        let lightInstalled = false;
        let lightEnabled = !LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE && readStoredFlag(LIQUID_GLASS_EFFECT_KEYS.light);
        let lightEl = null;
        let lightLayer = null;
        let lightHoverEl = null;
        let lightPressEl = null;
        let lightPointerId = -1;
        let lightX = 0;
        let lightY = 0;
        let lightRange = LIGHT_DEFAULT_RANGE;
        let lightForcedRelative = false;
        const parseLightRange = (el) => {
          const raw = parseFloat(el.dataset.glassLight || "");
          return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 4e3) : LIGHT_DEFAULT_RANGE;
        };
        const lightLocalPoint = (el, clientX, clientY) => {
          const rect = el.getBoundingClientRect();
          const sx = rect.width ? el.offsetWidth / rect.width : 1;
          const sy = rect.height ? el.offsetHeight / rect.height : 1;
          return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
        };
        const lightPaint = (el, clientX, clientY) => {
          if (!lightLayer) return;
          const { x, y } = lightLocalPoint(el, clientX, clientY);
          lightLayer.style.background = `radial-gradient(circle ${lightRange}px at ${x}px ${y}px, var(--lg-light-color, ${LIGHT_FALLBACK_COLOR}), transparent ${lightRange}px)`;
        };
        const lightUnmount = () => {
          const el = lightEl;
          lightEl = null;
          if (lightLayer) {
            const layer = lightLayer;
            lightLayer = null;
            layer.style.opacity = "0";
            window.setTimeout(() => layer.remove(), LIGHT_FADE_MS + 40);
          }
          if (el && lightForcedRelative) el.style.position = "";
          lightForcedRelative = false;
        };
        const lightMount = (el, clientX, clientY, opacity) => {
          if (getComputedStyle(el).position === "static") {
            el.style.position = "relative";
            lightForcedRelative = true;
          }
          const layer = document.createElement("div");
          layer.setAttribute("aria-hidden", "true");
          layer.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0;transition:opacity ${LIGHT_FADE_MS}ms ease;`;
          layer.style.setProperty("border-radius", "inherit", "important");
          lightLayer = layer;
          lightRange = parseLightRange(el);
          lightPaint(el, clientX, clientY);
          el.appendChild(layer);
          void layer.offsetWidth;
          lightEl = el;
          layer.style.opacity = String(opacity);
        };
        const lightSync = () => {
          if (!lightEnabled) {
            lightUnmount();
            return;
          }
          const want = lightPressEl && lightPressEl.isConnected ? lightPressEl : lightHoverEl && lightHoverEl.isConnected ? lightHoverEl : null;
          const opacity = lightPressEl ? LIGHT_PRESS_OPACITY : LIGHT_HOVER_OPACITY;
          if (!want) {
            lightUnmount();
            return;
          }
          if (lightEl !== want) {
            lightUnmount();
            lightMount(want, lightX, lightY, opacity);
            return;
          }
          lightPaint(want, lightX, lightY);
          if (lightLayer) lightLayer.style.opacity = String(opacity);
        };
        const lightHoverTarget = (e) => e.pointerType === "mouse" && e.target instanceof Element ? e.target.closest("[data-glass-light]") : null;
        const lightReduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lightOnPointerOver = (e) => {
          if (!lightEnabled || lightReduceMotion()) return;
          const el = lightHoverTarget(e);
          if (el === lightHoverEl) return;
          lightHoverEl = el;
          lightSync();
        };
        const lightOnPointerOut = (e) => {
          if (!lightEnabled) return;
          const to = e.pointerType === "mouse" && e.relatedTarget instanceof Element ? e.relatedTarget.closest("[data-glass-light]") : null;
          if (to === lightHoverEl) return;
          lightHoverEl = to;
          lightSync();
        };
        const lightOnPointerDown = (e) => {
          if (!lightEnabled || lightReduceMotion()) return;
          const el = e.target instanceof Element ? e.target.closest("[data-glass-light]") : null;
          if (!el) return;
          lightPressEl = el;
          lightPointerId = e.pointerId;
          lightX = e.clientX;
          lightY = e.clientY;
          lightSync();
        };
        const lightOnPointerMove = (e) => {
          if (!lightEnabled || !lightLayer) return;
          if (lightPressEl) {
            if (e.pointerId !== lightPointerId) return;
          } else if (!lightHoverEl) return;
          lightX = e.clientX;
          lightY = e.clientY;
          lightPaint(lightPressEl ?? lightHoverEl, lightX, lightY);
        };
        const lightOnPointerCancel = (e) => {
          if (e.pointerType !== "mouse") return;
          lightEndPress(e);
        };
        const lightOnTouchMove = (e) => {
          if (!lightEnabled || !lightLayer || !lightPressEl || !lightPressEl.isConnected) return;
          const t = e.touches[0];
          if (!t) return;
          lightX = t.clientX;
          lightY = t.clientY;
          lightPaint(lightPressEl, lightX, lightY);
        };
        const lightEndPress = (e) => {
          if (!lightPressEl) return;
          if (e && typeof e.pointerId === "number" && e.pointerId !== lightPointerId) return;
          lightPressEl = null;
          lightPointerId = -1;
          lightSync();
        };
        const lightOnTouchEnd = () => {
          lightEndPress();
        };
        const lightEndAll = () => {
          lightPressEl = null;
          lightPointerId = -1;
          lightHoverEl = null;
          lightSync();
        };
        const installGlassLight = () => {
          if (lightInstalled || typeof window === "undefined") return;
          lightInstalled = true;
          window.addEventListener("pointerover", lightOnPointerOver, { capture: true });
          window.addEventListener("pointerout", lightOnPointerOut, { capture: true });
          window.addEventListener("pointerdown", lightOnPointerDown, { capture: true });
          window.addEventListener("pointermove", lightOnPointerMove, { passive: true });
          window.addEventListener("pointerup", lightEndPress);
          window.addEventListener("pointercancel", lightOnPointerCancel);
          window.addEventListener("touchmove", lightOnTouchMove, { passive: true });
          window.addEventListener("touchend", lightOnTouchEnd);
          window.addEventListener("touchcancel", lightOnTouchEnd);
          window.addEventListener("blur", lightEndAll);
          document.addEventListener("visibilitychange", lightEndAll);
        };
        const setLiquidGlassLightEnabled = (enabled) => {
          lightEnabled = enabled && !LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE;
          if (!lightEnabled) {
            lightPressEl = null;
            lightPointerId = -1;
            lightHoverEl = null;
            lightSync();
          }
        };
        return __toCommonJS(stdin_exports);
      })();

      /* ============================================================================
       * shinoinject —— 客户端半边（应用层代码）
       *
       * 这个文件不直接发布：tools/build.cjs 会把 vendor/liquidglass.js（由
       * example-tsx/liquidglass.ts 无损转译而来）拼在它前面，一起写进 client.js。
       *
       * 三件事：
       *   一、液态玻璃——聊天消息气泡与用户输入框。
       *   二、外壳透明——侧边栏与 Windows 顶部标题带。
       *   三、会话状态条——输入框下方一行状态。
       *
       * 玻璃的接入方式：
       *   liquidglass 的入口是「给带 data-glass 的元素挂 backdrop-filter + 位移图」，
       *   它自己只认 DOM 属性，不认 React。宿主的输入框卡片（[data-composer-card]）
       *   和用户气泡（[data-message-bubble]）都不是我们的组件，所以这里用
       *   MutationObserver + 首帧扫描把属性打上去，再交给 makeGlass。
       *
       *   输入框与气泡原本是不透明的（--dsw-specific-input-major / --dsw-specific-bubble
       *   都是实色），backdrop-filter 采样不到后面的东西，玻璃看不出来。所以这两处
       *   的元素底色改成半透明，再加边框高光与投影——这一步就是需求里说的
       *   「用户输入框没有透明，需要自行透明化」。
       * ========================================================================== */
      const LG = __ShinoLiquidGlass;

      /* ------------------------------------------------------------ 玻璃的样式 */

      // 玻璃的「边饰」照抄 reference usage.tsx 的四条：
      //   borderTop / borderBottom  #fff6            上下缘高光（玻璃截住光的两条边）
      //   outline                   rgba(35,35,35,.3) 深色分离环，贴在边框外侧
      //   box-shadow                0 8px 16px rgba(40,40,40,.2)  投影
      //
      // 为什么不写成四边 border：参考实现只给上下两条。玻璃是「透镜」，
      // 光只在水平切线上发生全反射，四周都描白边会变回一张普通卡片。
      // outline 不进布局，所以它负责环；box-shadow 负责落地感。
      //
      // 这四组是光学常数（白光 + 中性灰），不是界面语义色，因此不套
      // --dsw-alias-*；只有暗色主题下 outline / shadow 需要换一组，
      // 否则深色环贴在深色壁纸上等于没有轮廓。
      // 全局统一的玻璃边饰。outline 在所有玻璃表面上保持同一个值，
      // 不随深浅色切换——它是玻璃的物理轮廓，不是主题色。
      const GLASS_EDGE_CSS = `
      [data-composer-card][data-shino-card],
      [data-message-bubble][data-shino-glass],
      [data-presented-file][data-shino-glass],
      [role="dialog"][aria-modal="true"][data-shino-glass],
      [data-sidebar-right-guide-entry][data-shino-glass],
      [data-shino-guide-entry][data-shino-glass],
      [data-shino-new-session][data-shino-glass],
      [data-shino-code-block][data-shino-glass],
      [data-question-key][data-shino-glass],
      [data-question-reply] > div > div[data-shino-glass] {
        border: 0 !important;
        border-top: 1px solid #fff6 !important;
        border-bottom: 1px solid #fff6 !important;
        outline: 1px solid rgba(35, 35, 35, 0.3) !important;
        box-shadow: 0 8px 16px rgba(40, 40, 40, 0.2) !important;
      }

      /* 菜单：边饰画在**表面**上，不在材质层上。
         材质层是 inset:0 的子元素，它的 outline 会被表面裁掉、看不见；
         表面才是菜单真正有形状的那一层。 */
      [data-menu-material] {
        border: 0 !important;
        border-top: 1px solid #fff6 !important;
        border-bottom: 1px solid #fff6 !important;
        outline: 1px solid rgba(35, 35, 35, 0.3) !important;
        box-shadow: 0 8px 16px rgba(40, 40, 40, 0.2) !important;
      }

      /* 暗色只加深投影，outline 一律保持上面那条（输入框卡片也在其中）。 */
      body[data-ds-dark-theme] [data-composer-card][data-shino-card],
      body[data-ds-dark-theme] [data-message-bubble][data-shino-glass],
      body[data-ds-dark-theme] [data-presented-file][data-shino-glass],
      body[data-ds-dark-theme] [data-menu-material],
      body[data-ds-dark-theme] [role="dialog"][aria-modal="true"][data-shino-glass],
      body[data-ds-dark-theme] [data-sidebar-right-guide-entry][data-shino-glass],
      body[data-ds-dark-theme] [data-shino-guide-entry][data-shino-glass],
      body[data-ds-dark-theme] [data-shino-new-session][data-shino-glass],
      body[data-ds-dark-theme] [data-shino-code-block][data-shino-glass],
      body[data-ds-dark-theme] [data-question-key][data-shino-glass],
      body[data-ds-dark-theme] [data-question-reply] > div > div[data-shino-glass] {
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45) !important;
      }
      `;

      const GLASS_CSS = GLASS_EDGE_CSS + `
      /* 输入框卡片：滤镜由它自己的滤镜层承担（见 [data-shino-card-filter]），
         这里只负责边饰。卡片自身不带 backdrop-filter，也不带背景色——
         这样渲染在卡片内部的弹窗不会被它截断采样，滤镜层也能真正压在最底层。 */
      [data-composer-card][data-shino-card] {
        position: relative;
        /* 建立层叠上下文：滤镜层才能稳定地待在卡片的最底层，
           而不会跑到卡片外面或压住卡片内容。 */
        isolation: isolate;
        background: transparent !important;
        /* 边饰由全局统一的 GLASS_EDGE_CSS 给出，不在这里重复。 */
      }

      /* 输入框的滤镜层：铺满卡片，压在卡片的最底层。
         它与弹窗在 DOM 上互不包含，因此两者的 backdrop-filter 互不截断。
         z-index:-1 让它落在卡片背景之下、内容之上——滤镜采样的是它背后
         （页面）的像素，玻璃的折射因此仍能看到壁纸。
         半透明的底色也放在这一层，卡片自身保持透明。 */
      [data-shino-card-filter] {
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        pointer-events: none;
        background: color-mix(in srgb, var(--dsw-specific-input-major) 22%, transparent) !important;
      }

      /* 用户回复的气泡：液态玻璃 + 半透明底。
         宿主底色是 --dsw-specific-bubble（实色），不掏空的话 backdrop-filter
         采样不到背后的内容，玻璃会退化成一块平色。
         用 color-mix 从同一个 token 派生，深浅色各自成立。 */
      [data-message-bubble][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-specific-bubble) 38%, transparent) !important;
      }

      /* 夜间模式：底色本就深，比例提高以保证正文可读。 */
      body[data-ds-dark-theme] [data-message-bubble][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-specific-bubble) 58%, transparent) !important;
      }

      /* 产物卡片（present 工具的文件卡片）：60px 高的小方块，底色是
         --dsw-alias-card-fill（经 .root 的 --deliverable-fill 间接引用）。
         fill 与 hover 一起换成半透明，否则鼠标移上去会盖回实色、玻璃突然消失。 */
      [data-presented-file][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-alias-card-fill) 26%, transparent) !important;
        transition: background-color 120ms ease;
      }

      [data-presented-file][data-shino-glass]:hover {
        background: color-mix(in srgb, var(--dsw-alias-card-fill-hover) 38%, transparent) !important;
      }

      /* 卡片里的文件类型图标块，同属玻璃表面，一起掏空以保持层次一致。 */
      [data-presented-file][data-shino-glass] [class*="fileIcon"] {
        background: color-mix(in srgb, var(--dsw-alias-card-tile-fill) 30%, transparent) !important;
      }

      /* 回复里的代码块：容器底色是 --dsl-code-block-background
         （= --dsw-alias-markdown-code-block），banner 另外铺了一层
         --dsw-alias-bg-base 实色。两处都要掏空，否则玻璃顶部会被一条
         实色横条盖住，只剩下面的正文透明。 */
      [data-shino-code-block][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-alias-markdown-code-block) 40%, transparent) !important;
      }

      [data-shino-code-block][data-shino-glass] [data-code-block-banner] {
        background: color-mix(in srgb, var(--dsw-alias-markdown-code-block-banner) 42%, transparent) !important;
      }

      /* banner 的 sticky 包裹层也是实色（--dsw-alias-bg-base），一并掏空，
         否则玻璃顶部会被一条实色横条盖住。真实结构：容器 > bannerWrap > banner。 */
      [data-shino-code-block][data-shino-glass] > div:has(> [data-code-block-banner]) {
        background: transparent !important;
      }

      /* 模型提问的卡片：宿主底色是 --dsw-specific-input-major（实色），
         掏空后交给玻璃。 */
      [data-question-key][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-specific-input-major) 24%, transparent) !important;
      }

      /* 上下文里用户回答提问的气泡：底色同用户气泡（--dsw-specific-bubble）。 */
      [data-question-reply] > div > div[data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-specific-bubble) 38%, transparent) !important;
      }

      body[data-ds-dark-theme] [data-question-reply] > div > div[data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-specific-bubble) 58%, transparent) !important;
      }

      /* 通用模态框：设置面板、确认框等。面板底色是实色，
         overlay 遮罩保持原样（它需要压暗后面）。 */[role="dialog"][aria-modal="true"][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-alias-bg-overlay) 34%, transparent) !important;
      }

      /* 夜间模式：菜单与模态框的遮罩同样调浅。
         暗色底本身就重，再压一层会把背景压成纯黑，玻璃失去可折射的内容。 */
      body[data-ds-dark-theme] [role="dialog"][aria-modal="true"][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-alias-bg-overlay) 24%, transparent) !important;
      }

      /* 右侧栏引导页的入口按钮：宿主底色是 --dsw-alias-bg-layer-1，
         hover 换成 --dsw-alias-interactive-bg-hover（不处理的话鼠标一上去玻璃就没了）。 */
      [data-sidebar-right-guide-entry][data-shino-glass],
      [data-shino-guide-entry][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 30%, transparent) !important;
      }

      [data-sidebar-right-guide-entry][data-shino-glass]:hover,
      [data-shino-guide-entry][data-shino-glass]:hover {
        background: color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 60%, transparent) !important;
      }

      /* 侧边栏「新会话」按钮：原本是透明图标按钮，玻璃化后给它一层
         很薄的底色，让折射有可依附的表面，同时保持低调。 */
      [data-shino-new-session][data-shino-glass] {
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 26%, transparent) !important;
      }

      [data-shino-new-session][data-shino-glass]:hover {
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 40%, transparent) !important;
      }

      /* 中间列：玻璃的 backdrop-filter 采样的是「它背后已经画好的像素」。
         这一层若还是实底，折射出来的只是它自己的颜色，玻璃就退化成一块平色。

         必须覆盖所有主面板页面，不能只覆盖会话页：
         · 会话页  —— ConversationRoot 的根（带 data-phase 与 data-conversation-content）
         · 插件页 / 自动化任务页 / 设置页等 —— 直接挂在 AppFrame 的 centerCol 里，
           底色来自 centerCol 与 frame 的 --dsw-alias-bg-base。

         AppFrame 的 CSS Modules 类名在 web bundle 与 native 构建里格式不同：
         web 是 下划线 centerCol 下划线 哈希 下划线 序号，
         native 是 哈希 下划线 centerCol。
         两种都含 centerCol 这个片段且后接下划线或字符串结尾，
         以此排除 centerColIcon 这类同前缀的无关类名。 */
      [data-phase][class]:has(> [data-conversation-content]),
      [class*="centerCol_"],
      [class$="centerCol"] {
        background: color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent) !important;
      }

      /* 夜间模式：遮罩调浅。
         暗色下的 --dsw-alias-bg-base 本身就很深，58% 的不透明度会把壁纸
         压得几乎看不见，玻璃也就失去了可折射的内容。这里降到 38%，
         夜色依旧压得住正文，但背景图能透上来参与折射。 */
      body[data-ds-dark-theme] [data-phase][class]:has(> [data-conversation-content]),
      body[data-ds-dark-theme] [class*="centerCol_"],
      body[data-ds-dark-theme] [class$="centerCol"] {
        background: color-mix(in srgb, var(--dsw-alias-bg-base) 38%, transparent) !important;
      }

      /* frame 自己也铺了一层 --dsw-alias-bg-base，不掏空的话中间列的薄纱
         下面仍是实底，等于没改。标题带/侧边栏的透明由 token override 负责。
         :has(> centerCol) 把范围锁在 AppFrame 的根网格上，避免命中同名的其它
         模块类（例如会话宽度控制的 _frame）。 */
      [class*="frame"]:has(> [class*="centerCol"]) {
        background: transparent !important;
      }

      @media (prefers-reduced-transparency: reduce) {
        /* 系统要求降低透明时退回可读的实底，宁可没有玻璃。 */
        [data-composer-card][data-shino-card] {
          background: var(--dsw-specific-input-major) !important;
        }
        [data-shino-card-filter] {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background: transparent !important;
        }
        [data-presented-file][data-shino-glass] {
          background: var(--dsw-alias-card-fill) !important;
        }
        [data-phase][class]:has(> [data-conversation-content]),
        [class*="centerCol_"],
        [class$="centerCol"] {
          background: var(--dsw-alias-bg-base) !important;
        }
        [class*="frame"]:has(> [class*="centerCol"]) {
          background: var(--dsw-alias-bg-base) !important;
        }
      }
      `;

      /* ---------------------------------------------------------------- 菜单玻璃 */
      //
      // 宿主菜单的 DOM（index bundle 里的 Ed 组件）：
      //
      //   <div data-menu-material="translucent" data-menu-phase="enter|dismiss">
      //     <div aria-hidden="true" class="…material">   ← 玻璃层：inset:0, z-index:-1,
      //     │                                              backdrop-filter 挂在这里
      //     <div role="menu" class="…list">              ← 内容层
      //       <div class="…itemWrap"><button role="menuitem">…</button></div>
      //
      // 关键约束（也是这次需求点名的那条）：宿主给 `[data-menu-phase] > *`
      // 统一加了 opacity 关键帧来做淡入淡出。opacity < 1 会让元素成为独立的
      // backdrop root，`backdrop-filter` 立刻改为采样这个 root 而不是页面背景，
      // 玻璃在整段动画期间都是死板的平色，动画结束才「啪」地出现折射。
      //
      // 所以这里把淡入淡出**拆到两层**上：
      //   · 玻璃层：完全不碰 opacity（显式钉死为 1），backdrop-filter 全程有效。
      //   · 内容层：保留宿主的淡入淡出（不覆盖），文字随之渐显。
      //   · 弹入弹出：用 2D transform: scale() 做，挂在玻璃层与内容层的共同父级
      //     （表面）上。2D transform 不创建 backdrop root，Chromium 下折射保持有效；
      //     不要改成 translateZ / preserve-3d，那会切进 3D 上下文并打断采样。
      //
      // 表面没有 data-menu-phase 的菜单（普通下拉，只有右键菜单才带相位）：
      // 元素插入即播放一次入场动画，用 :not([data-menu-phase]) 兜住。

      // 入场：有相位的右键菜单，以及插入即播的普通下拉。
      const MENU_ENTER = '[data-menu-material][data-menu-phase="enter"], [data-menu-material]:not([data-menu-phase])';

      const MENU_GLASS_CSS = `
      /* 菜单材质层：掏空宿主的实色底。
         边饰（border / outline / box-shadow）画在**表面**上——材质层是 inset:0
         的子元素，它的 outline 会被表面裁掉、看不见。 */
      [data-menu-material]:not([data-context-menu]) > [aria-hidden="true"]:first-child {
        box-sizing: border-box;
        background: color-mix(in srgb, var(--dsw-specific-menu) 26%, transparent) !important;
      }

      /* 右键菜单：玻璃直接挂在 surface 自身（带 data-shino-menu-surface）。
         材质层的滤镜和底色都不要再叠一层——surface 自己是 backdrop root，
         缩放动画挂在它身上不会截断它自己的滤镜。 */
      [data-context-menu][data-shino-menu-surface] {
        background: color-mix(in srgb, var(--dsw-specific-menu) 26%, transparent) !important;
      }

      [data-context-menu][data-shino-menu-surface] > [aria-hidden="true"]:first-child {
        background: transparent !important;
      }

      /* 夜间模式：菜单材质层调浅，暗色底上少压一层，背景图才能透上来。 */
      body[data-ds-dark-theme] [data-menu-material]:not([data-context-menu]) > [aria-hidden="true"]:first-child {
        background: color-mix(in srgb, var(--dsw-specific-menu) 18%, transparent) !important;
      }

      body[data-ds-dark-theme] [data-context-menu][data-shino-menu-surface] {
        background: color-mix(in srgb, var(--dsw-specific-menu) 18%, transparent) !important;
      }

      /* 玻璃层永不淡出：这一条是整段动画里最要紧的一行。
         context-menu 的玻璃在 surface 自身，材质层不参与。 */
      [data-menu-material]:not([data-context-menu])[data-menu-phase] > [aria-hidden="true"]:first-child {
        animation: none !important;
        opacity: 1 !important;
      }

      /* 输入触发器菜单（/ 与 @ 的候选菜单、以及工具栏 launcher 弹出的那个）
         渲染在 composer card 内部（宿主 MenuView 用 closest('[data-composer-card]')
         定位自己）。

         composer card 的滤镜被移到了它自己的 [data-shino-card-filter] 子层上
         （规则在 GLASS_CSS 里），该层与弹窗在 DOM 上互不包含，因此两者的
         backdrop-filter 互不截断——弹窗的折射正常，输入框的玻璃也还在。 */

      /* 弹入 / 弹出：从中间缩放，挂在表面（玻璃层与内容层的共同父级）上。
         不用 fill-mode: both —— 动画结束后残留的 transform 会让表面成为
         定位包含块，子元素的 anchor() 定位与 sticky 行为都会跟着变。

         关于 transform 与滤镜的关系：
         玻璃已经挂在 surface 自身，元素自身的 transform 不截断它自己的
         backdrop-filter；缩放与错位都是 surface 上的动画，菜单项又是玻璃层
         的侄辈（不参与玻璃层的采样祖先链），所以两段动画同时进行。
         用户看到的是玻璃表面一边缩放、内容一边逐条滑入。 */
      ${MENU_ENTER} {
        transform-origin: center;
        animation: shino-menu-pop-in 0.32s cubic-bezier(0.2, 1.25, 0.35, 1);
      }

      [data-menu-material][data-menu-phase="dismiss"] {
        transform-origin: center;
        animation: shino-menu-pop-out 0.14s ease-in;
      }

      @keyframes shino-menu-pop-in {
        from { transform: scale(0.92); }
        to { transform: scale(1); }
      }

      @keyframes shino-menu-pop-out {
        from { transform: scale(1); }
        to { transform: scale(0.94); }
      }

      /* 逐项错位：translateX(-10px) → 0 叠加淡入。
         时长 0.3s，相邻项重叠 0.2s → 步进 = 0.3 − 0.2 = 0.1s。
         序号由 paintGlass() 写入 --shino-menu-index。

         关于 opacity 与父级滤镜的关系（这里是需求点名要说明的地方）：
         backdrop-filter 的采样只受「它自己的祖先链」影响——祖先上出现
         opacity<1 / filter / mask 才会切断采样。菜单项是玻璃层的**侄辈**
         （玻璃层与内容层是兄弟），不是它的祖先，所以这里给菜单项加
         opacity 不会让父级的液态玻璃失效。把 opacity 加上去的是表面
         （玻璃层的父级）或玻璃层自身时才会坏，那两处已经分别被
         「不设 fill-mode」和「钉死 opacity: 1」挡掉了。

         用 backwards 而不是 both：backwards 在 delay 期间保持起始帧，
         避免先闪一下最终位置；而 forwards 会把 opacity: 1 / translateX(0)
         永久钉在元素上（动画级优先级会盖住宿主给禁用项的低透明度），
         结束帧本来就等于天然值，交还 CSS 更安全。

          父级缩放 (0.32s) 从这里同时开始：玻璃挂在 surface 自身，
          元素自身的 transform 不截断它自己的 backdrop-filter，
          所以两段动画同步进行、互不干扰——表面一边缩放，内容一边滑入。 */
      ${MENU_ENTER} [role="menuitem"] {
        animation: shino-menu-item-in 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
        animation-delay: calc(var(--shino-menu-index, 0) * 0.1s);
      }

      @keyframes shino-menu-item-in {
        from {
          transform: translateX(-10px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* 收起时不再逐项重播，避免和表面的缩放打架。 */
      [data-menu-material][data-menu-phase="dismiss"] [role="menuitem"] {
        animation: none !important;
      }

      /* 普通下拉（没有 data-menu-phase）宿主不给淡入淡出，这里补上。
         只作用于内容层，玻璃层仍然钉死 opacity: 1 —— 淡出会让
         backdrop-filter 失效，玻璃在动画期间会退成平色。 */
      [data-menu-material]:not([data-menu-phase]) > :nth-child(n + 2) {
        animation: shino-menu-fade-in 0.24s ease-out;
      }

      @keyframes shino-menu-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        ${MENU_ENTER},
        [data-menu-material][data-menu-phase="dismiss"],
        ${MENU_ENTER} [role="menuitem"] {
          animation: none !important;
        }
      }

      @media (prefers-reduced-transparency: reduce) {
        [data-menu-material] > [aria-hidden="true"]:first-child {
          background: var(--dsw-specific-menu) !important;
        }
      }
      `;

      /* ------------------------------------------------ 把玻璃挂到宿主元素上 */

      // 菜单的玻璃层：宿主在 [data-menu-material] 里放了一个 aria-hidden 的
      // 绝对定位层（inset:0, z-index:-1），原本只挂普通 blur。它尺寸可测、
      // 又正好铺满菜单表面，因此交给 makeGlass 换成带折射的液态玻璃。
      const MENU_GLASS_LAYER = '[data-menu-material]:not([data-context-menu]) > [aria-hidden="true"]:first-child';

      // 右键菜单（data-context-menu）专用：宿主把 data-context-menu 与
      // data-menu-material 挂在**同一个 surface 元素**上。
      //
      // 玻璃必须挂到 surface 自身、而不是它内部的材质层。原因：
      // 元素自身的 transform 动画不会截断它自己的 backdrop-filter，
      // 但会截断**后代**的。缩放动画挂在 surface 上，若玻璃在材质层（后代），
      // 缩放期间玻璃就失效；玻璃挂在 surface 自身，缩放全程折射都在。
      // 因此这类菜单直接玻璃化 surface，并把材质层的滤镜关掉。
      const CONTEXT_MENU_SURFACE = '[data-context-menu][data-menu-material]';

      /** 判断一个菜单目标是否应该把玻璃挂到 surface 本身。 */
      function isContextMenuSurface (el) {
        return el.hasAttribute('data-context-menu')
      }

      // 代码块：宿主只给 banner 打了 data-code-block-banner，外层是哈希类名。
      //
      // :has() 是向上匹配的，所以这条选择器会同时命中：代码块容器本身、
      // 包含它的消息节点、以及包住整条消息列的滚动容器。只靠选择器无法
      // 区分——代码块有两种形态（带 bannerWrap 的 sticky 变体与直接带
      // banner 的变体），层级不固定。
      //
      // 解决办法放在运行时：取候选里**最深的**那些（内部不再包含其它候选），
      // 它们才是代码块容器本身。祖先（消息节点、流容器）自然被排除。
      const CODE_BLOCK = 'div:has(> div > [data-code-block-banner])';

      /**
       * 从候选里挑出最深的元素（其内部不再包含其它候选）。
       * :has() 向上匹配会一并带出祖先，这里把它们剔掉。
       * @param candidates - 选择器命中的元素集合。
       * @returns 最深层的那些元素。
       */
      function deepestOnly (candidates) {
        const list = [...candidates]
        return list.filter(el => !list.some(other => other !== el && el.contains(other)))
      }

      // 右侧栏引导页（右侧「开始」入口页）的入口按钮。
      //
      // 关键：必须用 [data-sidebar-right-guide] 这个容器属性把范围限定在右侧栏内。
      // 之前用 button[class$="_entry"] 裸匹配，全仓库有三个模块的类名以 _entry 结尾：
      //   p2k40q_entry  右侧引导页（目标）
      //   w30fQq_entry  聊天上下文区（误伤！）
      //   -4GESq_entry  终端侧边栏（误伤）
      // 所以裸类名匹配会把聊天上下文一并玻璃化。
      // 容器限定后，只剩引导页自己的 entry 按钮。
      const GUIDE_ENTRY = [
        '[data-sidebar-right-guide] [data-sidebar-right-guide-entry]',
        '[data-sidebar-right-guide] button[class$="_entry"]',
        // 「更多」锚点与 entry 同基类，但类名以 _moreAnchor 收尾（class$="_entry" 匹配不到）。
        '[data-sidebar-right-guide] button[class*="_entry "][class$="_moreAnchor"]',
      ].join(', ');

      // 通用模态框面板。宿主用 [role="dialog"][aria-modal="true"] 统一标记
      // 设置面板、确认框等；菜单是 role="menu"，不会误伤。
      const MODAL_PANEL = '[role="dialog"][aria-modal="true"]';

      // 侧边栏「新会话」按钮。
      // 注意：不能用 aria-label 定位 —— 宿主里品牌标识按钮的 aria-label 同样是
      // t('session.new.label')，与「新会话」按钮共用同一句文案，用 aria-label
      // 会把 wtg9ga_brand / wtg9ga_wide 那圈品牌区一并命中（曾因此误加玻璃）。
      // 这里改用侧边栏自己的模块类名：wtg9ga_newSession 只出现在这一个按钮上。
      const NEW_SESSION_BUTTON = 'button[class*="_newSession"]';

      // 模型向用户提问的卡片（QuestionComposer 的 frame）。
      const QUESTION_CARD = '[data-question-key]';

      // 上下文里用户回答模型提问的那张卡（QuestionReplyView 的 row）。
      // 真正要玻璃化的是 row 里那张气泡：row > bubbleWidth > UserMessageBubble。
      // UserMessageBubble 自己没有 data 属性（只有 _bubble_<hash> 这类哈希类名），
      // 所以按 DOM 位置定位；row 的第二层是操作按钮行（时间、复制），不能要。
      const REPLY_BUBBLE = '[data-question-reply] > div > div';

      // 要玻璃化的宿主元素。都用宿主自己发布的稳定属性选择，不依赖哈希类名。
      // mark 是给无法直接用属性定位的目标补的标记，CSS 侧据此写透明化规则。
      const GLASS_TARGETS = [
        // 输入框卡片：滤镜不挂在它自己身上，而是挂在它的一个专用子层上
        // （见 paintGlass 里的 insertCardFilter）。原因是弹窗
        // （[data-trigger-menu]）渲染在卡片内部，而带 backdrop-filter 的元素
        // 本身就是 backdrop root，会截断弹窗的采样；把滤镜移到与弹窗并列的
        // 兄弟子层上，两者互不包含、互不影响。
        { selector: '[data-composer-card]', light: true, filterLayer: true },
        // 用户发送的消息气泡：只玻璃化气泡自身。
        // 它在聊天流内部、不包含整个流，所以不会被下面「包含聊天流则跳过」
        // 的判定拦下。
        { selector: '[data-message-bubble]', light: true },
        // 菜单：
        //   · 右键菜单（data-context-menu）玻璃挂 surface 自身，缩放期间滤镜不断
        //   · 其它菜单玻璃挂宿主自带的材质层（inset:0）
        // 两者都在这里列出，运行时按 isContextMenuSurface 决定挂哪一层。
        { selector: CONTEXT_MENU_SURFACE, light: false, menuSurface: true },
        { selector: MENU_GLASS_LAYER, light: false, menuLayer: true },
        // 产物文件卡片：present 工具在对话里铺出来的那一排，高度 60px。
        { selector: '[data-presented-file]', light: true },
        // 回复里的代码块。deepest：只取候选里最深的那些（代码块容器本身），
        // 把 :has() 向上匹配带出的祖先（消息节点、流容器）剔掉。
        { selector: CODE_BLOCK, light: true, mark: 'data-shino-code-block', deepest: true },
        // 模型向用户提问的卡片。
        { selector: QUESTION_CARD, light: true },
        // 上下文里用户回答提问的气泡。
        { selector: REPLY_BUBBLE, light: true },
        // 通用模态框：设置面板、确认框、图片查看器都走这套。
        // [aria-modal="true"] 把它和菜单、tooltip 区分开。
        { selector: MODAL_PANEL, light: true },
        // 右侧栏引导页（右侧「开始」入口页）的入口按钮。
        { selector: GUIDE_ENTRY, light: true, mark: 'data-shino-guide-entry' },
        // 侧边栏的「新会话」按钮。
        { selector: NEW_SESSION_BUTTON, light: true, mark: 'data-shino-new-session' },
      ];

      /**
       * 给菜单项写入错位动画的序号。宿主每次重新渲染都会重建这些节点，
       * 所以每次扫描都重算一遍；序号只影响 CSS 的 animation-delay。
       * @param surface - 一个 [data-menu-material] 表面。
       */
      function indexMenuItems(surface) {
        const items = surface.querySelectorAll('[role="menuitem"]');
        for (let i = 0; i < items.length; i += 1) {
          items[i].style.setProperty('--shino-menu-index', String(i));
        }
      }

      /**
       * 给匹配到的元素打标记并挂玻璃。幂等：已挂过的元素由 liquidglass 内部
       * 的 WeakMap 去重，这里只负责补属性。
       * @param root - 扫描起点，默认整个文档。
       */
      function paintGlass(root) {
        const scope = root && typeof root.querySelectorAll === 'function' ? root : document;

        // 菜单：与 GPU 偏好无关地打序号，玻璃层由宿主自己负责。
        for (const surface of scope.querySelectorAll('[data-menu-material]')) {
          indexMenuItems(surface);
        }

        // 清理早期版本误加在品牌区上的玻璃。
        // 上一版用 aria-label 找「新会话」，结果把同样带 session.new.label 的
        // 品牌标识按钮（wtg9ga_brand / wtg9ga_wide）也玻璃化了。
        // 这些元素可能还带着旧标记，扫描时一并摘掉，不必等重启。
        for (const el of scope.querySelectorAll('[data-shino-new-session][data-shino-glass]')) {
          const cls = typeof el.className === 'string' ? el.className : '';
          if (cls.includes('_newSession')) continue;
          stripGlass(el);
        }

        if (LG.LIQUID_GLASS_BLOCKED_BY_GPU_PREFERENCE) return;

        for (const target of GLASS_TARGETS) {
          const found = scope.querySelectorAll(target.selector);
          // deepest 目标只取候选里最深的那些：:has() 向上匹配会带出祖先，
          // 祖先是容器（消息节点、流容器），不是要玻璃化的表面。
          const nodes = target.deepest ? deepestOnly(found) : found;
          for (const el of nodes) {
            // 幂等判断：普通目标看自己的标记；filterLayer 目标看滤镜层是否已存在
            // （它的标记在滤镜层上，不在目标自身）。
            if (target.filterLayer === true) {
              if (el.querySelector(':scope > [data-shino-card-filter]') !== null) continue
            } else if (el.getAttribute('data-shino-glass') !== null) continue
            // 防止玻璃落到「整片聊天流」的容器上。
            //
            // 判定：元素若是聊天流的**祖先**（包含整个流），就不能玻璃化。
            // 用 closest 判断「元素在流的内部还是外部」——
            // 若元素自己就在流里面（closest 命中），它是流的内容（气泡、消息节点、
            // 代码块），保留；否则它包住了整个流，跳过。
            const flowSel = '[data-slot="conversation.chat.flow"], [data-chat-flow]';
            const insideFlow = el.closest(flowSel) !== null;
            if (!insideFlow && el.querySelector(flowSel) !== null) {
              // 这个元素包含整片聊天流 → 它是区域容器，不是具体表面，跳过。
              continue;
            }
            // 目标用的是语义属性时（如 :has() 反向定位的代码块），
            // 补一个自己的标记，CSS 才能精确地只改这一层。
            if (target.mark !== undefined) el.setAttribute(target.mark, '');

            // filterLayer 目标：滤镜不挂在目标自身，而是插一个专用子层。
            //
            // 为什么要这样：CSS 规范里，带 backdrop-filter 的元素**本身就是**
            // backdrop root，其后代滤镜只能采样它内部的内容。输入框卡片里
            // 渲染着弹窗（[data-trigger-menu]），若滤镜挂在卡片上，弹窗的折射
            // 就被截断；而要救弹窗又只能关掉卡片的滤镜——输入框的玻璃也没了。
            //
            // 把滤镜移到一个与弹窗**并列**的兄弟子层上（插为第一个子元素），
            // 两者互不包含：输入框仍有玻璃，弹窗也不受它的 backdrop root 影响。
            let glassHost = el
            if (target.filterLayer === true) {
              glassHost = insertFilterLayer(el)
              if (glassHost === null) continue
              // 卡片自身的标记：CSS 用它定位半透明底与边饰。
              el.setAttribute('data-shino-card', '')
              // 光晕与边饰归父层：滤镜层只负责滤镜本身。
              el.setAttribute('data-glass-light', '')
            } else if (target.menuSurface === true) {
              // 右键菜单：滤镜挂在 surface 自身（它就是带缩放动画的那一层）。
              // 元素自身的 transform 不截断它自己的 backdrop-filter，
              // 所以缩放全程玻璃都在。给 surface 打标记，CSS 据此关掉材质层的
              // 宿主滤镜，并把底色/边饰加到 surface 上。
              el.setAttribute('data-shino-menu-surface', '')
              // 材质层的宿主滤镜要关掉，避免两层 backdrop-filter 叠加。
              const mat = el.querySelector(':scope > [aria-hidden="true"]:first-child')
              if (mat !== null) {
                mat.style.setProperty('backdrop-filter', 'none', 'important')
                mat.style.setProperty('-webkit-backdrop-filter', 'none', 'important')
              }
            } else if (target.menuLayer === true) {
              // 普通菜单：玻璃挂在材质层；给 surface 打标记供 CSS 画边饰。
              if (el.parentElement !== null) el.parentElement.setAttribute('data-shino-menu-surface', '')
            } else {
              el.setAttribute('data-shino-glass', '')
            }

            glassHost.setAttribute('data-glass', '')
            // light 只给父层，滤镜层不参与光晕（它铺满卡片、几乎覆盖整个表面，
            // 光晕落在它上面会被卡片自身的半透明底吃掉）。
            if (target.light && target.filterLayer !== true) glassHost.setAttribute('data-glass-light', '')
            // 每个目标独立兜住异常。
            // makeGlass 需要 2D canvas 来生成位移图；一旦它抛错（例如画布不可用），
            // 若不加隔离，整个扫描循环会被打断，后面的目标全部得不到玻璃——
            // 表现为「输入框的玻璃莫名丢了」。
            try {
              LG.makeGlass(glassHost)
            } catch (error) {
              // 这个表面暂时做不了玻璃：撤掉标记，交给下一轮扫描重试。
              glassHost.removeAttribute('data-glass')
              glassHost.removeAttribute('data-glass-light')
              if (target.filterLayer === true) glassHost.remove()
            }
          }
        }

        protectMenuGlass();
      }

      /**
       * 在目标元素里插入一个专用的滤镜层，并把它作为第一个子元素。
       *
       * 第一个子元素的位置很重要：它保证滤镜层与随后的内容（尤其是渲染在
       * 卡片内部的弹窗）在 DOM 上是并列的兄弟，而不是彼此的祖先。
       *
       * @param host - 需要玻璃滤镜的目标元素。
       * @returns 滤镜层元素；已存在时直接返回。
       */
      function insertFilterLayer (host) {
        const existing = host.querySelector(':scope > [data-shino-card-filter]')
        if (existing !== null) return existing

        const layer = document.createElement('div')
        layer.setAttribute('data-shino-card-filter', '')
        host.insertBefore(layer, host.firstChild)
        return layer
      }

      /**
       * 摘掉一个元素上的全部玻璃痕迹（标记、inline 滤镜、滤镜子层）。
       * @param el - 要清理的元素。
       */
      function stripGlass(el) {
        el.removeAttribute('data-shino-glass');
        el.removeAttribute('data-glass');
        el.removeAttribute('data-glass-light');
        el.removeAttribute('data-shino-code-block');
        el.removeAttribute('data-shino-guide-entry');
        el.removeAttribute('data-shino-card');
        el.style.removeProperty('backdrop-filter');
        el.style.removeProperty('-webkit-backdrop-filter');
        // 摘掉输入框的滤镜层（它承载着滤镜与位移图）。
        const cardFilters = el.querySelectorAll(':scope > [data-shino-card-filter]');
        for (const f of cardFilters) f.remove();
      }
      /* ----------------------------------------------- 菜单玻璃的自愈保护 */
      /*
       * 为什么需要这一层：
       * CSS 规范里，任何带 backdrop-filter 的祖先都会成为「Backdrop Root」。
       *  descendants 的 backdrop-filter 只能采样该 root 内部的内容，采不到页面背景。
       * 菜单里的 _material_1w4el_21 正是这种情况：它自己带液态玻璃，
       * 若它的某个祖先（例如我们玻璃化的模态框面板）也带液态玻璃，
       * 折射就会失效——表现为「滤镜被父级覆盖掉了」。
       *
       * 做法（每轮扫描都跑，天然幂等）：
       *   1. 先把上一轮临时压掉的祖先滤镜恢复原值；
       *   2. 检查菜单玻璃层自身的 inline backdrop-filter 是否还在（含 url(#lg-)），
       *      丢失就清标记后重新 makeGlass；
       *   3. 若菜单层到 body 之间还有带 backdrop-filter 的祖先，临时压成 none，
       *      记下原值，下一轮恢复。菜单关闭后这些祖先会自动还原。
       */
      const suppressedBackdrop = new Map();
      function restoreSuppressedBackdrop() {
        for (const [el, original] of suppressedBackdrop) {
          if (original === undefined) {
            el.style.removeProperty('backdrop-filter');
            el.style.removeProperty('-webkit-backdrop-filter');
          } else {
            el.style.setProperty('backdrop-filter', original);
            el.style.setProperty('-webkit-backdrop-filter', original);
          }
        }
        suppressedBackdrop.clear();
      }
      function protectMenuGlass() {
        if (typeof document === 'undefined') return;
        restoreSuppressedBackdrop();
        const layers = document.querySelectorAll(MENU_GLASS_LAYER);
        for (const layer of layers) {
          // 1. 自身滤镜丢失 -> 重挂（可能上一轮 makeGlass 在元素还没有尺寸时跑过）
          if (layer.getAttribute('data-shino-glass') !== null) {
            const bf = layer.style.backdropFilter || '';
            if (bf.indexOf('url(#') === -1 && bf.indexOf('blur(') === -1) {
              layer.removeAttribute('data-shino-glass');
              // 与 paintGlass 同样逐个兜住异常，避免一次失败中断整轮保护。
              try {
                const glass = LG.makeGlass(layer);
                if (glass !== null && typeof glass.update === 'function') glass.update();
              } catch (error) {
                /* 画布不可用时保持无滤镜，下一轮再试。 */
              }
            }
          }
          // 2. 压掉祖先的 backdrop-filter，让菜单层成为采样页面背景的那一个
          //    注意：跳过我们自己玻璃化的目标（输入框、模态框…）。
          //    压制它们会让「菜单弹出后输入框的玻璃消失」——
          //    菜单与输入框共享过祖先链，压制祖先等于把输入框的滤镜一起关掉。
          let parent = layer.parentElement;
          while (parent !== null && parent !== document.body) {
            // 宿主自己的玻璃目标：它的滤镜必须保留，不能压制。
            // 输入框卡片用 data-shino-card 标记（滤镜在它的滤镜层上）；
            // 其它玻璃表面（含父菜单的玻璃层/表面）用 data-shino-glass /
            // data-shino-menu-surface 标记，滤镜本体由 liquidglass 打 data-glass。
            //
            // 子菜单弹出时，父菜单就在祖先链上。若这里把父菜单的滤镜压成 none，
            // 父菜单的玻璃就没了——必须全部跳过。
            if (parent.getAttribute('data-shino-glass') !== null
              || parent.getAttribute('data-shino-card') !== null
              || parent.getAttribute('data-shino-menu-surface') !== null
              || parent.getAttribute('data-glass') !== null) {
              parent = parent.parentElement;
              continue;
            }
            // 更进一步：不要跨出「另一个菜单表面」继续往上压制。
            // 子菜单的祖先里若已经有一个 data-menu-material，那是父菜单，
            // 它的整条链都应当保持原样。
            if (parent.getAttribute('data-menu-material') !== null) {
              parent = parent.parentElement;
              continue;
            }
            let filter = '';
            try { filter = window.getComputedStyle(parent).backdropFilter || ''; } catch (e) { filter = ''; }
            if (filter !== '' && filter !== 'none') {
              if (!suppressedBackdrop.has(parent)) {
                suppressedBackdrop.set(parent, parent.style.backdropFilter || undefined);
              }
              parent.style.setProperty('backdrop-filter', 'none', 'important');
              parent.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            }
            parent = parent.parentElement;
          }
        }
      }

      /* ------------------------------------------------------------ 文案 */

      const NS = 'shinoinject';
      const DICT = {
        zh: {
          'state.running': '生成中',
          'state.waiting': '等待你确认',
          'state.done': '有新结果',
          'state.idle': '空闲',
          'meta.draft': '草稿 {n} 字',
          'title': 'shinoinject：当前会话状态',
        },
        en: {
          'state.running': 'Working',
          'state.waiting': 'Needs your answer',
          'state.done': 'New result',
          'state.idle': 'Idle',
          'meta.draft': '{n} draft chars',
          'title': 'shinoinject: session status',
        },
      };

      /** 兜底翻译：locale 席位缺席时也能显示，不让整条崩溃。 */
      function fallback(lang, key, params) {
        const table = DICT[lang] ?? DICT.en;
        const template = table[key] ?? DICT.en[key] ?? key;
        if (!params) return template;
        return template.replace(/\{(\w+)\}/g, (match, name) =>
          name in params ? String(params[name]) : match);
      }

      /* ------------------------------------------------------ 透明外壳 token */

      // 一个 token 覆盖四处表面：AppFrame 的 .frame（Windows 标题带）与
      // .sidebarCol，以及 SidebarRoot 的 .root。值为 transparent，
      // 所以深浅两套写成一样也不会失真。
      const CHROME_BACKGROUND_OVERRIDES = {
        '--dsw-specific-sidebar-fill': { light: 'transparent', dark: 'transparent' },
      };

      /* ---------------------------------------------------------------- 状态条 */

      // 行高与最小高度取自宿主的 secondary 内容字号变量，
      // 这样用户调大字号时状态条与相邻的 ContextMeter 一起放大。
      const STRIP_CSS = `
      .shino-strip {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: calc(22px + var(--dsh-content-font-delta-secondary, 0px));
        padding: 0 2px;
        font-size: var(--dsh-content-font-size-secondary, 13px);
        line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
        font-variant-numeric: tabular-nums;
        color: var(--dsw-alias-label-secondary);
        user-select: none;
      }
      .shino-strip__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex: none;
        background: var(--dsw-alias-border-l2);
      }
      .shino-strip__dot[data-state='running'] {
        background: var(--dsw-alias-state-success-primary);
        animation: shino-strip-pulse 1.6s ease-in-out infinite;
      }
      .shino-strip__dot[data-state='waiting'] {
        background: var(--dsw-alias-state-warn-primary);
      }
      .shino-strip__dot[data-state='done'] {
        background: var(--dsw-alias-brand-primary);
      }
      .shino-strip__label {
        color: var(--dsw-alias-label-secondary);
      }
      .shino-strip__label[data-state='waiting'],
      .shino-strip__label[data-state='done'] {
        color: var(--dsw-alias-label-primary);
      }
      .shino-strip__sep {
        width: 1px;
        height: 9px;
        background: var(--dsw-alias-border-l1);
        flex: none;
      }
      .shino-strip[data-state='idle'] {
        opacity: 0.75;
      }
      @keyframes shino-strip-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      @media (prefers-reduced-motion: reduce) {
        .shino-strip__dot[data-state='running'] { animation: none; }
      }
      `;

      /** 组件内联样式表：随组件一起卸载，不留全局残留。 */
      function StyleTags() {
        const React = require('react');
        const h = React.createElement;
        return h(React.Fragment, null,
          h('style', { 'data-shinoinject': 'glass' }, GLASS_CSS),
          h('style', { 'data-shinoinject': 'menu' }, MENU_GLASS_CSS),
          h('style', { 'data-shinoinject': 'strip' }, STRIP_CSS));
      }

      function ShinoStrip(props) {
        const React = require('react');
        const h = React.createElement;
        const { sessionId, useSession, useSessionStatus, useInput, t } = props;
        const tr = (typeof t === 'function') ? t : (key, params) => fallback('en', key, params);

        // 首帧 store 可能尚未就绪，所有读取都按「缺省即无事发生」处理，
        // 避免一次瞬时 undefined 让整个槽位条目被弃用。
        const running = useSession(s => s?.running === true);
        const status = useSessionStatus(snapshot =>
          sessionId === undefined || snapshot === undefined ? undefined : snapshot.get(sessionId));
        const pending = status?.pendingInteraction;
        const unread = status?.completionUnread === true;
        const draftLength = useInput(s => (s !== undefined && typeof s.draft === 'string' ? s.draft.length : 0));

        // 优先级：等待用户确认 > 生成中 > 有新结果 > 空闲。
        const state = pending !== undefined
          ? 'waiting'
          : running
            ? 'running'
            : unread
              ? 'done'
              : 'idle';

        const label = tr(`state.${state}`, undefined);
        const showDraft = draftLength > 0 && state !== 'running';

        // 只有状态文字进入 live region：草稿字数随每次按键变化。
        const children = [
          h('span', { className: 'shino-strip__dot', 'data-state': state, 'aria-hidden': true }),
          h('span', {
            className: 'shino-strip__label',
            'data-state': state,
            role: 'status',
            'aria-live': 'polite',
            'aria-atomic': true,
          }, label),
        ];
        if (showDraft) {
          children.push(h('span', { className: 'shino-strip__sep', 'aria-hidden': true }));
          children.push(h('span', { className: 'shino-strip__meta' }, tr('meta.draft', { n: draftLength })));
        }

        return h('div', {
          className: 'shino-strip',
          'data-state': state,
          title: tr('title', undefined),
        }, ...children);
      }

      /**
       * 挂玻璃的驱动组件：坐在输入框下方的槽位里，每次 commit 后用
       * useLayoutEffect 补齐新冒出来的气泡；再挂一个 MutationObserver 兜住
       * 「历史分页加载完、但本组件没有重渲染」的空窗。
       */
      function GlassDriver() {
        const React = require('react');
        const h = React.createElement;

        React.useLayoutEffect(() => {
          paintGlass(document);
          LG.installGlassJelly();
          LG.installGlassLight();

          if (typeof MutationObserver === 'undefined') return undefined;
          let queued = false;
          const schedule = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
              queued = false;
              paintGlass(document);
            });
          };
          const observer = new MutationObserver(schedule);
          observer.observe(document.body, { childList: true, subtree: true });
          return () => {
            observer.disconnect();
          };
        }, []);

        return h(StyleTags);
      }

      /* ---------------------------------------------------------------- 注册 */

      return {
        inject: ['slots'],
        apply(ctx) {
          const locale = ctx.get('locale');
          const theme = ctx.get('theme');

          // 侧边栏 / 顶部标题栏透明：只叠一层 token override，
          // 卸载时 disposer 移除该层，宿主主题不被改动。
          if (theme !== undefined && typeof theme.overrideTokens === 'function') {
            ctx.effect(
              () => theme.overrideTokens('shinoinject-chrome', CHROME_BACKGROUND_OVERRIDES),
              'shinoinject-chrome-transparent',
            );
          }

          // 一次注册两种语言；重复注册（热重载、重复挂载）时会抛重复错误，
          // 此时保留已有字典即可，不影响渲染。
          if (locale !== undefined && typeof locale.register === 'function') {
            try {
              ctx.effect(() => locale.register(NS, DICT), 'shinoinject-locale');
            } catch {
              /* 已有同 ns/locale 的字典，继续。 */
            }
          }

          // 玻璃驱动挂在 shell.overlay：root 作用域、全框架常驻。
          // 不能挂在 conversation.composer.dock 上 —— 那是 session 作用域，
          // 切到新会话 / 插件页 / 自动化任务页时会话槽位整体卸载，
          // 驱动随之消失，玻璃就不再扫描新页面（切换后立即失效的原因）。
          ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
            name: 'shell.overlay',
            id: 'shinoinject-glass-driver',
            order: 900,
          }, () => {
            const React = require('react');
            return React.createElement(GlassDriver);
          })), 'shinoinject-glass-driver');

          // 会话状态条仍然留在输入框下方（会话槽位）。
          // 注册时声明命名空间，宿主把 `t` 席位合成到 props 上，
          // 语言切换时随 outlet 一起重绘，不用自己订阅 locale/change。
          ctx.effect(() => ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
            name: 'conversation.composer.dock',
            id: 'shinoinject-strip',
            order: 20,
            locale: NS,
          }, props => {
            const React = require('react');
            const h = React.createElement;
            return h(ShinoStrip, props);
          })), 'shinoinject-dock-strip');
        },
      };
  },
});
