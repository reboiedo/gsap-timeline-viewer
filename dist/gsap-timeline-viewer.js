var M = Object.defineProperty;
var A = (o, i, t) => i in o ? M(o, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[i] = t;
var l = (o, i, t) => A(o, typeof i != "symbol" ? i + "" : i, t);
let B = 0;
function x(o) {
  if (!o || o.length === 0) return "Unknown";
  const i = o[0];
  return i.id ? `#${i.id}` : i.classList && i.classList.length > 0 ? `.${i.classList[0]}` : i.tagName ? i.tagName.toLowerCase() : "element";
}
function E(o) {
  const i = [
    "ease",
    "duration",
    "delay",
    "onComplete",
    "onStart",
    "onUpdate",
    "onCompleteParams",
    "onStartParams",
    "onUpdateParams",
    "repeat",
    "repeatDelay",
    "yoyo",
    "stagger",
    "overwrite",
    "immediateRender",
    "lazy",
    "autoAlpha",
    "id",
    "paused",
    "reversed",
    "startAt"
  ];
  return Object.keys(o).filter((t) => !i.includes(t));
}
function H(o) {
  const i = [];
  o.getChildren(!0, !0, !1).forEach((e, s) => {
    if (!("targets" in e)) return;
    const a = e, r = a.targets(), n = a.vars || {}, g = E(n);
    let v = "";
    if (n.id && typeof n.id == "string")
      v = n.id;
    else {
      const b = x(r), y = g.slice(0, 2).join(", ");
      v = y ? `${b} (${y})` : b;
    }
    const h = e.startTime(), d = e.duration();
    let m = "none";
    n.ease && (m = typeof n.ease == "string" ? n.ease : "custom");
    let u, T;
    if (n.stagger && r.length > 1 && (typeof n.stagger == "number" ? u = n.stagger : typeof n.stagger == "object" && (u = n.stagger.each || 0), u)) {
      const b = d - u * (r.length - 1);
      T = r.map((y, D) => {
        const z = h + D * u;
        return {
          targetLabel: x([y]),
          startTime: z,
          endTime: z + b
        };
      });
    }
    i.push({
      id: `tween-${++B}`,
      label: v,
      startTime: h,
      endTime: h + d,
      duration: d,
      targets: x(r),
      properties: g,
      colorIndex: s % 6,
      hasStagger: !!n.stagger,
      ease: m,
      staggerValue: u,
      staggerChildren: T
    });
  });
  for (let e = 1; e < i.length; e++) {
    const s = i[e - 1], a = i[e], r = s.endTime - a.startTime;
    Math.abs(r) > 1e-3 && (a.overlapWithPrev = Math.round(r * 1e3) / 1e3);
  }
  return {
    duration: o.duration(),
    tweens: i
  };
}
function q() {
  B = 0;
}
function f(o, i = !0) {
  const t = Math.abs(o);
  return i ? t.toFixed(2) : t.toFixed(0);
}
const I = ":host{--gtv-bg: #1a1a1a;--gtv-bg-secondary: #252525;--gtv-border: #333;--gtv-text: #e0e0e0;--gtv-text-muted: #888;--gtv-accent: oklch(65% .15 220);--gtv-playhead: oklch(65% .15 220);--gtv-ruler-bg: #1f1f1f;--gtv-track-height: 28px;--gtv-controls-height: 40px;--gtv-ruler-height: 24px;--gtv-timeline-padding: 16px;--gtv-track-1: oklch(50% .12 220);--gtv-track-1-active: oklch(60% .15 220);--gtv-track-2: oklch(50% .12 70);--gtv-track-2-active: oklch(60% .15 70);--gtv-track-3: oklch(50% .12 350);--gtv-track-3-active: oklch(60% .15 350);--gtv-track-4: oklch(50% .12 160);--gtv-track-4-active: oklch(60% .15 160);--gtv-track-5: oklch(50% .12 290);--gtv-track-5-active: oklch(60% .15 290);--gtv-track-6: oklch(50% .12 25);--gtv-track-6-active: oklch(60% .15 25)}*{box-sizing:border-box;margin:0;padding:0}.gtv-container{position:fixed;bottom:0;left:0;right:0;background:var(--gtv-bg);border-top:1px solid var(--gtv-border);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:12px;color:var(--gtv-text);z-index:999999;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none}.gtv-container.collapsed{height:auto!important}.gtv-container.collapsed .gtv-timeline-area{display:none}.gtv-controls{position:relative;display:flex;align-items:center;justify-content:center;height:var(--gtv-controls-height);padding:0 12px;background:var(--gtv-bg-secondary);border-bottom:1px solid var(--gtv-border);gap:8px}.gtv-controls-left{position:absolute;left:12px;display:flex;align-items:center;gap:8px}.gtv-controls-center{display:flex;align-items:center;gap:8px}.gtv-controls-right{position:absolute;right:12px;display:flex;align-items:center;gap:8px}.gtv-time-display{font-variant-numeric:tabular-nums;min-width:100px;text-align:center}.gtv-time-current{color:var(--gtv-text)}.gtv-time-total{color:var(--gtv-text-muted)}.gtv-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:transparent;border:none;border-radius:4px;color:var(--gtv-text);cursor:pointer;transition:background .15s}.gtv-btn:hover{background:#ffffff1a}.gtv-btn:active{background:#ffffff26}.gtv-btn.active{color:var(--gtv-accent)}.gtv-btn svg{width:16px;height:16px;fill:currentColor}.gtv-btn-play svg{width:20px;height:20px}.gtv-speed-btn{width:auto;padding:0 8px;font-size:11px;font-weight:500}.gtv-timeline-select{background:var(--gtv-bg);border:1px solid var(--gtv-border);border-radius:4px;color:var(--gtv-text);font-size:11px;padding:4px 8px;cursor:pointer;max-width:140px}.gtv-timeline-select:focus{outline:none;border-color:var(--gtv-accent)}.gtv-collapse-btn{margin-left:auto}.gtv-timeline-area{position:relative;display:flex;flex-direction:column;overflow:hidden;flex:1}.gtv-resize-handle{position:absolute;top:0;left:0;right:0;height:6px;cursor:ns-resize;z-index:20}.gtv-resize-handle:hover,.gtv-resize-handle:active{background:#ffffff1a}.gtv-ruler{position:relative;height:var(--gtv-ruler-height);background:var(--gtv-ruler-bg);border-bottom:1px solid var(--gtv-border);overflow:visible;flex-shrink:0;padding:0 var(--gtv-timeline-padding)}.gtv-ruler-inner{position:relative;height:100%;width:100%}.gtv-ruler-marker{position:absolute;top:0;display:flex;flex-direction:column;align-items:center}.gtv-ruler-marker-line{width:1px;height:6px;background:var(--gtv-text-muted)}.gtv-ruler-marker-label{font-size:10px;color:var(--gtv-text-muted);margin-top:2px}.gtv-grid-line{position:absolute;top:0;width:1px;height:100%;background:var(--gtv-border);pointer-events:none}.gtv-tracks-container{position:relative;overflow-y:auto;overflow-x:hidden;flex:1;padding:0 var(--gtv-timeline-padding)}.gtv-tracks-scroll{position:relative;min-height:100%;width:100%}.gtv-track{position:relative;padding-top:var(--gtv-track-height)}.gtv-track-bar{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);border-radius:4px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 8px;font-size:11px;font-weight:500;color:#fff;overflow:hidden;cursor:default;transition:filter .15s}.gtv-track-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}.gtv-track-stagger{opacity:.7;font-size:10px;font-weight:400;flex-shrink:0}.gtv-track-bar:hover{filter:brightness(1.1)}.gtv-playhead-wrapper{position:absolute;top:0;bottom:0;left:var(--gtv-timeline-padding);right:var(--gtv-timeline-padding);pointer-events:none;z-index:15}.gtv-playhead{position:absolute;top:0;bottom:0;width:0;left:0}.gtv-playhead-head{position:absolute;top:6px;left:-5px;width:11px;height:11px;background:var(--gtv-playhead);clip-path:polygon(50% 100%,0 0,100% 0)}.gtv-playhead-line{position:absolute;top:6px;bottom:0;left:0;width:1px;background:var(--gtv-playhead)}.gtv-scrub-area{position:absolute;top:0;left:0;right:0;bottom:0;cursor:ew-resize}.gtv-track[data-expandable=true] .gtv-track-bar{cursor:pointer}.gtv-expand-icon{transition:transform .2s}.gtv-track.expanded .gtv-expand-icon{transform:rotate(180deg)}.gtv-stagger-children{display:none;position:relative;width:100%}.gtv-track.expanded .gtv-stagger-children{display:block}.gtv-stagger-child{position:relative;width:100%;height:calc(var(--gtv-track-height) - 6px)}.gtv-stagger-child-bar{position:absolute;top:2px;height:calc(var(--gtv-track-height) - 12px);border-radius:3px;display:flex;align-items:center;padding:0 6px;font-size:10px;color:#fff;opacity:.7;overflow:hidden}.gtv-stagger-child-bar .gtv-track-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gtv-overlap-region{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);background:repeating-linear-gradient(-45deg,transparent,transparent 2px,rgba(255,255,255,.15) 2px,rgba(255,255,255,.15) 4px);border-radius:4px;pointer-events:none;z-index:5}.gtv-gap-connector{position:absolute;top:50%;height:1px;border-top:1px dashed var(--gtv-text-muted);pointer-events:none}.gtv-offset-badge{position:absolute;top:50%;transform:translate(-100%,-50%);margin-left:-4px;font-size:9px;font-weight:500;padding:2px 5px;border-radius:3px;white-space:nowrap;pointer-events:none;z-index:10}.gtv-offset-overlap,.gtv-offset-gap{background:var(--gtv-bg-secondary);border:1px solid var(--gtv-border);color:var(--gtv-text-muted)}.gtv-empty{display:flex;align-items:center;justify-content:center;padding:24px;color:var(--gtv-text-muted)}", P = [0.25, 0.5, 1, 2, 4], L = 40;
class C extends HTMLElement {
  constructor() {
    super();
    l(this, "shadow");
    l(this, "timeline", null);
    l(this, "timelineData", null);
    l(this, "isPlaying", !1);
    l(this, "isLooping", !1);
    l(this, "speedIndex", 2);
    // 1x
    l(this, "collapsed", !1);
    l(this, "height", 200);
    l(this, "isDragging", !1);
    l(this, "manageBodyPadding", !0);
    l(this, "isAutofit", !1);
    // DOM references
    l(this, "container");
    l(this, "playBtn");
    l(this, "loopBtn");
    l(this, "speedBtn");
    l(this, "timeDisplay");
    l(this, "rulerInner");
    l(this, "tracksScroll");
    l(this, "playhead");
    l(this, "scrubArea");
    l(this, "resizeHandle");
    l(this, "timelineSelect");
    l(this, "isResizing", !1);
    this.shadow = this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render(), this.setupEventListeners(), this.updateBodyPadding();
  }
  disconnectedCallback() {
    this.detachTimeline(), this.clearBodyPadding();
  }
  setTimeline(t) {
    this.detachTimeline(), this.timeline = t, q(), this.timelineData = H(t), t.eventCallback("onUpdate", () => this.onTimelineUpdate()), this.renderTracks(), this.updatePlayhead(), this.updateTimeDisplay(), this.updatePlayState(), requestAnimationFrame(() => this.applyAutofit());
  }
  updateTimelineSelector() {
    Promise.resolve().then(() => $).then(({ TimelineViewer: t }) => {
      const e = t.getTimelines(), s = this.timelineSelect.value;
      this.timelineSelect.innerHTML = "", e.forEach((a, r) => {
        const n = document.createElement("option");
        n.value = r, n.textContent = r, this.timelineSelect.appendChild(n);
      }), s && e.has(s) && (this.timelineSelect.value = s);
    });
  }
  setSelectedTimeline(t) {
    this.timelineSelect.value = t;
  }
  detachTimeline() {
    this.timeline && (this.timeline.eventCallback("onUpdate", null), this.timeline = null, this.timelineData = null);
  }
  render() {
    this.shadow.innerHTML = `
      <style>${I}</style>
      <div class="gtv-container ${this.collapsed ? "collapsed" : ""}" style="height: ${this.height}px;">
        <!-- Controls Bar -->
        <div class="gtv-controls">
          <div class="gtv-controls-left">
            <select class="gtv-timeline-select" title="Select timeline">
              <option value="">No timeline</option>
            </select>
            <button class="gtv-btn" data-action="loop" title="Loop (L)">
              <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
            </button>
            <button class="gtv-btn gtv-speed-btn" data-action="speed" title="Playback speed">1x</button>
          </div>

          <div class="gtv-controls-center">
            <span class="gtv-time-display">
              <span class="gtv-time-current">0.00</span>
              <span class="gtv-time-total"> / 0.00</span>
            </span>
            <button class="gtv-btn" data-action="skip-start" title="Skip to start">
              <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>
            </button>
            <button class="gtv-btn gtv-btn-play" data-action="play" title="Play/Pause (Space)">
              <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="gtv-btn" data-action="skip-end" title="Skip to end">
              <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2 0V6l6.5 6L8 18zm8-12v12h2V6h-2z"/></svg>
            </button>
          </div>

          <div class="gtv-controls-right">
            <button class="gtv-btn" data-action="autofit" title="Auto-fit height">
              <svg viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
            </button>
            <button class="gtv-btn gtv-collapse-btn" data-action="collapse" title="Collapse/Expand">
              <svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
            </button>
          </div>
        </div>

        <!-- Timeline Area -->
        <div class="gtv-timeline-area">
          <!-- Resize Handle -->
          <div class="gtv-resize-handle"></div>

          <!-- Ruler -->
          <div class="gtv-ruler">
            <div class="gtv-ruler-inner"></div>
          </div>

          <!-- Tracks -->
          <div class="gtv-tracks-container">
            <div class="gtv-tracks-scroll">
              <div class="gtv-scrub-area"></div>
            </div>
            <div class="gtv-empty">No timeline attached. Call setTimeline() to visualize a GSAP timeline.</div>
          </div>

          <!-- Playhead spans entire timeline area -->
          <div class="gtv-playhead-wrapper">
            <div class="gtv-playhead">
              <div class="gtv-playhead-head"></div>
              <div class="gtv-playhead-line"></div>
            </div>
          </div>
        </div>
      </div>
    `, this.container = this.shadow.querySelector(".gtv-container"), this.playBtn = this.shadow.querySelector('[data-action="play"]'), this.loopBtn = this.shadow.querySelector('[data-action="loop"]'), this.speedBtn = this.shadow.querySelector('[data-action="speed"]'), this.timeDisplay = this.shadow.querySelector(".gtv-time-display"), this.rulerInner = this.shadow.querySelector(".gtv-ruler-inner"), this.tracksScroll = this.shadow.querySelector(".gtv-tracks-scroll"), this.playhead = this.shadow.querySelector(".gtv-playhead"), this.scrubArea = this.shadow.querySelector(".gtv-scrub-area"), this.resizeHandle = this.shadow.querySelector(".gtv-resize-handle"), this.timelineSelect = this.shadow.querySelector(".gtv-timeline-select");
  }
  setupEventListeners() {
    this.shadow.addEventListener("click", (t) => {
      const s = t.target.closest("[data-action]");
      if (!s) return;
      switch (s.dataset.action) {
        case "play":
          this.togglePlay();
          break;
        case "skip-start":
          this.skipToStart();
          break;
        case "skip-end":
          this.skipToEnd();
          break;
        case "loop":
          this.toggleLoop();
          break;
        case "speed":
          this.cycleSpeed();
          break;
        case "collapse":
          this.toggleCollapse();
          break;
        case "autofit":
          this.toggleAutofit();
          break;
      }
    }), this.timelineSelect.addEventListener("change", () => {
      const t = this.timelineSelect.value;
      t && Promise.resolve().then(() => $).then(({ TimelineViewer: e }) => {
        var s;
        (s = e.getInstance()) == null || s.select(t);
      });
    }), this.shadow.addEventListener("click", (t) => {
      const s = t.target.closest(".gtv-track-bar");
      if (s) {
        const a = s.closest(".gtv-track");
        (a == null ? void 0 : a.dataset.expandable) === "true" && (t.stopPropagation(), a.classList.toggle("expanded"), requestAnimationFrame(() => this.applyAutofit()));
      }
    }), this.scrubArea.addEventListener("mousedown", (t) => this.startScrub(t)), this.shadow.querySelector(".gtv-ruler").addEventListener("mousedown", (t) => this.startScrub(t)), this.shadow.querySelector(".gtv-tracks-container").addEventListener("mousedown", (t) => {
      t.target.closest(".gtv-track-bar") || this.startScrub(t);
    }), document.addEventListener("mousemove", (t) => {
      this.onScrub(t), this.onResize(t);
    }), document.addEventListener("mouseup", () => {
      this.endScrub(), this.endResize();
    }), this.resizeHandle.addEventListener("mousedown", (t) => this.startResize(t)), document.addEventListener("keydown", (t) => {
      if (t.target === document.body)
        switch (t.code) {
          case "Space":
            t.preventDefault(), this.togglePlay();
            break;
          case "KeyJ":
            t.preventDefault(), this.jumpToPrevPoint();
            break;
          case "KeyK":
            t.preventDefault(), this.jumpToNextPoint();
            break;
          case "KeyL":
            t.preventDefault(), this.toggleLoop();
            break;
        }
    });
  }
  startScrub(t) {
    this.timeline && (t.preventDefault(), this.isDragging = !0, document.body.style.cursor = "ew-resize", document.body.style.userSelect = "none", this.scrubToPosition(t));
  }
  onScrub(t) {
    !this.isDragging || !this.timeline || this.scrubToPosition(t);
  }
  endScrub() {
    this.isDragging = !1, document.body.style.cursor = "", document.body.style.userSelect = "";
  }
  startResize(t) {
    t.preventDefault(), this.isResizing = !0, document.body.style.cursor = "ns-resize", document.body.style.userSelect = "none";
  }
  onResize(t) {
    if (!this.isResizing) return;
    const e = window.innerHeight, s = e - t.clientY;
    this.height = Math.max(100, Math.min(s, e - 100)), this.container.style.height = `${this.height}px`, this.updateBodyPadding();
  }
  endResize() {
    this.isResizing && (this.isResizing = !1, document.body.style.cursor = "", document.body.style.userSelect = "");
  }
  updateBodyPadding() {
    if (!this.manageBodyPadding) return;
    const t = this.collapsed ? L : this.height;
    document.body.style.paddingBottom = `${t}px`;
  }
  clearBodyPadding() {
    this.manageBodyPadding && (document.body.style.paddingBottom = "");
  }
  scrubToPosition(t) {
    if (!this.timeline || !this.timelineData) return;
    const e = this.rulerInner.getBoundingClientRect(), a = Math.max(0, Math.min(t.clientX - e.left, e.width)) / e.width;
    this.timeline.progress(a), this.timeline.pause(), this.updatePlayState();
  }
  togglePlay() {
    this.timeline && (this.timeline.paused() || this.timeline.progress() === 1 ? this.timeline.progress() === 1 ? this.timeline.restart() : this.timeline.play() : this.timeline.pause(), this.updatePlayState());
  }
  skipToStart() {
    this.timeline && (this.timeline.progress(0), this.timeline.pause(), this.updatePlayState());
  }
  skipToEnd() {
    this.timeline && (this.timeline.progress(1), this.timeline.pause(), this.updatePlayState());
  }
  getTimePoints() {
    if (!this.timelineData) return [0];
    const t = /* @__PURE__ */ new Set();
    return t.add(0), t.add(Math.round(this.timelineData.duration * 1e3) / 1e3), this.timelineData.tweens.forEach((e) => {
      t.add(Math.round(e.startTime * 1e3) / 1e3), t.add(Math.round(e.endTime * 1e3) / 1e3);
    }), Array.from(t).sort((e, s) => e - s);
  }
  jumpToPrevPoint() {
    if (!this.timeline || !this.timelineData) return;
    const t = Math.round(this.timeline.time() * 1e3) / 1e3, e = this.getTimePoints();
    let s = 0;
    for (const a of e)
      if (a < t - 1e-3)
        s = a;
      else
        break;
    this.timeline.time(s), this.timeline.pause(), this.updatePlayState();
  }
  jumpToNextPoint() {
    if (!this.timeline || !this.timelineData) return;
    const t = Math.round(this.timeline.time() * 1e3) / 1e3, e = this.getTimePoints();
    let s = this.timelineData.duration;
    for (const a of e)
      if (a > t + 1e-3) {
        s = a;
        break;
      }
    this.timeline.time(s), this.timeline.pause(), this.updatePlayState();
  }
  toggleLoop() {
    this.timeline && (this.isLooping = !this.isLooping, this.timeline.repeat(this.isLooping ? -1 : 0), this.loopBtn.classList.toggle("active", this.isLooping));
  }
  cycleSpeed() {
    if (!this.timeline) return;
    this.speedIndex = (this.speedIndex + 1) % P.length;
    const t = P[this.speedIndex];
    this.timeline.timeScale(t), this.speedBtn.textContent = `${t}x`;
  }
  toggleCollapse() {
    this.collapsed = !this.collapsed, this.container.classList.toggle("collapsed", this.collapsed);
    const t = this.shadow.querySelector('[data-action="collapse"]');
    t.innerHTML = this.collapsed ? '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>', this.updateBodyPadding();
  }
  toggleAutofit() {
    this.isAutofit = !this.isAutofit, this.shadow.querySelector('[data-action="autofit"]').classList.toggle("active", this.isAutofit), this.isAutofit && this.applyAutofit();
  }
  applyAutofit() {
    if (!this.isAutofit || this.collapsed) return;
    const t = this.shadow.querySelectorAll(".gtv-track");
    let e = 0;
    const s = 28, a = 22;
    t.forEach((h) => {
      if (e += s, h.classList.contains("expanded")) {
        const d = h.querySelectorAll(".gtv-stagger-child");
        e += d.length * a;
      }
    });
    const r = 24, n = 16, g = 100, v = window.innerHeight - 100;
    this.height = Math.max(g, Math.min(L + r + e + n, v)), this.container.style.height = `${this.height}px`, this.updateBodyPadding();
  }
  updatePlayState() {
    if (!this.timeline) return;
    this.isPlaying = !this.timeline.paused() && this.timeline.progress() < 1;
    const t = this.playBtn.querySelector(".play-icon"), e = this.playBtn.querySelector(".pause-icon");
    t.style.display = this.isPlaying ? "none" : "block", e.style.display = this.isPlaying ? "block" : "none";
  }
  onTimelineUpdate() {
    this.updatePlayhead(), this.updateTimeDisplay(), this.updateActiveTracks(), this.updatePlayState();
  }
  updatePlayhead() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.progress();
    this.playhead.style.left = `${t * 100}%`;
  }
  updateTimeDisplay() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.time(), e = this.timelineData.duration, s = this.timeDisplay.querySelector(".gtv-time-current"), a = this.timeDisplay.querySelector(".gtv-time-total");
    s.textContent = f(t), a.textContent = ` / ${f(e)}`;
  }
  updateActiveTracks() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.time();
    this.tracksScroll.querySelectorAll(".gtv-track-bar").forEach((s, a) => {
      const r = this.timelineData.tweens[a], n = t >= r.startTime && t <= r.endTime, g = s.dataset.color;
      n ? s.style.background = `var(--gtv-track-${g}-active)` : s.style.background = `var(--gtv-track-${g})`;
    });
  }
  renderTracks() {
    if (!this.timelineData) return;
    const { duration: t, tweens: e } = this.timelineData, s = this.shadow.querySelector(".gtv-empty");
    s.style.display = e.length > 0 ? "none" : "flex", this.renderRuler(t);
    const a = this.renderGridLines(t), r = e.map((g) => this.renderTrack(g, t)).join(""), n = this.tracksScroll.querySelector(".gtv-scrub-area");
    this.tracksScroll.innerHTML = a + r, this.tracksScroll.prepend(n), this.scrubArea = n;
  }
  renderGridLines(t) {
    const e = [], s = this.calculateInterval(t);
    for (let a = 0; a <= t; a += s) {
      const r = a / t * 100;
      e.push(`<div class="gtv-grid-line" style="left: ${r}%;"></div>`);
    }
    return e.join("");
  }
  renderRuler(t) {
    const e = [], s = this.calculateInterval(t);
    for (let a = 0; a <= t; a += s) {
      const r = a / t * 100;
      e.push(`
        <div class="gtv-ruler-marker" style="left: ${r}%;">
          <div class="gtv-ruler-marker-line"></div>
          <span class="gtv-ruler-marker-label">${f(a, !1)}s</span>
        </div>
      `);
    }
    this.rulerInner.innerHTML = e.join("");
  }
  calculateInterval(t) {
    return t <= 1 ? 0.25 : t <= 3 ? 0.5 : t <= 10 ? 1 : t <= 30 ? 5 : 10;
  }
  renderTrack(t, e) {
    const s = t.startTime / e * 100, a = t.duration / e * 100, r = t.colorIndex + 1;
    let n = "";
    t.hasStagger && t.staggerChildren && t.staggerChildren.length > 0 && (n = '<span class="gtv-track-stagger"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="10" height="10"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg> Stagger</span>');
    let g = "";
    if (t.staggerChildren && t.staggerChildren.length > 0) {
      const h = t.staggerChildren.map((d) => {
        const m = d.startTime / e * 100, u = (d.endTime - d.startTime) / e * 100;
        return `
          <div class="gtv-stagger-child">
            <div class="gtv-stagger-child-bar"
                 style="left: ${m}%; width: ${u}%; background: var(--gtv-track-${r});">
              <span class="gtv-track-label">${d.targetLabel}</span>
            </div>
          </div>
        `;
      }).join("");
      g = `<div class="gtv-stagger-children" data-for="${t.id}">${h}</div>`;
    }
    let v = "";
    if (t.overlapWithPrev !== void 0) {
      const h = t.overlapWithPrev > 0, d = Math.abs(t.overlapWithPrev) / e * 100, m = h ? `-${f(t.overlapWithPrev)}s` : `+${f(Math.abs(t.overlapWithPrev))}s`;
      h ? v = `
          <div class="gtv-overlap-region" style="left: ${s}%; width: ${d}%;"></div>
          <span class="gtv-offset-badge gtv-offset-overlap" style="left: ${s}%;">${m}</span>
        ` : v = `
          <div class="gtv-gap-connector" style="left: ${s - d}%; width: ${d}%;"></div>
          <span class="gtv-offset-badge gtv-offset-gap" style="left: ${s}%;">${m}</span>
        `;
    }
    return `
      <div class="gtv-track" data-expandable="${t.hasStagger && t.staggerChildren ? "true" : "false"}">
        ${v}
        <div class="gtv-track-bar"
             data-color="${r}"
             data-tween-id="${t.id}"
             style="left: ${s}%; width: ${a}%; background: var(--gtv-track-${r});">
          <span class="gtv-track-label">${t.label}</span>
          ${n}
        </div>
        ${g}
      </div>
    `;
  }
}
customElements.define("gsap-timeline-viewer", C);
const p = /* @__PURE__ */ new Map();
let c = null, w = !0, R = 0, k = null;
function j() {
  const o = window.gsap;
  !o || k || (k = o.timeline.bind(o), o.timeline = function(i) {
    const t = k(i);
    if (w) {
      let e;
      i != null && i.id && typeof i.id == "string" ? e = i.id : e = `Timeline ${++R}`, p.has(e) || (p.set(e, t), c && (c.htmlElement.updateTimelineSelector(), p.size === 1 && c.select(e)));
    }
    return t;
  });
}
class S {
  constructor(i = {}) {
    l(this, "element");
    l(this, "currentTimelineName", null);
    this.element = document.createElement("gsap-timeline-viewer"), i.height && this.element.style.setProperty("--viewer-height", `${i.height}px`);
  }
  /**
   * Create and attach the timeline viewer to the page.
   * Call this once - subsequent calls return the existing instance.
   */
  static create(i = {}) {
    return c || (w = i.autoDetect !== !1, w && j(), c = new S(i), document.body.appendChild(c.element), setTimeout(() => {
      if (c.element.updateTimelineSelector(), i.defaultTimeline && p.has(i.defaultTimeline))
        c.select(i.defaultTimeline);
      else if (p.size > 0) {
        const t = p.keys().next().value;
        t && c.select(t);
      }
    }, 0), c);
  }
  /**
   * Register a timeline with a name so it appears in the dropdown.
   */
  static register(i, t) {
    p.set(i, t), c && (c.element.updateTimelineSelector(), p.size === 1 && c.select(i));
  }
  /**
   * Unregister a timeline.
   */
  static unregister(i) {
    p.delete(i), c && c.element.updateTimelineSelector();
  }
  /**
   * Get all registered timelines.
   */
  static getTimelines() {
    return p;
  }
  /**
   * Get the viewer instance (if created).
   */
  static getInstance() {
    return c;
  }
  /**
   * Select a timeline by name.
   */
  select(i) {
    const t = p.get(i);
    t && (this.currentTimelineName = i, this.element.setTimeline(t), this.element.setSelectedTimeline(i));
  }
  /**
   * Get current timeline name.
   */
  getCurrentTimelineName() {
    return this.currentTimelineName;
  }
  /**
   * Remove the viewer from the page.
   */
  destroy() {
    this.element.remove(), c = null;
  }
  get htmlElement() {
    return this.element;
  }
}
const $ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TimelineViewer: S,
  TimelineViewerElement: C
}, Symbol.toStringTag, { value: "Module" }));
export {
  S as TimelineViewer,
  C as TimelineViewerElement
};
