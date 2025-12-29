var _ = Object.defineProperty;
var Z = (c, r, t) => r in c ? _(c, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : c[r] = t;
var d = (c, r, t) => Z(c, typeof r != "symbol" ? r + "" : r, t);
let F = 0, V = null;
function K(c) {
  V = c;
}
function q(c) {
  if (!c || c.length === 0) return "Unknown";
  const r = c[0];
  return r.id ? `#${r.id}` : r.classList && r.classList.length > 0 ? `.${r.classList[0]}` : r.tagName ? r.tagName.toLowerCase() : "element";
}
function U(c) {
  const r = [
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
  return Object.keys(c).filter((t) => !r.includes(t));
}
function Y(c = 50) {
  const r = [];
  for (let t = 0; t <= c; t++)
    r.push(t / c);
  return r;
}
function X(c, r, t = 50) {
  var o;
  const e = V || window.gsap;
  let i = (o = e == null ? void 0 : e.parseEase) == null ? void 0 : o.call(e, c.trim());
  if (!i && r && (i = r._ease), !i)
    return Y(t);
  const a = [];
  for (let n = 0; n <= t; n++)
    a.push(i(n / t));
  return a;
}
function J(c, r) {
  let t = c.startTime(), e = c.parent;
  for (; e && e !== r; )
    t += e.startTime(), e = e.parent;
  return t;
}
function Q(c, r) {
  const t = c.parent;
  if (!t || t === r)
    return;
  const e = t.vars || {};
  return e.id ? e.id : `timeline-${t.startTime()}-${t.duration()}`;
}
function tt(c, r) {
  const t = c.parent;
  return !t || t === r ? void 0 : (t.vars || {}).id || void 0;
}
function et(c) {
  const r = [], t = /* @__PURE__ */ new Map();
  c.getChildren(!0, !0, !1).forEach((n, l) => {
    if (!("targets" in n)) return;
    const p = n, u = p.targets(), s = p.vars || {}, g = U(s);
    let m = "";
    if (s.id && typeof s.id == "string")
      m = s.id;
    else {
      const k = q(u), E = g.slice(0, 2).join(", ");
      m = E ? `${k} (${E})` : k;
    }
    const v = J(n, c), h = n.totalDuration(), S = v + h, L = typeof s.repeat == "number" && s.repeat > 0 ? s.repeat : void 0, P = s.yoyo === !0, b = Q(p, c), x = tt(p, c);
    if (b) {
      const k = t.get(b);
      k ? (k.startTime = Math.min(k.startTime, v), k.endTime = Math.max(k.endTime, S), k.tweenCount++) : t.set(b, {
        name: x || b,
        startTime: v,
        endTime: S,
        tweenCount: 1
      });
    }
    let y = "power1.out";
    s.ease && (y = typeof s.ease == "string" ? s.ease : "custom");
    let w, M;
    if (s.stagger && u.length > 1 && (typeof s.stagger == "number" ? w = s.stagger : typeof s.stagger == "object" && (w = s.stagger.each || 0), w)) {
      const k = h - w * (u.length - 1);
      M = u.map((E, D) => {
        const $ = v + D * w;
        return {
          targetLabel: q([E]),
          startTime: $,
          endTime: $ + k
        };
      });
    }
    r.push({
      id: `tween-${++F}`,
      label: m,
      startTime: v,
      endTime: S,
      duration: h,
      targets: q(u),
      properties: g,
      colorIndex: l % 6,
      hasStagger: !!s.stagger,
      ease: y,
      easeSamples: X(y, p),
      staggerValue: w,
      staggerChildren: M,
      parentTimelineId: b,
      repeat: L,
      yoyo: P
    });
  });
  for (let n = 1; n < r.length; n++) {
    const l = r[n - 1], p = r[n], u = l.endTime - p.startTime;
    Math.abs(u) > 1e-3 && (p.overlapWithPrev = Math.round(u * 1e3) / 1e3);
  }
  const i = Object.entries(c.labels || {}).map(([n, l]) => ({
    name: n,
    time: l
  })).sort((n, l) => n.time - l.time), a = [];
  let o = 0;
  t.forEach((n, l) => {
    a.push({
      id: l,
      name: n.name,
      startTime: n.startTime,
      endTime: n.endTime,
      colorIndex: o % 6,
      tweenCount: n.tweenCount
    }), o++;
  }), a.sort((n, l) => n.startTime - l.startTime);
  for (let n = 1; n < a.length; n++) {
    const l = a[n - 1], p = a[n], u = l.endTime - p.startTime;
    Math.abs(u) > 1e-3 && (p.positionOffset = Math.round(u * 1e3) / 1e3);
  }
  return {
    duration: c.duration(),
    tweens: r,
    labels: i,
    groups: a
  };
}
function it() {
  F = 0;
}
function T(c, r = !0) {
  const t = Math.abs(c);
  return r ? t.toFixed(2) : t.toFixed(0);
}
const st = ':host{--gtv-bg: #2a2a2a;--gtv-bg-card: #1a1a1a;--gtv-border: #333;--gtv-text: #e0e0e0;--gtv-text-muted: #888;--gtv-accent: oklch(65% .15 220);--gtv-playhead: oklch(65% .15 220);--gtv-track-height: 36px;--gtv-controls-height: 40px;--gtv-ruler-height: 24px;--gtv-timeline-padding: 16px;--gtv-track-1: oklch(50% .12 220);--gtv-track-1-active: oklch(60% .15 220);--gtv-track-2: oklch(50% .12 70);--gtv-track-2-active: oklch(60% .15 70);--gtv-track-3: oklch(50% .12 350);--gtv-track-3-active: oklch(60% .15 350);--gtv-track-4: oklch(50% .12 160);--gtv-track-4-active: oklch(60% .15 160);--gtv-track-5: oklch(50% .12 290);--gtv-track-5-active: oklch(60% .15 290);--gtv-track-6: oklch(50% .12 25);--gtv-track-6-active: oklch(60% .15 25)}*{box-sizing:border-box;margin:0;padding:0}.gtv-container{position:fixed;bottom:0;left:0;right:0;background:var(--gtv-bg);border-top:1px solid var(--gtv-border);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:12px;color:var(--gtv-text);z-index:999999;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none}.gtv-container.collapsed{height:auto!important}.gtv-container.collapsed .gtv-timeline-area{display:none}.gtv-controls{position:relative;display:flex;align-items:center;justify-content:center;height:var(--gtv-controls-height);padding:0 12px;background:var(--gtv-bg);gap:8px}.gtv-controls-left{position:absolute;left:12px;display:flex;align-items:center;gap:8px}.gtv-controls-center{display:flex;align-items:center;gap:8px}.gtv-controls-right{position:absolute;right:12px;display:flex;align-items:center;gap:8px}.gtv-time-display{font-variant-numeric:tabular-nums;min-width:100px;text-align:center}.gtv-time-current{color:var(--gtv-text)}.gtv-time-total{color:var(--gtv-text-muted)}.gtv-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:transparent;border:none;border-radius:4px;color:var(--gtv-text);cursor:pointer;transition:background .15s}.gtv-btn:hover{background:#ffffff1a}.gtv-btn:active{background:#ffffff26}.gtv-btn.active{color:var(--gtv-accent)}.gtv-btn svg{width:16px;height:16px;fill:currentColor}.gtv-btn-play svg{width:20px;height:20px}.gtv-collapse-btn{margin-left:auto}.gtv-dropdown{position:relative}.gtv-dropdown-menu{background:var(--gtv-bg-card);border:none;border-radius:6px;padding:4px;min-width:120px;box-shadow:0 4px 12px #0000004d}.gtv-dropdown-trigger{display:flex;align-items:center;gap:4px}.gtv-timeline-trigger,.gtv-speed-trigger{width:auto;padding:0 8px;font-size:11px}.gtv-timeline-value,.gtv-speed-value{white-space:nowrap}.gtv-timeline-value{max-width:120px;overflow:hidden;text-overflow:ellipsis}.gtv-dropdown-caret{opacity:.6;flex-shrink:0}.gtv-dropdown-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:transparent;border:none;border-radius:4px;color:var(--gtv-text-muted);font-size:12px;cursor:pointer;transition:background .15s,color .15s}.gtv-dropdown-item:hover{background:#ffffff0d;color:var(--gtv-text)}.gtv-dropdown-item.selected{color:var(--gtv-text);background:#ffffff1a}.gtv-dropdown-item svg{width:16px;height:16px;fill:currentColor}.gtv-playrange-bar{position:relative;height:16px;background:var(--gtv-bg);margin-bottom:8px}.gtv-playrange-scroll{position:relative;height:100%;overflow-x:auto;overflow-y:visible;padding:2px var(--gtv-timeline-padding);scrollbar-width:none}.gtv-playrange-scroll::-webkit-scrollbar{display:none}.gtv-playrange-inner{position:relative;height:100%;width:100%}.gtv-playrange-track{position:relative;height:100%;width:100%;background:#0000004d;border-radius:0}.gtv-playrange-inactive-left,.gtv-playrange-inactive-right{position:absolute;top:0;height:100%;background:var(--gtv-bg);opacity:.5;pointer-events:none}.gtv-playrange-inactive-left{left:0;width:0%}.gtv-playrange-inactive-right{right:0;width:0%}.gtv-playrange-active{position:absolute;top:0;left:0;width:100%;height:100%;background:#00000026;pointer-events:none;border-radius:0}.gtv-playrange-handle{position:absolute;top:2px;bottom:2px;width:8px;cursor:ew-resize;z-index:5;background:#5ba3d0;border-radius:3px}.gtv-playrange-handle:hover{background:#7cbce8}.gtv-playrange-handle-start{transform:translate(-100%);border-top-right-radius:0;border-bottom-right-radius:0}.gtv-playrange-handle-end{border-top-left-radius:0;border-bottom-left-radius:0}.gtv-playrange-fill{position:absolute;top:0;left:0;width:0%;height:100%;background:#ffffff26;pointer-events:none;opacity:0;transition:opacity .15s}.gtv-playrange-scrubber{position:absolute;top:50%;left:0%;width:12px;height:12px;background:var(--gtv-text);border-radius:50%;transform:translate(-50%,-50%);cursor:ew-resize;opacity:0;transition:opacity .15s;z-index:4}.gtv-playrange-scrubber:hover{background:#fff}.gtv-container.collapsed .gtv-playrange-fill,.gtv-container.collapsed .gtv-playrange-scrubber{opacity:1}.gtv-timeline-area{position:relative;display:flex;flex-direction:column;overflow:hidden;flex:1;background:var(--gtv-bg-card);border-radius:8px 8px 0 0;margin:0 8px}.gtv-resize-handle{position:absolute;top:0;left:0;right:0;height:8px;cursor:ns-resize;z-index:100}.gtv-resize-handle:hover,.gtv-resize-handle:active{background:#ffffff14}.gtv-ruler{position:relative;height:var(--gtv-ruler-height);background:var(--gtv-bg-card);border-bottom:1px solid var(--gtv-border);overflow-x:auto;overflow-y:visible;overscroll-behavior:none;flex-shrink:0;padding:0 var(--gtv-timeline-padding);scrollbar-width:none}.gtv-ruler::-webkit-scrollbar{display:none}.gtv-ruler-inner{position:relative;height:100%;width:100%}.gtv-ruler-marker{position:absolute;top:0;display:flex;flex-direction:column;align-items:flex-start;transform:translate(-.5px)}.gtv-ruler-marker-line{width:1px;height:6px;background:var(--gtv-text-muted)}.gtv-ruler-marker-label{font-size:10px;color:var(--gtv-text-muted);margin-top:2px}.gtv-ruler-playhead-head{position:absolute;bottom:0;left:0;width:0;z-index:20;pointer-events:none}.gtv-ruler-playhead-head:before{content:"";position:absolute;bottom:-1px;left:-5px;width:11px;height:11px;background:var(--gtv-playhead);clip-path:polygon(50% 100%,0 0,100% 0)}.gtv-labels-wrapper{position:absolute;top:0;bottom:0;left:var(--gtv-timeline-padding);right:var(--gtv-timeline-padding);pointer-events:none;z-index:2}.gtv-label-line{position:absolute;top:0;bottom:0;width:0;border-left:1px dashed var(--gtv-accent);opacity:.4}.gtv-label-line-text{position:absolute;top:4px;font-size:9px;color:var(--gtv-accent);white-space:nowrap}.gtv-grid-line{position:absolute;top:0;width:1px;height:100%;background:var(--gtv-border);pointer-events:none}.gtv-tracks-container{position:relative;overflow-y:auto;overflow-x:auto;overscroll-behavior:none;flex:1;padding:0 var(--gtv-timeline-padding)}.gtv-tracks-scroll{position:relative;min-height:100%;width:100%;overflow:visible}.gtv-track{position:relative;padding-top:var(--gtv-track-height)}.gtv-track-bar{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);border-radius:4px;display:flex;align-items:center;justify-content:flex-start;gap:6px;padding:0 8px;font-size:11px;font-weight:500;color:#fff;overflow:visible;cursor:default;transition:filter .15s}.gtv-track-label{white-space:nowrap;position:relative;z-index:1;text-shadow:0 1px 2px rgba(0,0,0,.5)}.gtv-track-label.outside-left,.gtv-track-label.outside-right{position:absolute;flex:none;overflow:visible}.gtv-track-label.outside-left{right:100%;left:auto;padding-right:6px}.gtv-track-label.outside-right{left:100%;right:auto;padding-left:6px}.gtv-track-stagger.outside-left,.gtv-track-stagger.outside-right{position:absolute;flex:none}.gtv-track-stagger.outside-left{right:100%;left:auto;padding-right:6px}.gtv-track-stagger.outside-right{left:100%;right:auto;padding-left:6px}.gtv-track-stagger{font-size:10px;font-weight:400;flex-shrink:0;position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#ffffff26;cursor:pointer;transition:background .15s}.gtv-track-stagger:hover{background:#ffffff40}.gtv-repeat-badge{font-size:9px;opacity:.8;margin-left:4px;flex-shrink:0;position:relative;z-index:1;text-shadow:0 1px 2px rgba(0,0,0,.5)}.gtv-track-bar:hover{filter:brightness(1.1)}.gtv-ease-curve{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .15s}.gtv-ease-stroke{fill:none;stroke:oklch(75% .12 var(--track-hue, 220));stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.gtv-container.show-ease-curves .gtv-ease-curve{opacity:1}.gtv-container.show-ease-curves .gtv-track-bar,.gtv-container.show-ease-curves .gtv-stagger-child-bar{background:transparent!important;border-radius:0;overflow:visible}.gtv-container.show-ease-curves .gtv-track-label{text-shadow:0 1px 3px rgba(0,0,0,.8)}.gtv-playhead{position:absolute;top:0;bottom:0;width:0;left:0;z-index:15;pointer-events:none}.gtv-playhead-line{position:absolute;top:0;bottom:0;left:0;width:1px;background:var(--gtv-playhead)}.gtv-scrub-area{position:absolute;top:0;left:0;right:0;bottom:0;cursor:ew-resize}.gtv-track[data-expandable=true] .gtv-track-bar{cursor:pointer}.gtv-expand-icon{transition:transform .2s;flex-shrink:0}.gtv-track.expanded .gtv-expand-icon{transform:rotate(180deg)}.gtv-stagger-children{display:none;position:relative;width:100%}.gtv-track.expanded .gtv-stagger-children{display:block}.gtv-stagger-child{position:relative;width:100%;height:calc(var(--gtv-track-height) - 6px)}.gtv-stagger-child-bar{position:absolute;top:2px;height:calc(var(--gtv-track-height) - 12px);border-radius:3px;display:flex;align-items:center;padding:0 6px;font-size:10px;color:#fff;overflow:visible}.gtv-stagger-child-bar .gtv-track-label{position:relative;z-index:1;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.5)}.gtv-timeline-group{position:relative}.gtv-timeline-group[data-expandable=true] .gtv-group-header{cursor:pointer}.gtv-group-header{position:relative;height:var(--gtv-track-height);width:100%}.gtv-group-bar{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);min-height:28px;border-radius:4px;background:color-mix(in oklch,var(--group-color) 60%,transparent);display:flex;align-items:center;justify-content:flex-start;gap:6px;padding:0 8px;overflow:visible;font-size:11px;color:#fff;font-weight:500}.gtv-group-bar.gtv-align-right{justify-content:flex-end}.gtv-group-bar:hover{background:color-mix(in oklch,var(--group-color) 80%,transparent)}.gtv-group-name{font-weight:600;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.5);flex-shrink:0;position:relative;z-index:1}.gtv-group-info{font-size:10px;opacity:.8;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.5);flex-shrink:0;position:relative;z-index:1}.gtv-group-expand{flex-shrink:0;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#ffffff26;cursor:pointer;transition:background .15s}.gtv-group-expand:hover{background:#ffffff40}.gtv-group-expand .gtv-expand-icon{opacity:.9}.gtv-timeline-group.expanded .gtv-group-bar .gtv-expand-icon{transform:rotate(180deg)}.gtv-group-children{display:none;position:relative}.gtv-timeline-group.expanded .gtv-group-children{display:block}.gtv-overlap-region{position:absolute;top:4px;height:calc(var(--gtv-track-height) - 8px);background:repeating-linear-gradient(-45deg,transparent,transparent 2px,rgba(255,255,255,.15) 2px,rgba(255,255,255,.15) 4px);border-radius:4px;pointer-events:none;z-index:5}.gtv-container.show-ease-curves .gtv-overlap-region{display:none}.gtv-gap-connector{position:absolute;top:50%;height:1px;border-top:1px dashed var(--gtv-text-muted);pointer-events:none}.gtv-offset-badge{font-size:9px;font-weight:500;padding:2px 6px;border-radius:3px;white-space:nowrap;background:#0009;color:var(--gtv-text);flex-shrink:0;position:relative;z-index:2}.gtv-track-bar.gtv-align-right{justify-content:flex-end}.gtv-empty{display:flex;align-items:center;justify-content:center;padding:24px;color:var(--gtv-text-muted)}', A = [0.25, 0.5, 1, 2, 4], B = "gsap-timeline-viewer-settings", at = 40, nt = 16, R = at + nt;
class G extends HTMLElement {
  constructor() {
    super();
    d(this, "shadow");
    d(this, "timeline", null);
    d(this, "timelineData", null);
    d(this, "isPlaying", !1);
    d(this, "loopMode", "oneshot");
    d(this, "speedIndex", 2);
    // 1x
    d(this, "zoomLevel", 1);
    // 1 = fit all
    d(this, "zoomLevels", [1, 2, 4, 6, 8, 10]);
    d(this, "collapsed", !1);
    d(this, "height", 200);
    d(this, "isDragging", !1);
    d(this, "manageBodyPadding", !0);
    d(this, "isAutofit", !1);
    d(this, "showEaseCurves", !1);
    d(this, "playrangeStart", 0);
    // 0-1 progress
    d(this, "playrangeEnd", 1);
    // 0-1 progress
    d(this, "draggingPlayrange", null);
    d(this, "draggingScrubber", !1);
    // DOM references
    d(this, "container");
    d(this, "playBtn");
    d(this, "loopDropdown");
    d(this, "loopMenu");
    d(this, "speedDropdown");
    d(this, "speedMenu");
    d(this, "zoomDropdown");
    d(this, "zoomMenu");
    d(this, "timelineDropdown");
    d(this, "timelineMenu");
    d(this, "timeDisplay");
    d(this, "ruler");
    d(this, "rulerInner");
    d(this, "rulerPlayheadHead");
    d(this, "tracksContainer");
    d(this, "tracksScroll");
    d(this, "playrangeScroll");
    d(this, "playrangeInner");
    d(this, "playhead");
    d(this, "scrubArea");
    d(this, "resizeHandle");
    d(this, "selectedTimelineName", "");
    d(this, "isResizing", !1);
    this.shadow = this.attachShadow({ mode: "open" }), this.loadSettings();
  }
  connectedCallback() {
    this.render(), this.setupEventListeners(), this.updateBodyPadding(), this.applyLoadedSettings();
  }
  loadSettings() {
    try {
      const t = localStorage.getItem(B);
      if (t) {
        const e = JSON.parse(t);
        this.height = e.height ?? 200, this.collapsed = e.collapsed ?? !1, this.speedIndex = e.speedIndex ?? 2, this.loopMode = e.loopMode ?? "oneshot", this.isAutofit = e.isAutofit ?? !1, this.showEaseCurves = e.showEaseCurves ?? !1, this.playrangeStart = e.playrangeStart ?? 0, this.playrangeEnd = e.playrangeEnd ?? 1;
      }
    } catch {
    }
  }
  saveSettings() {
    try {
      const t = {
        height: this.height,
        collapsed: this.collapsed,
        speedIndex: this.speedIndex,
        loopMode: this.loopMode,
        isAutofit: this.isAutofit,
        showEaseCurves: this.showEaseCurves,
        selectedTimeline: this.selectedTimelineName,
        playrangeStart: this.playrangeStart,
        playrangeEnd: this.playrangeEnd
      };
      localStorage.setItem(B, JSON.stringify(t));
    } catch {
    }
  }
  applyLoadedSettings() {
    var t, e;
    this.collapsed && this.container.classList.add("collapsed"), this.showEaseCurves && (this.container.classList.add("show-ease-curves"), (t = this.shadow.querySelector('[data-action="ease-curves"]')) == null || t.classList.add("active")), this.isAutofit && ((e = this.shadow.querySelector('[data-action="autofit"]')) == null || e.classList.add("active")), this.updateLoopIcon(), this.updateLoopMenuSelection(), this.updateSpeedDisplay(), this.container.style.height = `${this.height}px`, this.updatePlayrangeDisplay();
  }
  disconnectedCallback() {
    this.detachTimeline(), this.clearBodyPadding();
  }
  setTimeline(t) {
    this.detachTimeline(), this.timeline = t, it(), this.timelineData = et(t), t.eventCallback("onUpdate", () => this.onTimelineUpdate()), t.eventCallback("onComplete", () => this.updatePlayState()), t.eventCallback("onReverseComplete", () => this.updatePlayState()), t.timeScale(A[this.speedIndex]), t.repeat(this.loopMode === "loop" ? -1 : 0), this.renderTracks(), this.updatePlayhead(), this.updateTimeDisplay(), this.updatePlayState(), this.updatePlayrangeDisplay(), requestAnimationFrame(() => this.applyAutofit());
  }
  updateTimelineSelector() {
    Promise.resolve().then(() => W).then(({ TimelineViewer: t }) => {
      const e = t.getTimelines();
      this.timelineMenu.innerHTML = "", e.forEach((i, a) => {
        const o = document.createElement("button");
        o.className = "gtv-dropdown-item", o.dataset.timeline = a, o.innerHTML = `<span>${a}</span>`, o.addEventListener("click", (n) => {
          n.stopPropagation(), this.selectTimeline(a), this.timelineMenu.hidePopover();
        }), this.timelineMenu.appendChild(o);
      }), this.updateTimelineDisplay();
    });
  }
  selectTimeline(t) {
    this.selectedTimelineName = t, this.updateTimelineDisplay(), t && Promise.resolve().then(() => W).then(({ TimelineViewer: e }) => {
      var i;
      (i = e.getInstance()) == null || i.select(t);
    }), this.saveSettings();
  }
  updateTimelineDisplay() {
    const t = this.timelineDropdown.querySelector(".gtv-timeline-value");
    t.textContent = this.selectedTimelineName || "Select timeline", this.timelineMenu.querySelectorAll("[data-timeline]").forEach((e) => {
      const i = e.dataset.timeline;
      e.classList.toggle("selected", i === this.selectedTimelineName);
    });
  }
  setSelectedTimeline(t) {
    this.selectedTimelineName = t, this.updateTimelineDisplay(), this.saveSettings();
  }
  detachTimeline() {
    this.timeline && (this.timeline.eventCallback("onUpdate", null), this.timeline.eventCallback("onComplete", null), this.timeline.eventCallback("onReverseComplete", null), this.timeline = null, this.timelineData = null);
  }
  render() {
    this.shadow.innerHTML = `
      <style>${st}</style>
      <div class="gtv-container ${this.collapsed ? "collapsed" : ""}" style="height: ${this.height}px;">
        <!-- Resize Handle (at top of container) -->
        <div class="gtv-resize-handle"></div>

        <!-- Controls Bar -->
        <div class="gtv-controls">
          <div class="gtv-controls-left">
            <div class="gtv-dropdown gtv-timeline-dropdown">
              <button class="gtv-btn gtv-dropdown-trigger gtv-timeline-trigger" title="Select timeline">
                <span class="gtv-timeline-value">Select timeline</span>
                <svg class="gtv-dropdown-caret" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
              </button>
              <div class="gtv-dropdown-menu" id="timeline-menu" popover>
              </div>
            </div>
          </div>

          <div class="gtv-controls-center">
            <button class="gtv-btn" data-action="rewind" title="Rewind (R)">
              <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>
            </button>
            <button class="gtv-btn gtv-btn-play" data-action="play" title="Play/Pause (Space)">
              <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <div class="gtv-dropdown gtv-loop-dropdown">
              <button class="gtv-btn gtv-dropdown-trigger" title="Loop mode">
                <svg class="icon-oneshot" viewBox="0 0 24 24"><path d="M5 12h14M14 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg class="icon-loop" viewBox="0 0 24 24" style="display: none;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                <svg class="icon-pingpong" viewBox="0 0 24 24" style="display: none;"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
              </button>
              <div class="gtv-dropdown-menu" id="loop-menu" popover>
                <button class="gtv-dropdown-item" data-loop="oneshot">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M14 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>One Shot</span>
                </button>
                <button class="gtv-dropdown-item" data-loop="loop">
                  <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                  <span>Loop</span>
                </button>
                <button class="gtv-dropdown-item" data-loop="pingpong">
                  <svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
                  <span>Ping Pong</span>
                </button>
              </div>
            </div>
            <div class="gtv-dropdown gtv-speed-dropdown">
              <button class="gtv-btn gtv-dropdown-trigger gtv-speed-trigger" title="Playback speed">
                <span class="gtv-speed-value">1x</span>
              </button>
              <div class="gtv-dropdown-menu" id="speed-menu" popover>
                <button class="gtv-dropdown-item" data-speed="0.25"><span>0.25x</span></button>
                <button class="gtv-dropdown-item" data-speed="0.5"><span>0.5x</span></button>
                <button class="gtv-dropdown-item selected" data-speed="1"><span>1x</span></button>
                <button class="gtv-dropdown-item" data-speed="2"><span>2x</span></button>
                <button class="gtv-dropdown-item" data-speed="4"><span>4x</span></button>
              </div>
            </div>
            <div class="gtv-dropdown gtv-zoom-dropdown">
              <button class="gtv-btn gtv-dropdown-trigger gtv-zoom-trigger" title="Timeline zoom (+/-/0)">
                <span class="gtv-zoom-value">Fit</span>
              </button>
              <div class="gtv-dropdown-menu" id="zoom-menu" popover>
                <button class="gtv-dropdown-item selected" data-zoom="1"><span>Fit</span></button>
                <button class="gtv-dropdown-item" data-zoom="2"><span>200%</span></button>
                <button class="gtv-dropdown-item" data-zoom="4"><span>400%</span></button>
                <button class="gtv-dropdown-item" data-zoom="6"><span>600%</span></button>
                <button class="gtv-dropdown-item" data-zoom="8"><span>800%</span></button>
                <button class="gtv-dropdown-item" data-zoom="10"><span>1000%</span></button>
              </div>
            </div>
          </div>

          <div class="gtv-controls-right">
            <span class="gtv-time-display">
              <span class="gtv-time-current">0.00</span>
              <span class="gtv-time-total"> / 0.00</span>
            </span>
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

        <!-- Playrange Bar (always visible) -->
        <div class="gtv-playrange-bar">
          <div class="gtv-playrange-scroll">
            <div class="gtv-playrange-inner">
              <div class="gtv-playrange-track">
                <div class="gtv-playrange-inactive-left"></div>
                <div class="gtv-playrange-active"></div>
                <div class="gtv-playrange-inactive-right"></div>
                <div class="gtv-playrange-fill"></div>
                <div class="gtv-playrange-scrubber"></div>
              </div>
              <div class="gtv-playrange-handle gtv-playrange-handle-start" data-handle="start"></div>
              <div class="gtv-playrange-handle gtv-playrange-handle-end" data-handle="end"></div>
            </div>
          </div>
        </div>

        <!-- Timeline Area (hidden when collapsed) -->
        <div class="gtv-timeline-area">
          <!-- Ruler -->
          <div class="gtv-ruler">
            <div class="gtv-ruler-inner">
              <div class="gtv-ruler-playhead-head"></div>
            </div>
          </div>

          <!-- Tracks -->
          <div class="gtv-tracks-container">
            <div class="gtv-tracks-scroll">
              <div class="gtv-scrub-area"></div>
              <!-- Playhead line inside tracksScroll for consistent coordinate system -->
              <!-- Playhead head is in ruler-inner for visual positioning -->
              <div class="gtv-playhead">
                <div class="gtv-playhead-line"></div>
              </div>
            </div>
            <div class="gtv-empty">No timeline attached. Call setTimeline() to visualize a GSAP timeline.</div>
          </div>
        </div>
      </div>
    `, this.container = this.shadow.querySelector(".gtv-container"), this.playBtn = this.shadow.querySelector('[data-action="play"]'), this.loopDropdown = this.shadow.querySelector(".gtv-loop-dropdown"), this.loopMenu = this.shadow.querySelector("#loop-menu"), this.speedDropdown = this.shadow.querySelector(".gtv-speed-dropdown"), this.speedMenu = this.shadow.querySelector("#speed-menu"), this.zoomDropdown = this.shadow.querySelector(".gtv-zoom-dropdown"), this.zoomMenu = this.shadow.querySelector("#zoom-menu"), this.timelineDropdown = this.shadow.querySelector(".gtv-timeline-dropdown"), this.timelineMenu = this.shadow.querySelector("#timeline-menu"), this.timeDisplay = this.shadow.querySelector(".gtv-time-display"), this.ruler = this.shadow.querySelector(".gtv-ruler"), this.rulerInner = this.shadow.querySelector(".gtv-ruler-inner"), this.rulerPlayheadHead = this.shadow.querySelector(".gtv-ruler-playhead-head"), this.tracksContainer = this.shadow.querySelector(".gtv-tracks-container"), this.tracksScroll = this.shadow.querySelector(".gtv-tracks-scroll"), this.playrangeScroll = this.shadow.querySelector(".gtv-playrange-scroll"), this.playrangeInner = this.shadow.querySelector(".gtv-playrange-inner"), this.playhead = this.shadow.querySelector(".gtv-playhead"), this.scrubArea = this.shadow.querySelector(".gtv-scrub-area"), this.resizeHandle = this.shadow.querySelector(".gtv-resize-handle");
  }
  setupEventListeners() {
    this.shadow.addEventListener("click", (s) => {
      const m = s.target.closest("[data-action]");
      if (!m) return;
      switch (m.dataset.action) {
        case "play":
          this.togglePlay();
          break;
        case "rewind":
          this.playReverse();
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
      m.blur();
    });
    const t = this.loopDropdown.querySelector(".gtv-dropdown-trigger");
    let e = !1;
    t.addEventListener("mousedown", () => {
      e = this.loopMenu.matches(":popover-open");
    }), t.addEventListener("click", (s) => {
      s.stopPropagation(), this.speedMenu.hidePopover(), this.timelineMenu.hidePopover(), this.zoomMenu.hidePopover(), e || this.loopMenu.showPopover();
    }), this.loopMenu.addEventListener("toggle", (s) => {
      s.newState === "open" ? this.positionPopover(this.loopMenu, t) : t.blur();
    });
    const i = this.speedDropdown.querySelector(".gtv-dropdown-trigger");
    let a = !1;
    i.addEventListener("mousedown", () => {
      a = this.speedMenu.matches(":popover-open");
    }), i.addEventListener("click", (s) => {
      s.stopPropagation(), this.loopMenu.hidePopover(), this.timelineMenu.hidePopover(), this.zoomMenu.hidePopover(), a || this.speedMenu.showPopover();
    }), this.speedMenu.addEventListener("toggle", (s) => {
      s.newState === "open" ? this.positionPopover(this.speedMenu, i) : i.blur();
    }), this.speedMenu.querySelectorAll("[data-speed]").forEach((s) => {
      s.addEventListener("click", (g) => {
        g.stopPropagation();
        const m = parseFloat(s.dataset.speed);
        this.setSpeed(m), this.speedMenu.hidePopover();
      });
    });
    const o = this.zoomDropdown.querySelector(".gtv-dropdown-trigger");
    let n = !1;
    o.addEventListener("mousedown", () => {
      n = this.zoomMenu.matches(":popover-open");
    }), o.addEventListener("click", (s) => {
      s.stopPropagation(), this.loopMenu.hidePopover(), this.speedMenu.hidePopover(), this.timelineMenu.hidePopover(), n || this.zoomMenu.showPopover();
    }), this.zoomMenu.addEventListener("toggle", (s) => {
      s.newState === "open" ? this.positionPopover(this.zoomMenu, o) : o.blur();
    }), this.zoomMenu.querySelectorAll("[data-zoom]").forEach((s) => {
      s.addEventListener("click", (g) => {
        g.stopPropagation();
        const m = parseFloat(s.dataset.zoom);
        this.setZoom(m), this.zoomMenu.hidePopover();
      });
    });
    const l = this.timelineDropdown.querySelector(".gtv-dropdown-trigger");
    let p = !1;
    l.addEventListener("mousedown", () => {
      p = this.timelineMenu.matches(":popover-open");
    }), l.addEventListener("click", (s) => {
      s.stopPropagation(), this.loopMenu.hidePopover(), this.speedMenu.hidePopover(), this.zoomMenu.hidePopover(), p || this.timelineMenu.showPopover();
    }), this.timelineMenu.addEventListener("toggle", (s) => {
      s.newState === "open" ? this.positionPopover(this.timelineMenu, l) : l.blur();
    }), this.loopMenu.querySelectorAll("[data-loop]").forEach((s) => {
      s.addEventListener("click", (g) => {
        g.stopPropagation();
        const m = s.dataset.loop;
        this.setLoopMode(m), this.loopMenu.hidePopover();
      });
    }), this.shadow.addEventListener("click", (s) => {
      const g = s.target, m = g.closest(".gtv-track-bar");
      if (m) {
        const h = m.closest(".gtv-track");
        (h == null ? void 0 : h.dataset.expandable) === "true" && (s.stopPropagation(), h.classList.toggle("expanded"), requestAnimationFrame(() => {
          this.applyAutofit(), this.updateContentAlignment();
        }));
      }
      const v = g.closest(".gtv-group-header");
      if (v) {
        const h = v.closest(".gtv-timeline-group");
        if ((h == null ? void 0 : h.dataset.expandable) === "true") {
          s.stopPropagation();
          const S = !h.classList.contains("expanded");
          h.classList.toggle("expanded"), requestAnimationFrame(() => {
            this.applyAutofit(), S && this.updateContentAlignmentForElement(h.querySelector(".gtv-group-children"));
          });
        }
      }
    }), this.scrubArea.addEventListener("mousedown", (s) => this.startScrub(s)), this.shadow.querySelector(".gtv-ruler").addEventListener("mousedown", (s) => this.startScrub(s)), this.shadow.querySelector(".gtv-tracks-container").addEventListener("mousedown", (s) => {
      s.target.closest(".gtv-track-bar") || this.startScrub(s);
    }), document.addEventListener("mousemove", (s) => {
      this.onScrub(s), this.onResize(s), this.onPlayrangeDrag(s), this.onScrubberDrag(s);
    }), document.addEventListener("mouseup", () => {
      this.endScrub(), this.endResize(), this.endPlayrangeDrag(), this.endScrubberDrag();
    }), this.resizeHandle.addEventListener("mousedown", (s) => this.startResize(s)), this.shadow.querySelectorAll(".gtv-playrange-handle").forEach((s) => {
      s.addEventListener("mousedown", (g) => this.startPlayrangeDrag(g));
    });
    const u = this.shadow.querySelector(".gtv-playrange-scrubber");
    u && u.addEventListener("mousedown", (s) => this.startScrubberDrag(s)), document.addEventListener("keydown", (s) => {
      if (s.target === document.body)
        switch (s.code) {
          case "Space":
            s.preventDefault(), this.togglePlay();
            break;
          case "KeyJ":
            s.preventDefault(), this.jumpToPrevPoint();
            break;
          case "KeyK":
            s.preventDefault(), this.jumpToNextPoint();
            break;
          case "KeyR":
            s.preventDefault(), this.playReverse();
            break;
          case "KeyO":
            s.preventDefault(), this.setLoopMode("oneshot");
            break;
          case "KeyL":
            s.preventDefault(), this.setLoopMode("loop");
            break;
          case "KeyP":
            s.preventDefault(), this.setLoopMode("pingpong");
            break;
          case "BracketLeft":
            s.preventDefault(), this.setPlayrangeStart();
            break;
          case "BracketRight":
            s.preventDefault(), this.setPlayrangeEnd();
            break;
          case "Backslash":
            s.preventDefault(), this.resetPlayrange();
            break;
          case "Equal":
          case "NumpadAdd":
            s.preventDefault(), this.zoomIn();
            break;
          case "Minus":
          case "NumpadSubtract":
            s.preventDefault(), this.zoomOut();
            break;
          case "Digit0":
          case "Numpad0":
            s.preventDefault(), this.resetZoom();
            break;
        }
    }), this.tracksContainer.addEventListener("scroll", () => {
      this.ruler.scrollLeft = this.tracksContainer.scrollLeft, this.playrangeScroll.scrollLeft = this.tracksContainer.scrollLeft;
    }), this.playrangeScroll.addEventListener("scroll", () => {
      this.ruler.scrollLeft = this.playrangeScroll.scrollLeft, this.tracksContainer.scrollLeft = this.playrangeScroll.scrollLeft;
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
  startPlayrangeDrag(t) {
    t.preventDefault(), t.stopPropagation();
    const e = t.target.closest(".gtv-playrange-handle");
    e && (this.draggingPlayrange = e.dataset.handle, document.body.style.cursor = "ew-resize", document.body.style.userSelect = "none");
  }
  onPlayrangeDrag(t) {
    if (!this.draggingPlayrange) return;
    const e = this.playrangeInner, i = this.playrangeScroll;
    if (!e || !i) return;
    const a = i.getBoundingClientRect(), o = i.scrollLeft, n = e.offsetWidth, p = Math.max(0, Math.min(t.clientX - a.left + o, n)) / n;
    this.draggingPlayrange === "start" ? this.playrangeStart = Math.min(p, this.playrangeEnd - 0.01) : this.playrangeEnd = Math.max(p, this.playrangeStart + 0.01), this.updatePlayrangeDisplay();
  }
  endPlayrangeDrag() {
    this.draggingPlayrange && (this.draggingPlayrange = null, document.body.style.cursor = "", document.body.style.userSelect = "", this.saveSettings());
  }
  startScrubberDrag(t) {
    this.timeline && (t.preventDefault(), t.stopPropagation(), this.draggingScrubber = !0, document.body.style.cursor = "ew-resize", document.body.style.userSelect = "none", this.onScrubberDrag(t));
  }
  onScrubberDrag(t) {
    if (!this.draggingScrubber || !this.timeline) return;
    const e = this.playrangeInner, i = this.playrangeScroll;
    if (!e || !i) return;
    const a = i.getBoundingClientRect(), o = i.scrollLeft, n = e.offsetWidth;
    let p = Math.max(0, Math.min(t.clientX - a.left + o, n)) / n;
    p = Math.max(this.playrangeStart, Math.min(p, this.playrangeEnd)), this.timeline.progress(p), this.timeline.pause(), this.updatePlayState();
  }
  endScrubberDrag() {
    this.draggingScrubber && (this.draggingScrubber = !1, document.body.style.cursor = "", document.body.style.userSelect = "");
  }
  updatePlayrangeDisplay() {
    const t = this.shadow.querySelector(".gtv-playrange-handle-start"), e = this.shadow.querySelector(".gtv-playrange-handle-end"), i = this.shadow.querySelector(".gtv-playrange-active"), a = this.shadow.querySelector(".gtv-playrange-inactive-left"), o = this.shadow.querySelector(".gtv-playrange-inactive-right");
    if (t && e && i && a && o) {
      const n = this.playrangeStart * 100, l = this.playrangeEnd * 100;
      t.style.left = `${n}%`, e.style.left = `${l}%`, i.style.left = `${n}%`, i.style.width = `${l - n}%`, a.style.width = `${n}%`, o.style.width = `${100 - l}%`;
    }
  }
  setPlayrangeStart() {
    if (!this.timeline) return;
    const t = this.timeline.progress();
    Math.abs(t - this.playrangeStart) < 1e-3 ? this.playrangeStart = 0 : this.playrangeStart = Math.min(t, this.playrangeEnd - 0.01), this.updatePlayrangeDisplay(), this.saveSettings();
  }
  setPlayrangeEnd() {
    if (!this.timeline) return;
    const t = this.timeline.progress();
    Math.abs(t - this.playrangeEnd) < 1e-3 ? this.playrangeEnd = 1 : this.playrangeEnd = Math.max(t, this.playrangeStart + 0.01), this.updatePlayrangeDisplay(), this.saveSettings();
  }
  resetPlayrange() {
    this.playrangeStart = 0, this.playrangeEnd = 1, this.updatePlayrangeDisplay(), this.saveSettings();
  }
  updateBodyPadding() {
    if (!this.manageBodyPadding) return;
    const t = this.collapsed ? R : this.height;
    document.body.style.paddingBottom = `${t}px`;
  }
  clearBodyPadding() {
    this.manageBodyPadding && (document.body.style.paddingBottom = "");
  }
  scrubToPosition(t) {
    if (!this.timeline || !this.timelineData) return;
    const e = this.tracksScroll, i = e.getBoundingClientRect(), a = e.offsetWidth, n = Math.max(0, Math.min(t.clientX - i.left, a)) / a;
    this.timeline.progress(n), this.timeline.pause(), this.updatePlayState();
  }
  togglePlay() {
    if (!this.timeline) return;
    const t = this.timeline.progress(), e = t <= this.playrangeStart, i = t >= this.playrangeEnd;
    this.timeline.paused() || i || e ? i && !this.timeline.reversed() ? (this.timeline.progress(this.playrangeStart), this.timeline.play()) : e && this.timeline.reversed() ? (this.timeline.reversed(!1), this.timeline.play()) : this.timeline.play() : this.timeline.pause(), this.updatePlayState();
  }
  playReverse() {
    this.timeline && (this.timeline.progress() === 0 && this.timeline.progress(1), this.timeline.reverse(), this.updatePlayState());
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
    const t = Math.round(this.timeline.time() * 1e3) / 1e3, e = this.getTimePoints(), i = this.playrangeStart * this.timelineData.duration;
    let a = i;
    for (const o of e)
      if (o < t - 1e-3 && o >= i)
        a = o;
      else if (o >= t)
        break;
    this.timeline.time(Math.max(a, i)), this.timeline.pause(), this.updatePlayState();
  }
  jumpToNextPoint() {
    if (!this.timeline || !this.timelineData) return;
    const t = Math.round(this.timeline.time() * 1e3) / 1e3, e = this.getTimePoints(), i = this.playrangeEnd * this.timelineData.duration;
    let a = i;
    for (const o of e)
      if (o > t + 1e-3 && o <= i) {
        a = o;
        break;
      }
    this.timeline.time(Math.min(a, i)), this.timeline.pause(), this.updatePlayState();
  }
  positionPopover(t, e) {
    const i = e.getBoundingClientRect(), a = t.getBoundingClientRect(), o = i.left + i.width / 2 - a.width / 2;
    let n;
    this.collapsed ? n = i.top - a.height - 4 : n = i.bottom + 4, t.style.position = "fixed", t.style.left = `${o}px`, t.style.top = `${n}px`, t.style.margin = "0";
  }
  setLoopMode(t) {
    this.loopMode = t, this.updateLoopIcon(), this.updateLoopMenuSelection(), this.timeline && this.timeline.repeat(this.loopMode === "loop" ? -1 : 0), this.saveSettings();
  }
  updateLoopIcon() {
    const t = this.loopDropdown.querySelector(".gtv-dropdown-trigger"), e = t.querySelector(".icon-oneshot"), i = t.querySelector(".icon-loop"), a = t.querySelector(".icon-pingpong");
    e.style.display = this.loopMode === "oneshot" ? "block" : "none", i.style.display = this.loopMode === "loop" ? "block" : "none", a.style.display = this.loopMode === "pingpong" ? "block" : "none";
    const o = {
      oneshot: "One Shot",
      loop: "Loop",
      pingpong: "Ping Pong"
    };
    t.setAttribute("title", o[this.loopMode]);
  }
  updateLoopMenuSelection() {
    this.loopDropdown.querySelectorAll("[data-loop]").forEach((t) => {
      const e = t.dataset.loop;
      t.classList.toggle("selected", e === this.loopMode);
    });
  }
  setSpeed(t) {
    this.speedIndex = A.indexOf(t), this.timeline && this.timeline.timeScale(t), this.updateSpeedDisplay(), this.saveSettings();
  }
  updateSpeedDisplay() {
    const t = A[this.speedIndex], e = this.speedDropdown.querySelector(".gtv-speed-value");
    e.textContent = `${t}x`, this.speedMenu.querySelectorAll("[data-speed]").forEach((i) => {
      const a = parseFloat(i.dataset.speed);
      i.classList.toggle("selected", a === t);
    });
  }
  setZoom(t) {
    this.zoomLevel = t, this.updateZoomDisplay(), this.renderTracks();
  }
  zoomIn() {
    const t = this.zoomLevels.indexOf(this.zoomLevel);
    t < this.zoomLevels.length - 1 && this.setZoom(this.zoomLevels[t + 1]);
  }
  zoomOut() {
    const t = this.zoomLevels.indexOf(this.zoomLevel);
    t > 0 && this.setZoom(this.zoomLevels[t - 1]);
  }
  resetZoom() {
    this.setZoom(1);
  }
  updateZoomDisplay() {
    const t = this.zoomDropdown.querySelector(".gtv-zoom-value");
    t.textContent = this.zoomLevel === 1 ? "Fit" : `${this.zoomLevel * 100}%`, this.zoomMenu.querySelectorAll("[data-zoom]").forEach((e) => {
      const i = parseFloat(e.dataset.zoom);
      e.classList.toggle("selected", i === this.zoomLevel);
    });
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
    t.forEach((u) => {
      if (e += i, u.classList.contains("expanded")) {
        const s = u.querySelectorAll(".gtv-stagger-child");
        e += s.length * a;
      }
    });
    const o = 24, n = 16, l = 100, p = window.innerHeight - 100;
    this.height = Math.max(l, Math.min(R + o + e + n, p)), this.container.style.height = `${this.height}px`, this.updateBodyPadding();
  }
  updatePlayState() {
    if (!this.timeline) return;
    const t = this.timeline.progress(), e = t >= this.playrangeEnd, i = t <= this.playrangeStart;
    this.isPlaying = !this.timeline.paused() && !(e && !this.timeline.reversed()) && !(i && this.timeline.reversed());
    const a = this.playBtn.querySelector(".play-icon"), o = this.playBtn.querySelector(".pause-icon");
    a.style.display = this.isPlaying ? "none" : "block", o.style.display = this.isPlaying ? "block" : "none";
  }
  onTimelineUpdate() {
    this.updatePlayhead(), this.updateTimeDisplay(), this.updateActiveTracks(), this.updatePlayState(), this.checkPlayrangeConstraint();
  }
  checkPlayrangeConstraint() {
    if (!this.timeline || this.timeline.paused()) return;
    const t = this.timeline.progress();
    if (this.loopMode === "pingpong") {
      t >= this.playrangeEnd && !this.timeline.reversed() ? this.timeline.reverse() : t <= this.playrangeStart && this.timeline.reversed() && (this.timeline.reversed(!1), this.timeline.play());
      return;
    }
    this.playrangeStart === 0 && this.playrangeEnd === 1 || (t >= this.playrangeEnd ? this.loopMode === "loop" ? this.timeline.progress(this.playrangeStart) : (this.timeline.progress(this.playrangeEnd), this.timeline.pause(), this.updatePlayState()) : t < this.playrangeStart && this.timeline.progress(this.playrangeStart));
  }
  updatePlayhead() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.progress(), e = `${t * 100}%`;
    this.playhead.style.left = e, this.rulerPlayheadHead.style.left = e;
    const i = this.shadow.querySelector(".gtv-playrange-fill"), a = this.shadow.querySelector(".gtv-playrange-scrubber");
    if (i) {
      const o = this.playrangeStart * 100, n = t * 100;
      i.style.left = `${o}%`, i.style.width = `${Math.max(0, n - o)}%`;
    }
    a && (a.style.left = `${t * 100}%`);
  }
  updateTimeDisplay() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.time(), e = this.timelineData.duration, i = this.timeDisplay.querySelector(".gtv-time-current"), a = this.timeDisplay.querySelector(".gtv-time-total");
    i.textContent = T(t), a.textContent = ` / ${T(e)}`;
  }
  updateActiveTracks() {
    if (!this.timeline || !this.timelineData) return;
    const t = this.timeline.time();
    this.tracksScroll.querySelectorAll(".gtv-track-bar").forEach((i, a) => {
      const o = this.timelineData.tweens[a], n = t >= o.startTime && t <= o.endTime, l = i.dataset.color;
      n ? i.style.background = `var(--gtv-track-${l}-active)` : i.style.background = `var(--gtv-track-${l})`;
    });
  }
  renderTracks() {
    if (!this.timelineData) return;
    const { duration: t, tweens: e, groups: i } = this.timelineData, a = this.shadow.querySelector(".gtv-empty");
    a.style.display = e.length > 0 ? "none" : "flex";
    const o = `${this.zoomLevel * 100}%`;
    this.tracksScroll.style.width = o, this.rulerInner.style.width = o, this.playrangeInner.style.width = o, this.renderRuler(t);
    const n = this.renderGridLines(t), l = /* @__PURE__ */ new Map();
    i.forEach((v, h) => {
      l.set(v.id, h % 6);
    });
    const p = [], u = /* @__PURE__ */ new Map();
    e.forEach((v) => {
      if (v.parentTimelineId) {
        const h = u.get(v.parentTimelineId);
        h ? h.push(v) : u.set(v.parentTimelineId, [v]);
      } else
        p.push(v);
    });
    let s = "";
    p.forEach((v) => {
      s += this.renderTrack(v, t);
    }), i.forEach((v) => {
      const h = u.get(v.id) || [];
      h.length > 0 && (s += this.renderGroup(v, h, t, l.get(v.id) || 0));
    });
    const g = this.tracksScroll.querySelector(".gtv-scrub-area"), m = this.tracksScroll.querySelector(".gtv-playhead");
    this.tracksScroll.innerHTML = n + s, this.tracksScroll.prepend(g), this.tracksScroll.appendChild(m), this.scrubArea = g, this.playhead = m, this.updateContentAlignment();
  }
  /**
   * Dynamically update bar content alignment based on actual DOM measurements.
   * Right-aligns bars whose content would overflow past the timeline boundary.
   */
  updateContentAlignment() {
    this.updateContentAlignmentForElement(this.tracksScroll);
  }
  /**
   * Update content alignment for bars within a specific container element.
   */
  updateContentAlignmentForElement(t) {
    if (!t) return;
    const e = this.tracksScroll.offsetWidth;
    e !== 0 && t.querySelectorAll(".gtv-group-bar, .gtv-track-bar").forEach((i) => {
      const a = i;
      let o = a.offsetLeft, n = a.offsetParent;
      for (; n && n !== this.tracksScroll; )
        o += n.offsetLeft, n = n.offsetParent;
      const l = a.scrollWidth, p = o + l;
      a.classList.toggle("gtv-align-right", p > e);
    });
  }
  renderGridLines(t) {
    const e = [], i = this.calculateInterval(t);
    for (let a = 0; a <= t; a += i) {
      const o = a / t * 100;
      e.push(`<div class="gtv-grid-line" style="left: ${o}%;"></div>`);
    }
    return e.join("");
  }
  renderRuler(t) {
    const e = [], i = this.calculateInterval(t);
    for (let o = 0; o <= t; o += i) {
      const n = o / t * 100;
      e.push(`
        <div class="gtv-ruler-marker" style="left: ${n}%;">
          <div class="gtv-ruler-marker-line"></div>
          <span class="gtv-ruler-marker-label">${T(o, !1)}s</span>
        </div>
      `);
    }
    const a = this.rulerInner.querySelector(".gtv-ruler-playhead-head");
    this.rulerInner.innerHTML = e.join(""), this.rulerInner.appendChild(a), this.rulerPlayheadHead = a, this.renderLabelLines(t);
  }
  renderLabelLines(t) {
    var o, n;
    const e = this.shadow.querySelector(".gtv-labels-wrapper");
    if (e && e.remove(), !((n = (o = this.timelineData) == null ? void 0 : o.labels) != null && n.length)) return;
    const i = this.shadow.querySelector(".gtv-timeline-area");
    if (!i) return;
    const a = document.createElement("div");
    a.className = "gtv-labels-wrapper";
    for (const l of this.timelineData.labels) {
      const p = l.time / t * 100, s = (p < 10 ? "right" : "left") === "left" ? "translateX(-100%) translateX(-4px)" : "translateX(4px)", g = document.createElement("div");
      g.className = "gtv-label-line", g.style.left = `${p}%`, g.innerHTML = `<span class="gtv-label-line-text" style="transform: ${s};">${l.name}</span>`, a.appendChild(g);
    }
    i.appendChild(a);
  }
  calculateInterval(t) {
    return t <= 1 ? 0.25 : t <= 3 ? 0.5 : t <= 10 ? 1 : t <= 30 ? 5 : 10;
  }
  renderEaseCurve(t, e, i) {
    if (!(t != null && t.length)) return "";
    let a = [...t];
    if (e && e > 0) {
      const y = 1 + e, w = [];
      for (let M = 0; M < y; M++) {
        const E = i && M % 2 === 1 ? [...t].reverse() : t, D = M === 0 ? 0 : 1;
        for (let $ = D; $ < E.length; $++)
          w.push(E[$]);
      }
      a = w;
    }
    const o = Math.min(...a), n = Math.max(...a), l = Math.min(0, o), p = Math.max(1, n), u = p - l || 1, s = 5, g = 100 - s * 2, m = a.map((y, w) => {
      const M = w / (a.length - 1) * 100, k = s + (p - y) / u * g;
      return { x: M, y: k };
    }), v = m.map((y) => `${y.x},${y.y}`).join(" L"), h = s + (p - 0) / u * g, S = `M0,${h} L${v} L100,${h} Z`, L = `M${m.map((y) => `${y.x},${y.y}`).join(" L")}`, P = Math.random().toString(36).substr(2, 9), b = `ease-grad-${P}`, x = `ease-clip-${P}`;
    return `
      <svg class="gtv-ease-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${b}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--track-color)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--track-color)" stop-opacity="0" />
          </linearGradient>
          <clipPath id="${x}">
            <rect x="0" y="0" width="100" height="100" />
          </clipPath>
        </defs>
        <path class="gtv-ease-fill" d="${S}" fill="url(#${b})" clip-path="url(#${x})" />
        <path class="gtv-ease-stroke" d="${L}" />
      </svg>
    `;
  }
  /**
   * Determine label position class based on bar width and position.
   * Currently disabled - labels always stay inside bars with overflow hidden.
   */
  getLabelPositionClass(t, e, i) {
    return "";
  }
  renderGroup(t, e, i, a) {
    const o = t.startTime / i * 100, n = (t.endTime - t.startTime) / i * 100, l = t.endTime - t.startTime, u = [220, 70, 350, 160, 290, 25][a % 6], s = a + 1, g = e.map((L) => this.renderTrack(L, i, a)).join("");
    let m = "", v = "", h = "";
    if (t.positionOffset !== void 0) {
      const L = t.positionOffset > 0, P = Math.abs(t.positionOffset) / i * 100;
      L ? (h = `${T(t.positionOffset)}s`, v = `<span class="gtv-offset-badge">${h}</span>`, m = `<div class="gtv-overlap-region" style="left: ${o}%; width: ${P}%;"></div>`) : (h = `+${T(Math.abs(t.positionOffset))}s`, v = `<span class="gtv-offset-badge">${h}</span>`, m = `<div class="gtv-gap-connector" style="left: ${o - P}%; width: ${P}%;"></div>`);
    }
    const S = `${T(l)}s · ${t.tweenCount} tweens`;
    return `
      <div class="gtv-timeline-group" data-group-id="${t.id}" data-expandable="true">
        <div class="gtv-group-header" style="--group-color: var(--gtv-track-${s}); --track-hue: ${u};">
          ${m}
          <div class="gtv-group-bar" style="left: ${o}%; width: ${n}%;">
            <span class="gtv-group-expand"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg></span>
            <span class="gtv-group-name">${t.name}</span>
            <span class="gtv-group-info">${S}</span>
            ${v}
          </div>
        </div>
        <div class="gtv-group-children" style="--group-border-color: var(--gtv-track-${s});">
          ${g}
        </div>
      </div>
    `;
  }
  renderTrack(t, e, i) {
    const a = t.startTime / e * 100, o = t.duration / e * 100, n = i !== void 0 ? i : t.colorIndex, l = n + 1, u = [220, 70, 350, 160, 290, 25][n % 6], s = this.renderEaseCurve(t.easeSamples, t.repeat, t.yoyo), g = this.getLabelPositionClass(t.label, o, a);
    let m = "";
    t.hasStagger && t.staggerChildren && t.staggerChildren.length > 0 && (m = '<span class="gtv-track-stagger"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg></span>');
    let v = "";
    if (t.repeat && t.repeat > 0) {
      const b = t.yoyo ? " ↔" : "";
      v = `<span class="gtv-repeat-badge">↻${t.repeat}${b}</span>`;
    }
    let h = "";
    if (t.staggerChildren && t.staggerChildren.length > 0) {
      const b = t.staggerChildren.map((x) => {
        const y = x.startTime / e * 100, w = (x.endTime - x.startTime) / e * 100, M = this.getLabelPositionClass(x.targetLabel, w, y);
        return `
          <div class="gtv-stagger-child">
            <div class="gtv-stagger-child-bar"
                 style="left: ${y}%; width: ${w}%; background: var(--gtv-track-${l}); --track-color: var(--gtv-track-${l}); --track-hue: ${u};">
              ${s}
              <span class="gtv-track-label${M ? " " + M : ""}">${x.targetLabel}</span>
            </div>
          </div>
        `;
      }).join("");
      h = `<div class="gtv-stagger-children" data-for="${t.id}">${b}</div>`;
    }
    let S = "", L = "", P = "";
    if (t.overlapWithPrev !== void 0) {
      const b = t.overlapWithPrev > 0, x = Math.abs(t.overlapWithPrev) / e * 100;
      b ? (P = `${T(t.overlapWithPrev)}s`, L = `<span class="gtv-offset-badge">${P}</span>`, S = `<div class="gtv-overlap-region" style="left: ${a}%; width: ${x}%;"></div>`) : (P = `+${T(Math.abs(t.overlapWithPrev))}s`, L = `<span class="gtv-offset-badge">${P}</span>`, S = `<div class="gtv-gap-connector" style="left: ${a - x}%; width: ${x}%;"></div>`);
    }
    return `
      <div class="gtv-track"
           data-expandable="${t.hasStagger && t.staggerChildren ? "true" : "false"}">
        ${S}
        <div class="gtv-track-bar"
             data-color="${l}"
             data-tween-id="${t.id}"
             style="left: ${a}%; width: ${o}%; background: var(--gtv-track-${l}); --track-color: var(--gtv-track-${l}); --track-hue: ${u};">
          ${s}
          ${m}
          <span class="gtv-track-label${g ? " " + g : ""}">${t.label}</span>
          ${v}
          ${L}
        </div>
        ${h}
      </div>
    `;
  }
}
customElements.define("gsap-timeline-viewer", G);
const z = /* @__PURE__ */ new Map();
let f = null, N = !0, ot = 0, I = null;
const O = /* @__PURE__ */ new WeakSet();
let C = null;
function rt() {
  if (I) return I;
  const c = window;
  return c.gsap || c.GSAP || null;
}
function j() {
  const c = rt();
  if (!(c != null && c.globalTimeline)) return;
  c.globalTimeline.getChildren(!1, !1, !0).forEach((t) => {
    if (O.has(t)) return;
    O.add(t);
    const e = t.vars || {};
    let i;
    e.id && typeof e.id == "string" ? i = e.id : i = `Timeline ${++ot}`;
    let a = i, o = 1;
    for (; z.has(a); )
      a = `${i} (${++o})`;
    z.set(a, t), f && (f.htmlElement.updateTimelineSelector(), z.size === 1 && f.select(a));
  });
}
function lt() {
  C || (j(), C = setInterval(j, 500));
}
function dt() {
  C && (clearInterval(C), C = null);
}
class H {
  constructor(r = {}) {
    d(this, "element");
    d(this, "currentTimelineName", null);
    this.element = document.createElement("gsap-timeline-viewer"), r.height && this.element.style.setProperty("--viewer-height", `${r.height}px`);
  }
  /**
   * Create and attach the timeline viewer to the page.
   * Call this once - subsequent calls return the existing instance.
   */
  static create(r = {}) {
    return f || (r.gsap && (I = r.gsap, K(r.gsap)), N = r.autoDetect !== !1, f = new H(r), document.body.appendChild(f.element), N && lt(), setTimeout(() => {
      if (f.element.updateTimelineSelector(), r.defaultTimeline && z.has(r.defaultTimeline))
        f.select(r.defaultTimeline);
      else if (z.size > 0) {
        const t = z.keys().next().value;
        t && f.select(t);
      }
    }, 0), f);
  }
  /**
   * Register a timeline with a name so it appears in the dropdown.
   */
  static register(r, t) {
    z.set(r, t), f && (f.element.updateTimelineSelector(), z.size === 1 && f.select(r));
  }
  /**
   * Unregister a timeline.
   */
  static unregister(r) {
    z.delete(r), f && f.element.updateTimelineSelector();
  }
  /**
   * Get all registered timelines.
   */
  static getTimelines() {
    return z;
  }
  /**
   * Get the viewer instance (if created).
   */
  static getInstance() {
    return f;
  }
  /**
   * Select a timeline by name.
   */
  select(r) {
    const t = z.get(r);
    t && (this.currentTimelineName = r, this.element.setTimeline(t), this.element.setSelectedTimeline(r));
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
    dt(), this.element.remove(), f = null;
  }
  get htmlElement() {
    return this.element;
  }
}
const W = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TimelineViewer: H,
  TimelineViewerElement: G
}, Symbol.toStringTag, { value: "Module" }));
export {
  H as TimelineViewer,
  G as TimelineViewerElement
};
