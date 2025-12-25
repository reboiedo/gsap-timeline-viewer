var q = Object.defineProperty;
var R = (o, s, t) => s in o ? q(o, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[s] = t;
var l = (o, s, t) => R(o, typeof s != "symbol" ? s + "" : s, t);
let D = 0, M = null;
function N(o) {
  M = o;
}
function S(o) {
  if (!o || o.length === 0) return "Unknown";
  const s = o[0];
  return s.id ? `#${s.id}` : s.classList && s.classList.length > 0 ? `.${s.classList[0]}` : s.tagName ? s.tagName.toLowerCase() : "element";
}
function j(o) {
  const s = [
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
  return Object.keys(o).filter((t) => !s.includes(t));
}
function V(o = 20) {
  const s = [];
  for (let t = 0; t <= o; t++)
    s.push(t / o);
  return s;
}
function W(o, s, t = 20) {
  var n;
  const e = M || window.gsap;
  let i = (n = e == null ? void 0 : e.parseEase) == null ? void 0 : n.call(e, o.trim());
  if (!i && s && (i = s._ease), !i)
    return V(t);
  const a = [];
  for (let r = 0; r <= t; r++)
    a.push(i(r / t));
  return a;
}
function G(o) {
  const s = [];
  o.getChildren(!0, !0, !1).forEach((e, i) => {
    if (!("targets" in e)) return;
    const a = e, n = a.targets(), r = a.vars || {}, d = j(r);
    let m = "";
    if (r.id && typeof r.id == "string")
      m = r.id;
    else {
      const b = S(n), k = d.slice(0, 2).join(", ");
      m = k ? `${b} (${k})` : b;
    }
    const v = e.startTime(), u = e.duration();
    let h = "power1.out";
    r.ease && (h = typeof r.ease == "string" ? r.ease : "custom");
    let g, f;
    if (r.stagger && n.length > 1 && (typeof r.stagger == "number" ? g = r.stagger : typeof r.stagger == "object" && (g = r.stagger.each || 0), g)) {
      const b = u - g * (n.length - 1);
      f = n.map((k, H) => {
        const P = v + H * g;
        return {
          targetLabel: S([k]),
          startTime: P,
          endTime: P + b
        };
      });
    }
    s.push({
      id: `tween-${++D}`,
      label: m,
      startTime: v,
      endTime: v + u,
      duration: u,
      targets: S(n),
      properties: d,
      colorIndex: i % 6,
      hasStagger: !!r.stagger,
      ease: h,
      easeSamples: W(h, a),
      staggerValue: g,
      staggerChildren: f
    });
  });
  for (let e = 1; e < s.length; e++) {
    const i = s[e - 1], a = s[e], n = i.endTime - a.startTime;
    Math.abs(n) > 1e-3 && (a.overlapWithPrev = Math.round(n * 1e3) / 1e3);
  }
  return {
    duration: o.duration(),
    tweens: s
  };
}
function U() {
  D = 0;
}
function y(o, s = !0) {
  const t = Math.abs(o);
  return s ? t.toFixed(2) : t.toFixed(0);
}
const _ = ":host{--gtv-bg: #1a1a1a;--gtv-bg-secondary: #252525;--gtv-border: #333;--gtv-text: #e0e0e0;--gtv-text-muted: #888;--gtv-accent: oklch(65% .15 220);--gtv-playhead: oklch(65% .15 220);--gtv-ruler-bg: #1f1f1f;--gtv-track-height: 36px;--gtv-controls-height: 40px;--gtv-ruler-height: 24px;--gtv-timeline-padding: 16px;--gtv-track-1: oklch(50% .12 220);--gtv-track-1-active: oklch(60% .15 220);--gtv-track-2: oklch(50% .12 70);--gtv-track-2-active: oklch(60% .15 70);--gtv-track-3: oklch(50% .12 350);--gtv-track-3-active: oklch(60% .15 350);--gtv-track-4: oklch(50% .12 160);--gtv-track-4-active: oklch(60% .15 160);--gtv-track-5: oklch(50% .12 290);--gtv-track-5-active: oklch(60% .15 290);--gtv-track-6: oklch(50% .12 25);--gtv-track-6-active: oklch(60% .15 25)}*{box-sizing:border-box;margin:0;padding:0}.gtv-container{position:fixed;bottom:0;left:0;right:0;background:var(--gtv-bg);border-top:1px solid var(--gtv-border);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:12px;color:var(--gtv-text);z-index:999999;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none}.gtv-container.collapsed{height:auto!important}.gtv-container.collapsed .gtv-timeline-area{display:none}.gtv-controls{position:relative;display:flex;align-items:center;justify-content:center;height:var(--gtv-controls-height);padding:0 12px;background:var(--gtv-bg-secondary);border-bottom:1px solid var(--gtv-border);gap:8px}.gtv-controls-left{position:absolute;left:12px;display:flex;align-items:center;gap:8px}.gtv-controls-center{display:flex;align-items:center;gap:8px}.gtv-controls-right{position:absolute;right:12px;display:flex;align-items:center;gap:8px}.gtv-time-display{font-variant-numeric:tabular-nums;min-width:100px;text-align:center}.gtv-time-current{color:var(--gtv-text)}.gtv-time-total{color:var(--gtv-text-muted)}.gtv-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:transparent;border:none;border-radius:4px;color:var(--gtv-text);cursor:pointer;transition:background .15s}.gtv-btn:hover{background:#ffffff1a}.gtv-btn:active{background:#ffffff26}.gtv-btn.active{color:var(--gtv-accent)}.gtv-btn svg{width:16px;height:16px;fill:currentColor}.gtv-btn-play svg{width:20px;height:20px}.gtv-speed-btn{width:auto;padding:0 8px;font-size:11px;font-weight:500}.gtv-timeline-select{background:var(--gtv-bg);border:1px solid var(--gtv-border);border-radius:4px;color:var(--gtv-text);font-size:11px;padding:4px 8px;cursor:pointer;max-width:140px}.gtv-timeline-select:focus{outline:none;border-color:var(--gtv-accent)}.gtv-collapse-btn{margin-left:auto}.gtv-timeline-area{position:relative;display:flex;flex-direction:column;overflow:hidden;flex:1}.gtv-resize-handle{position:absolute;top:0;left:0;right:0;height:6px;cursor:ns-resize;z-index:20}.gtv-resize-handle:hover,.gtv-resize-handle:active{background:#ffffff1a}.gtv-ruler{position:relative;height:var(--gtv-ruler-height);background:var(--gtv-ruler-bg);border-bottom:1px solid var(--gtv-border);overflow:visible;flex-shrink:0;padding:0 var(--gtv-timeline-padding)}.gtv-ruler-inner{position:relative;height:100%;width:100%}.gtv-ruler-marker{position:absolute;top:0;display:flex;flex-direction:column;align-items:center}.gtv-ruler-marker-line{width:1px;height:6px;background:var(--gtv-text-muted)}.gtv-ruler-marker-label{font-size:10px;color:var(--gtv-text-muted);margin-top:2px}.gtv-grid-line{position:absolute;top:0;width:1px;height:100%;background:var(--gtv-border);pointer-events:none}.gtv-tracks-container{position:relative;overflow-y:auto;overflow-x:hidden;flex:1;padding:0 var(--gtv-timeline-padding)}.gtv-tracks-scroll{position:relative;min-height:100%;width:100%}.gtv-track{position:relative;padding-top:var(--gtv-track-height)}.gtv-track-bar{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);border-radius:4px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 8px;font-size:11px;font-weight:500;color:#fff;overflow:hidden;cursor:default;transition:filter .15s}.gtv-track-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;position:relative;z-index:1}.gtv-track-stagger{font-size:10px;font-weight:400;flex-shrink:0;position:relative;z-index:1}.gtv-track-bar:hover{filter:brightness(1.1)}.gtv-ease-curve{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .15s}.gtv-ease-curve path{fill:var(--track-color);stroke:none}.gtv-container.show-ease-curves .gtv-ease-curve{opacity:1}.gtv-container.show-ease-curves .gtv-track-bar,.gtv-container.show-ease-curves .gtv-stagger-child-bar{background:transparent!important}.gtv-playhead-wrapper{position:absolute;top:0;bottom:0;left:var(--gtv-timeline-padding);right:var(--gtv-timeline-padding);pointer-events:none;z-index:15}.gtv-playhead{position:absolute;top:0;bottom:0;width:0;left:0}.gtv-playhead-head{position:absolute;top:6px;left:-5px;width:11px;height:11px;background:var(--gtv-playhead);clip-path:polygon(50% 100%,0 0,100% 0)}.gtv-playhead-line{position:absolute;top:6px;bottom:0;left:0;width:1px;background:var(--gtv-playhead)}.gtv-scrub-area{position:absolute;top:0;left:0;right:0;bottom:0;cursor:ew-resize}.gtv-track[data-expandable=true] .gtv-track-bar{cursor:pointer}.gtv-expand-icon{transition:transform .2s}.gtv-track.expanded .gtv-expand-icon{transform:rotate(180deg)}.gtv-stagger-children{display:none;position:relative;width:100%}.gtv-track.expanded .gtv-stagger-children{display:block}.gtv-stagger-child{position:relative;width:100%;height:calc(var(--gtv-track-height) - 6px)}.gtv-stagger-child-bar{position:absolute;top:2px;height:calc(var(--gtv-track-height) - 12px);border-radius:3px;display:flex;align-items:center;padding:0 6px;font-size:10px;color:#fff;overflow:hidden}.gtv-stagger-child-bar .gtv-track-label{overflow:hidden;position:relative;z-index:1;text-overflow:ellipsis;white-space:nowrap}.gtv-overlap-region{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);background:repeating-linear-gradient(-45deg,transparent,transparent 2px,rgba(255,255,255,.15) 2px,rgba(255,255,255,.15) 4px);border-radius:4px;pointer-events:none;z-index:5}.gtv-container.show-ease-curves .gtv-overlap-region{display:none}.gtv-gap-connector{position:absolute;top:50%;height:1px;border-top:1px dashed var(--gtv-text-muted);pointer-events:none}.gtv-offset-badge{position:absolute;top:50%;transform:translate(-100%,-50%);margin-left:-4px;font-size:9px;font-weight:500;padding:2px 5px;border-radius:3px;white-space:nowrap;pointer-events:none;z-index:10}.gtv-offset-overlap,.gtv-offset-gap{background:var(--gtv-bg-secondary);border:1px solid var(--gtv-border);color:var(--gtv-text-muted)}.gtv-empty{display:flex;align-items:center;justify-content:center;padding:24px;color:var(--gtv-text-muted)}", w = [0.25, 0.5, 1, 2, 4], z = "gsap-timeline-viewer-settings", $ = 40;
class I extends HTMLElement {
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
    l(this, "showEaseCurves", !1);
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
    this.shadow = this.attachShadow({ mode: "open" }), this.loadSettings();
  }
  connectedCallback() {
    this.render(), this.setupEventListeners(), this.updateBodyPadding(), this.applyLoadedSettings();
  }
  loadSettings() {
    try {
      const t = localStorage.getItem(z);
      if (t) {
        const e = JSON.parse(t);
        this.height = e.height ?? 200, this.collapsed = e.collapsed ?? !1, this.speedIndex = e.speedIndex ?? 2, this.isLooping = e.isLooping ?? !1, this.isAutofit = e.isAutofit ?? !1, this.showEaseCurves = e.showEaseCurves ?? !1;
      }
    } catch {
    }
  }
  saveSettings() {
    var t;
    try {
      const e = {
        height: this.height,
        collapsed: this.collapsed,
        speedIndex: this.speedIndex,
        isLooping: this.isLooping,
        isAutofit: this.isAutofit,
        showEaseCurves: this.showEaseCurves,
        selectedTimeline: (t = this.timelineSelect) == null ? void 0 : t.value
      };
      localStorage.setItem(z, JSON.stringify(e));
    } catch {
    }
  }
  applyLoadedSettings() {
    var t, e, i;
    this.collapsed && this.container.classList.add("collapsed"), this.showEaseCurves && (this.container.classList.add("show-ease-curves"), (t = this.shadow.querySelector('[data-action="ease-curves"]')) == null || t.classList.add("active")), this.isAutofit && ((e = this.shadow.querySelector('[data-action="autofit"]')) == null || e.classList.add("active")), this.isLooping && ((i = this.loopBtn) == null || i.classList.add("active")), this.speedBtn.textContent = `${w[this.speedIndex]}x`, this.container.style.height = `${this.height}px`;
  }
  disconnectedCallback() {
    this.detachTimeline(), this.clearBodyPadding();
  }
  setTimeline(t) {
    this.detachTimeline(), this.timeline = t, U(), this.timelineData = G(t), t.eventCallback("onUpdate", () => this.onTimelineUpdate()), t.timeScale(w[this.speedIndex]), t.repeat(this.isLooping ? -1 : 0), this.renderTracks(), this.updatePlayhead(), this.updateTimeDisplay(), this.updatePlayState(), requestAnimationFrame(() => this.applyAutofit());
  }
  updateTimelineSelector() {
    Promise.resolve().then(() => B).then(({ TimelineViewer: t }) => {
      const e = t.getTimelines(), i = this.timelineSelect.value;
      this.timelineSelect.innerHTML = "", e.forEach((a, n) => {
        const r = document.createElement("option");
        r.value = n, r.textContent = n, this.timelineSelect.appendChild(r);
      }), i && e.has(i) && (this.timelineSelect.value = i);
    });
  }
  setSelectedTimeline(t) {
    this.timelineSelect.value = t, this.saveSettings();
  }
  detachTimeline() {
    this.timeline && (this.timeline.eventCallback("onUpdate", null), this.timeline = null, this.timelineData = null);
  }
  render() {
    this.shadow.innerHTML = `
      <style>${_}</style>
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
            <button class="gtv-btn" data-action="ease-curves" title="Show ease curves">
              <svg viewBox="0 0 24 24"><path d="M3 17c0 0 3-8 9-8s9 8 9 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
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
      const i = t.target.closest("[data-action]");
      if (!i) return;
      switch (i.dataset.action) {
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
        case "ease-curves":
          this.toggleEaseCurves();
          break;
      }
    }), this.timelineSelect.addEventListener("change", () => {
      const t = this.timelineSelect.value;
      t && Promise.resolve().then(() => B).then(({ TimelineViewer: e }) => {
        var i;
        (i = e.getInstance()) == null || i.select(t);
      });
    }), this.shadow.addEventListener("click", (t) => {
      const i = t.target.closest(".gtv-track-bar");
      if (i) {
        const a = i.closest(".gtv-track");
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
    const e = window.innerHeight, i = e - t.clientY;
    this.height = Math.max(100, Math.min(i, e - 100)), this.container.style.height = `${this.height}px`, this.updateBodyPadding();
  }
  endResize() {
    this.isResizing && (this.isResizing = !1, document.body.style.cursor = "", document.body.style.userSelect = "", this.saveSettings());
  }
  updateBodyPadding() {
    if (!this.manageBodyPadding) return;
    const t = this.collapsed ? $ : this.height;
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
    }), Array.from(t).sort((e, i) => e - i);
  }
  jumpToPrevPoint() {
    if (!this.timeline || !this.timelineData) return;
    const t = Math.round(this.timeline.time() * 1e3) / 1e3, e = this.getTimePoints();
    let i = 0;
    for (const a of e)
      if (a < t - 1e-3)
        i = a;
      else
        break;
    this.timeline.time(i), this.timeline.pause(), this.updatePlayState();
  }
  jumpToNextPoint() {
    if (!this.timeline || !this.timelineData) return;
    const t = Math.round(this.timeline.time() * 1e3) / 1e3, e = this.getTimePoints();
    let i = this.timelineData.duration;
    for (const a of e)
      if (a > t + 1e-3) {
        i = a;
        break;
      }
    this.timeline.time(i), this.timeline.pause(), this.updatePlayState();
  }
  toggleLoop() {
    this.timeline && (this.isLooping = !this.isLooping, this.timeline.repeat(this.isLooping ? -1 : 0), this.loopBtn.classList.toggle("active", this.isLooping), this.saveSettings());
  }
  cycleSpeed() {
    if (!this.timeline) return;
    this.speedIndex = (this.speedIndex + 1) % w.length;
    const t = w[this.speedIndex];
    this.timeline.timeScale(t), this.speedBtn.textContent = `${t}x`, this.saveSettings();
  }
  toggleCollapse() {
    this.collapsed = !this.collapsed, this.container.classList.toggle("collapsed", this.collapsed);
    const t = this.shadow.querySelector('[data-action="collapse"]');
    t.innerHTML = this.collapsed ? '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>', this.updateBodyPadding(), this.saveSettings();
  }
  toggleAutofit() {
    this.isAutofit = !this.isAutofit, this.shadow.querySelector('[data-action="autofit"]').classList.toggle("active", this.isAutofit), this.isAutofit && this.applyAutofit(), this.saveSettings();
  }
  toggleEaseCurves() {
    this.showEaseCurves = !this.showEaseCurves, this.shadow.querySelector('[data-action="ease-curves"]').classList.toggle("active", this.showEaseCurves), this.container.classList.toggle("show-ease-curves", this.showEaseCurves), this.saveSettings();
  }
  applyAutofit() {
    if (!this.isAutofit || this.collapsed) return;
    const t = this.shadow.querySelectorAll(".gtv-track");
    let e = 0;
    const i = 36, a = 30;
    t.forEach((v) => {
      if (e += i, v.classList.contains("expanded")) {
        const u = v.querySelectorAll(".gtv-stagger-child");
        e += u.length * a;
      }
    });
    const n = 24, r = 16, d = 100, m = window.innerHeight - 100;
    this.height = Math.max(d, Math.min($ + n + e + r, m)), this.container.style.height = `${this.height}px`, this.updateBodyPadding();
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
    const t = this.timeline.time(), e = this.timelineData.duration, i = this.timeDisplay.querySelector(".gtv-time-current"), a = this.timeDisplay.querySelector(".gtv-time-total");
    i.textContent = y(t), a.textContent = ` / ${y(e)}`;
  }
  updateActiveTracks() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.time();
    this.tracksScroll.querySelectorAll(".gtv-track-bar").forEach((i, a) => {
      const n = this.timelineData.tweens[a], r = t >= n.startTime && t <= n.endTime, d = i.dataset.color;
      r ? i.style.background = `var(--gtv-track-${d}-active)` : i.style.background = `var(--gtv-track-${d})`;
    });
  }
  renderTracks() {
    if (!this.timelineData) return;
    const { duration: t, tweens: e } = this.timelineData, i = this.shadow.querySelector(".gtv-empty");
    i.style.display = e.length > 0 ? "none" : "flex", this.renderRuler(t);
    const a = this.renderGridLines(t), n = e.map((d) => this.renderTrack(d, t)).join(""), r = this.tracksScroll.querySelector(".gtv-scrub-area");
    this.tracksScroll.innerHTML = a + n, this.tracksScroll.prepend(r), this.scrubArea = r;
  }
  renderGridLines(t) {
    const e = [], i = this.calculateInterval(t);
    for (let a = 0; a <= t; a += i) {
      const n = a / t * 100;
      e.push(`<div class="gtv-grid-line" style="left: ${n}%;"></div>`);
    }
    return e.join("");
  }
  renderRuler(t) {
    const e = [], i = this.calculateInterval(t);
    for (let a = 0; a <= t; a += i) {
      const n = a / t * 100;
      e.push(`
        <div class="gtv-ruler-marker" style="left: ${n}%;">
          <div class="gtv-ruler-marker-line"></div>
          <span class="gtv-ruler-marker-label">${y(a, !1)}s</span>
        </div>
      `);
    }
    this.rulerInner.innerHTML = e.join("");
  }
  calculateInterval(t) {
    return t <= 1 ? 0.25 : t <= 3 ? 0.5 : t <= 10 ? 1 : t <= 30 ? 5 : 10;
  }
  renderEaseCurve(t) {
    return t != null && t.length ? `
      <svg class="gtv-ease-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="${`M0,100 L${t.map((a, n) => {
      const r = n / (t.length - 1) * 100, d = 100 - a * 100;
      return `${r},${d}`;
    }).join(" L")} L100,100 Z`}" />
      </svg>
    ` : "";
  }
  getEaseClipPath(t) {
    return t != null && t.length ? `polygon(0% 100%, ${t.map((i, a) => {
      const n = a / (t.length - 1) * 100, r = 100 - i * 100;
      return `${n}% ${r}%`;
    }).join(", ")}, 100% 100%)` : "";
  }
  renderTrack(t, e) {
    const i = t.startTime / e * 100, a = t.duration / e * 100, n = t.colorIndex + 1, r = this.renderEaseCurve(t.easeSamples);
    let d = "";
    t.hasStagger && t.staggerChildren && t.staggerChildren.length > 0 && (d = '<span class="gtv-track-stagger"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="10" height="10"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg> Stagger</span>');
    let m = "";
    if (t.staggerChildren && t.staggerChildren.length > 0) {
      const u = t.staggerChildren.map((h) => {
        const g = h.startTime / e * 100, f = (h.endTime - h.startTime) / e * 100;
        return `
          <div class="gtv-stagger-child">
            <div class="gtv-stagger-child-bar"
                 style="left: ${g}%; width: ${f}%; background: var(--gtv-track-${n}); --track-color: var(--gtv-track-${n});">
              ${r}
              <span class="gtv-track-label">${h.targetLabel}</span>
            </div>
          </div>
        `;
      }).join("");
      m = `<div class="gtv-stagger-children" data-for="${t.id}">${u}</div>`;
    }
    let v = "";
    if (t.overlapWithPrev !== void 0) {
      const u = t.overlapWithPrev > 0, h = Math.abs(t.overlapWithPrev) / e * 100, g = u ? `-${y(t.overlapWithPrev)}s` : `+${y(Math.abs(t.overlapWithPrev))}s`, f = this.getEaseClipPath(t.easeSamples);
      u ? v = `
          <div class="gtv-overlap-region" style="left: ${i}%; width: ${h}%; --ease-clip: ${f};"></div>
          <span class="gtv-offset-badge gtv-offset-overlap" style="left: ${i}%;">${g}</span>
        ` : v = `
          <div class="gtv-gap-connector" style="left: ${i - h}%; width: ${h}%;"></div>
          <span class="gtv-offset-badge gtv-offset-gap" style="left: ${i}%;">${g}</span>
        `;
    }
    return `
      <div class="gtv-track" data-expandable="${t.hasStagger && t.staggerChildren ? "true" : "false"}">
        ${v}
        <div class="gtv-track-bar"
             data-color="${n}"
             data-tween-id="${t.id}"
             style="left: ${i}%; width: ${a}%; background: var(--gtv-track-${n}); --track-color: var(--gtv-track-${n});">
          ${r}
          <span class="gtv-track-label">${t.label}</span>
          ${d}
        </div>
        ${m}
      </div>
    `;
  }
}
customElements.define("gsap-timeline-viewer", I);
const p = /* @__PURE__ */ new Map();
let c = null, C = !0, F = 0, T = null;
const E = /* @__PURE__ */ new WeakSet();
let x = null;
function O() {
  if (T) return T;
  const o = window;
  return o.gsap || o.GSAP || null;
}
function A() {
  const o = O();
  if (!(o != null && o.globalTimeline)) return;
  o.globalTimeline.getChildren(!1, !1, !0).forEach((t) => {
    if (E.has(t)) return;
    E.add(t);
    const e = t.vars || {};
    let i;
    e.id && typeof e.id == "string" ? i = e.id : i = `Timeline ${++F}`;
    let a = i, n = 1;
    for (; p.has(a); )
      a = `${i} (${++n})`;
    p.set(a, t), c && (c.htmlElement.updateTimelineSelector(), p.size === 1 && c.select(a));
  });
}
function K() {
  x || (A(), x = setInterval(A, 500));
}
function J() {
  x && (clearInterval(x), x = null);
}
class L {
  constructor(s = {}) {
    l(this, "element");
    l(this, "currentTimelineName", null);
    this.element = document.createElement("gsap-timeline-viewer"), s.height && this.element.style.setProperty("--viewer-height", `${s.height}px`);
  }
  /**
   * Create and attach the timeline viewer to the page.
   * Call this once - subsequent calls return the existing instance.
   */
  static create(s = {}) {
    return c || (s.gsap && (T = s.gsap, N(s.gsap)), C = s.autoDetect !== !1, c = new L(s), document.body.appendChild(c.element), C && K(), setTimeout(() => {
      if (c.element.updateTimelineSelector(), s.defaultTimeline && p.has(s.defaultTimeline))
        c.select(s.defaultTimeline);
      else if (p.size > 0) {
        const t = p.keys().next().value;
        t && c.select(t);
      }
    }, 0), c);
  }
  /**
   * Register a timeline with a name so it appears in the dropdown.
   */
  static register(s, t) {
    p.set(s, t), c && (c.element.updateTimelineSelector(), p.size === 1 && c.select(s));
  }
  /**
   * Unregister a timeline.
   */
  static unregister(s) {
    p.delete(s), c && c.element.updateTimelineSelector();
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
  select(s) {
    const t = p.get(s);
    t && (this.currentTimelineName = s, this.element.setTimeline(t), this.element.setSelectedTimeline(s));
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
    J(), this.element.remove(), c = null;
  }
  get htmlElement() {
    return this.element;
  }
}
const B = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TimelineViewer: L,
  TimelineViewerElement: I
}, Symbol.toStringTag, { value: "Module" }));
export {
  L as TimelineViewer,
  I as TimelineViewerElement
};
