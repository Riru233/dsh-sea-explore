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
