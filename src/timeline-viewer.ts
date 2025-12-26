import { parseTimeline, resetCounter, type TweenData, type TimelineData } from './utils/gsap-parser';
import { formatTime } from './utils/time-formatter';
import styles from './styles/styles.css?inline';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];
const STORAGE_KEY = 'gsap-timeline-viewer-settings';

interface StoredSettings {
  height: number;
  collapsed: boolean;
  speedIndex: number;
  isLooping: boolean;
  isAutofit: boolean;
  showEaseCurves: boolean;
  selectedTimeline?: string;
  playrangeStart?: number;  // 0-1 progress
  playrangeEnd?: number;    // 0-1 progress
}

export interface TimelineViewerOptions {
  timeline?: gsap.core.Timeline;
  height?: number;
  collapsed?: boolean;
  manageBodyPadding?: boolean;
}

const CONTROLS_HEIGHT = 40;
const PLAYRANGE_HEIGHT = 16;
const COLLAPSED_HEIGHT = CONTROLS_HEIGHT + PLAYRANGE_HEIGHT;

export class TimelineViewerElement extends HTMLElement {
  private shadow: ShadowRoot;
  private timeline: gsap.core.Timeline | null = null;
  private timelineData: TimelineData | null = null;
  private isPlaying = false;
  private isLooping = false;
  private speedIndex = 2; // 1x
  private collapsed = false;
  private height = 200;
  private isDragging = false;
  private manageBodyPadding = true;
  private isAutofit = false;
  private showEaseCurves = false;
  private playrangeStart = 0;   // 0-1 progress
  private playrangeEnd = 1;     // 0-1 progress
  private draggingPlayrange: 'start' | 'end' | null = null;

  // DOM references
  private container!: HTMLDivElement;
  private playBtn!: HTMLButtonElement;
  private loopBtn!: HTMLButtonElement;
  private speedBtn!: HTMLButtonElement;
  private timeDisplay!: HTMLSpanElement;
  private rulerInner!: HTMLDivElement;
  private tracksScroll!: HTMLDivElement;
  private playhead!: HTMLDivElement;
  private scrubArea!: HTMLDivElement;
  private resizeHandle!: HTMLDivElement;
  private timelineSelect!: HTMLSelectElement;
  private isResizing = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.loadSettings();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.updateBodyPadding();
    this.applyLoadedSettings();
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings: StoredSettings = JSON.parse(stored);
        this.height = settings.height ?? 200;
        this.collapsed = settings.collapsed ?? false;
        this.speedIndex = settings.speedIndex ?? 2;
        this.isLooping = settings.isLooping ?? false;
        this.isAutofit = settings.isAutofit ?? false;
        this.showEaseCurves = settings.showEaseCurves ?? false;
        this.playrangeStart = settings.playrangeStart ?? 0;
        this.playrangeEnd = settings.playrangeEnd ?? 1;
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private saveSettings(): void {
    try {
      const settings: StoredSettings = {
        height: this.height,
        collapsed: this.collapsed,
        speedIndex: this.speedIndex,
        isLooping: this.isLooping,
        isAutofit: this.isAutofit,
        showEaseCurves: this.showEaseCurves,
        selectedTimeline: this.timelineSelect?.value,
        playrangeStart: this.playrangeStart,
        playrangeEnd: this.playrangeEnd,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore localStorage errors
    }
  }

  private applyLoadedSettings(): void {
    // Apply visual state from loaded settings
    if (this.collapsed) {
      this.container.classList.add('collapsed');
    }
    if (this.showEaseCurves) {
      this.container.classList.add('show-ease-curves');
      this.shadow.querySelector('[data-action="ease-curves"]')?.classList.add('active');
    }
    if (this.isAutofit) {
      this.shadow.querySelector('[data-action="autofit"]')?.classList.add('active');
    }
    if (this.isLooping) {
      this.loopBtn?.classList.add('active');
    }
    this.speedBtn.textContent = `${SPEED_OPTIONS[this.speedIndex]}x`;
    this.container.style.height = `${this.height}px`;
    this.updatePlayrangeDisplay();
  }

  disconnectedCallback() {
    this.detachTimeline();
    this.clearBodyPadding();
  }

  setTimeline(timeline: gsap.core.Timeline) {
    this.detachTimeline();
    this.timeline = timeline;
    resetCounter();
    this.timelineData = parseTimeline(timeline);

    // Set up GSAP callbacks
    timeline.eventCallback('onUpdate', () => this.onTimelineUpdate());

    // Apply saved settings to the timeline
    timeline.timeScale(SPEED_OPTIONS[this.speedIndex]);
    timeline.repeat(this.isLooping ? -1 : 0);

    this.renderTracks();
    this.updatePlayhead();
    this.updateTimeDisplay();
    this.updatePlayState();
    this.updatePlayrangeDisplay();
    requestAnimationFrame(() => this.applyAutofit());
  }

  updateTimelineSelector() {
    import('./index').then(({ TimelineViewer }) => {
      const timelines = TimelineViewer.getTimelines();
      const currentValue = this.timelineSelect.value;

      // Clear and rebuild options
      this.timelineSelect.innerHTML = '';

      // Add registered timelines
      timelines.forEach((_, name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        this.timelineSelect.appendChild(option);
      });

      // Restore selection if still valid
      if (currentValue && timelines.has(currentValue)) {
        this.timelineSelect.value = currentValue;
      }
    });
  }

  setSelectedTimeline(name: string) {
    this.timelineSelect.value = name;
    this.saveSettings();
  }

  private detachTimeline() {
    if (this.timeline) {
      this.timeline.eventCallback('onUpdate', null);
      this.timeline = null;
      this.timelineData = null;
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="gtv-container ${this.collapsed ? 'collapsed' : ''}" style="height: ${this.height}px;">
        <!-- Resize Handle (at top of container) -->
        <div class="gtv-resize-handle"></div>

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

        <!-- Playrange Bar (always visible) -->
        <div class="gtv-playrange-bar">
          <div class="gtv-playrange-track">
            <div class="gtv-playrange-inactive-left"></div>
            <div class="gtv-playrange-active"></div>
            <div class="gtv-playrange-inactive-right"></div>
          </div>
          <div class="gtv-playrange-handle gtv-playrange-handle-start" data-handle="start"></div>
          <div class="gtv-playrange-handle gtv-playrange-handle-end" data-handle="end"></div>
        </div>

        <!-- Timeline Area (hidden when collapsed) -->
        <div class="gtv-timeline-area">
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
    `;

    // Cache DOM references
    this.container = this.shadow.querySelector('.gtv-container')!;
    this.playBtn = this.shadow.querySelector('[data-action="play"]')!;
    this.loopBtn = this.shadow.querySelector('[data-action="loop"]')!;
    this.speedBtn = this.shadow.querySelector('[data-action="speed"]')!;
    this.timeDisplay = this.shadow.querySelector('.gtv-time-display')!;
    this.rulerInner = this.shadow.querySelector('.gtv-ruler-inner')!;
    this.tracksScroll = this.shadow.querySelector('.gtv-tracks-scroll')!;
    this.playhead = this.shadow.querySelector('.gtv-playhead')!;
    this.scrubArea = this.shadow.querySelector('.gtv-scrub-area')!;
    this.resizeHandle = this.shadow.querySelector('.gtv-resize-handle')!;
    this.timelineSelect = this.shadow.querySelector('.gtv-timeline-select')!;
  }

  private setupEventListeners() {
    // Button clicks
    this.shadow.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-action]') as HTMLElement;
      if (!btn) return;

      const action = btn.dataset.action;
      switch (action) {
        case 'play':
          this.togglePlay();
          break;
        case 'skip-start':
          this.skipToStart();
          break;
        case 'skip-end':
          this.skipToEnd();
          break;
        case 'loop':
          this.toggleLoop();
          break;
        case 'speed':
          this.cycleSpeed();
          break;
        case 'collapse':
          this.toggleCollapse();
          break;
        case 'autofit':
          this.toggleAutofit();
          break;
        case 'ease-curves':
          this.toggleEaseCurves();
          break;
      }

      // Remove focus from button so Space doesn't trigger it again
      (btn as HTMLButtonElement).blur();
    });

    // Timeline selector change
    this.timelineSelect.addEventListener('change', () => {
      const name = this.timelineSelect.value;
      if (name) {
        // Import TimelineViewer to access the registry
        import('./index').then(({ TimelineViewer }) => {
          TimelineViewer.getInstance()?.select(name);
        });
      }
    });

    // Track bar click to expand stagger children
    this.shadow.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const trackBar = target.closest('.gtv-track-bar') as HTMLElement;

      if (trackBar) {
        const track = trackBar.closest('.gtv-track') as HTMLElement;
        if (track?.dataset.expandable === 'true') {
          e.stopPropagation();
          track.classList.toggle('expanded');
          // Re-apply autofit after expand/collapse
          requestAnimationFrame(() => this.applyAutofit());
        }
      }
    });

    // Scrubbing - ruler, tracks background, and scrub area
    this.scrubArea.addEventListener('mousedown', (e) => this.startScrub(e));
    this.shadow.querySelector('.gtv-ruler')!.addEventListener('mousedown', (e) => this.startScrub(e as MouseEvent));
    this.shadow.querySelector('.gtv-tracks-container')!.addEventListener('mousedown', (e) => {
      // Only trigger if clicking on background, not on a track bar
      if ((e.target as HTMLElement).closest('.gtv-track-bar')) return;
      this.startScrub(e as MouseEvent);
    });

    document.addEventListener('mousemove', (e) => {
      this.onScrub(e);
      this.onResize(e);
      this.onPlayrangeDrag(e);
    });
    document.addEventListener('mouseup', () => {
      this.endScrub();
      this.endResize();
      this.endPlayrangeDrag();
    });

    // Resize handle
    this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));

    // Playrange handle dragging
    this.shadow.querySelectorAll('.gtv-playrange-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => this.startPlayrangeDrag(e as MouseEvent));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target !== document.body) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'KeyJ':
          e.preventDefault();
          this.jumpToPrevPoint();
          break;
        case 'KeyK':
          e.preventDefault();
          this.jumpToNextPoint();
          break;
        case 'KeyL':
          e.preventDefault();
          this.toggleLoop();
          break;
      }
    });
  }

  private startScrub(e: MouseEvent) {
    if (!this.timeline) return;
    e.preventDefault();
    this.isDragging = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    this.scrubToPosition(e);
  }

  private onScrub(e: MouseEvent) {
    if (!this.isDragging || !this.timeline) return;
    this.scrubToPosition(e);
  }

  private endScrub() {
    this.isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  private startResize(e: MouseEvent) {
    e.preventDefault();
    this.isResizing = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }

  private onResize(e: MouseEvent) {
    if (!this.isResizing) return;
    const windowHeight = window.innerHeight;
    const newHeight = windowHeight - e.clientY;
    this.height = Math.max(100, Math.min(newHeight, windowHeight - 100));
    this.container.style.height = `${this.height}px`;
    this.updateBodyPadding();
  }

  private endResize() {
    if (!this.isResizing) return;
    this.isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    this.saveSettings();
  }

  private startPlayrangeDrag(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const handle = (e.target as HTMLElement).closest('.gtv-playrange-handle') as HTMLElement;
    if (!handle) return;
    this.draggingPlayrange = handle.dataset.handle as 'start' | 'end';
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }

  private onPlayrangeDrag(e: MouseEvent) {
    if (!this.draggingPlayrange) return;
    const track = this.shadow.querySelector('.gtv-playrange-track') as HTMLElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const progress = x / rect.width;

    if (this.draggingPlayrange === 'start') {
      // Don't let start go past end
      this.playrangeStart = Math.min(progress, this.playrangeEnd - 0.01);
    } else {
      // Don't let end go before start
      this.playrangeEnd = Math.max(progress, this.playrangeStart + 0.01);
    }

    this.updatePlayrangeDisplay();
  }

  private endPlayrangeDrag() {
    if (!this.draggingPlayrange) return;
    this.draggingPlayrange = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    this.saveSettings();
  }

  private updatePlayrangeDisplay() {
    const track = this.shadow.querySelector('.gtv-playrange-track') as HTMLElement;
    const handleStart = this.shadow.querySelector('.gtv-playrange-handle-start') as HTMLElement;
    const handleEnd = this.shadow.querySelector('.gtv-playrange-handle-end') as HTMLElement;
    const active = this.shadow.querySelector('.gtv-playrange-active') as HTMLElement;
    const inactiveLeft = this.shadow.querySelector('.gtv-playrange-inactive-left') as HTMLElement;
    const inactiveRight = this.shadow.querySelector('.gtv-playrange-inactive-right') as HTMLElement;

    if (track && handleStart && handleEnd && active && inactiveLeft && inactiveRight) {
      const startPct = this.playrangeStart * 100;
      const endPct = this.playrangeEnd * 100;

      // Position handles relative to bar using track's offset
      const trackLeft = track.offsetLeft;
      const trackWidth = track.offsetWidth;
      handleStart.style.left = `${trackLeft + (this.playrangeStart * trackWidth)}px`;
      handleEnd.style.left = `${trackLeft + (this.playrangeEnd * trackWidth)}px`;

      // Update active region (lighter area between handles)
      active.style.left = `${startPct}%`;
      active.style.width = `${endPct - startPct}%`;

      // Update inactive regions (darker areas outside handles)
      inactiveLeft.style.width = `${startPct}%`;
      inactiveRight.style.width = `${100 - endPct}%`;
    }
  }

  private updateBodyPadding() {
    if (!this.manageBodyPadding) return;
    const height = this.collapsed ? COLLAPSED_HEIGHT : this.height;
    document.body.style.paddingBottom = `${height}px`;
  }

  private clearBodyPadding() {
    if (!this.manageBodyPadding) return;
    document.body.style.paddingBottom = '';
  }

  private scrubToPosition(e: MouseEvent) {
    if (!this.timeline || !this.timelineData) return;

    const rect = this.rulerInner.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const progress = x / rect.width;

    this.timeline.progress(progress);
    this.timeline.pause();
    this.updatePlayState();
  }

  private togglePlay() {
    if (!this.timeline) return;

    if (this.timeline.paused() || this.timeline.progress() === 1) {
      if (this.timeline.progress() === 1) {
        this.timeline.restart();
      } else {
        this.timeline.play();
      }
    } else {
      this.timeline.pause();
    }

    this.updatePlayState();
  }

  private skipToStart() {
    if (!this.timeline) return;
    this.timeline.progress(0);
    this.timeline.pause();
    this.updatePlayState();
  }

  private skipToEnd() {
    if (!this.timeline) return;
    this.timeline.progress(1);
    this.timeline.pause();
    this.updatePlayState();
  }

  private getTimePoints(): number[] {
    if (!this.timelineData) return [0];
    const points = new Set<number>();
    points.add(0);
    points.add(Math.round(this.timelineData.duration * 1000) / 1000);
    this.timelineData.tweens.forEach(tween => {
      points.add(Math.round(tween.startTime * 1000) / 1000);
      points.add(Math.round(tween.endTime * 1000) / 1000);
    });
    return Array.from(points).sort((a, b) => a - b);
  }

  private jumpToPrevPoint() {
    if (!this.timeline || !this.timelineData) return;
    const currentTime = Math.round(this.timeline.time() * 1000) / 1000;
    const points = this.getTimePoints();

    // Get playrange start boundary in time
    const rangeStart = this.playrangeStart * this.timelineData.duration;

    // Find the largest point that is less than current time, but within playrange
    let prevPoint = rangeStart;
    for (const p of points) {
      if (p < currentTime - 0.001 && p >= rangeStart) {
        prevPoint = p;
      } else if (p >= currentTime) {
        break;
      }
    }

    this.timeline.time(Math.max(prevPoint, rangeStart));
    this.timeline.pause();
    this.updatePlayState();
  }

  private jumpToNextPoint() {
    if (!this.timeline || !this.timelineData) return;
    const currentTime = Math.round(this.timeline.time() * 1000) / 1000;
    const points = this.getTimePoints();

    // Get playrange end boundary in time
    const rangeEnd = this.playrangeEnd * this.timelineData.duration;

    // Find the smallest point that is greater than current time, but within playrange
    let nextPoint = rangeEnd;
    for (const p of points) {
      if (p > currentTime + 0.001 && p <= rangeEnd) {
        nextPoint = p;
        break;
      }
    }

    this.timeline.time(Math.min(nextPoint, rangeEnd));
    this.timeline.pause();
    this.updatePlayState();
  }

  private toggleLoop() {
    if (!this.timeline) return;
    this.isLooping = !this.isLooping;
    this.timeline.repeat(this.isLooping ? -1 : 0);
    this.loopBtn.classList.toggle('active', this.isLooping);
    this.saveSettings();
  }

  private cycleSpeed() {
    if (!this.timeline) return;
    this.speedIndex = (this.speedIndex + 1) % SPEED_OPTIONS.length;
    const speed = SPEED_OPTIONS[this.speedIndex];
    this.timeline.timeScale(speed);
    this.speedBtn.textContent = `${speed}x`;
    this.saveSettings();
  }

  private toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.container.classList.toggle('collapsed', this.collapsed);
    const btn = this.shadow.querySelector('[data-action="collapse"]')!;
    btn.innerHTML = this.collapsed
      ? '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
    this.updateBodyPadding();
    this.saveSettings();
  }

  private toggleAutofit() {
    this.isAutofit = !this.isAutofit;
    const btn = this.shadow.querySelector('[data-action="autofit"]')!;
    btn.classList.toggle('active', this.isAutofit);
    if (this.isAutofit) {
      this.applyAutofit();
    }
    this.saveSettings();
  }

  private toggleEaseCurves() {
    this.showEaseCurves = !this.showEaseCurves;
    const btn = this.shadow.querySelector('[data-action="ease-curves"]')!;
    btn.classList.toggle('active', this.showEaseCurves);
    this.container.classList.toggle('show-ease-curves', this.showEaseCurves);
    this.saveSettings();
  }

  private applyAutofit() {
    if (!this.isAutofit || this.collapsed) return;

    // Calculate height based on actual visible tracks
    const tracks = this.shadow.querySelectorAll('.gtv-track');
    let tracksHeight = 0;
    const trackHeight = 36; // --gtv-track-height
    const childHeight = 30; // slightly smaller for children

    tracks.forEach(track => {
      tracksHeight += trackHeight; // main track
      if (track.classList.contains('expanded')) {
        const children = track.querySelectorAll('.gtv-stagger-child');
        tracksHeight += children.length * childHeight;
      }
    });

    const rulerHeight = 24;
    const padding = 16;
    const minHeight = 100;
    const maxHeight = window.innerHeight - 100;

    this.height = Math.max(minHeight, Math.min(COLLAPSED_HEIGHT + rulerHeight + tracksHeight + padding, maxHeight));
    this.container.style.height = `${this.height}px`;
    this.updateBodyPadding();
  }

  private updatePlayState() {
    if (!this.timeline) return;
    this.isPlaying = !this.timeline.paused() && this.timeline.progress() < 1;

    const playIcon = this.playBtn.querySelector('.play-icon') as HTMLElement;
    const pauseIcon = this.playBtn.querySelector('.pause-icon') as HTMLElement;

    playIcon.style.display = this.isPlaying ? 'none' : 'block';
    pauseIcon.style.display = this.isPlaying ? 'block' : 'none';
  }

  private onTimelineUpdate() {
    this.updatePlayhead();
    this.updateTimeDisplay();
    this.updateActiveTracks();
    this.updatePlayState();
    this.checkPlayrangeConstraint();
  }

  private checkPlayrangeConstraint() {
    if (!this.timeline) return;
    // Only apply playrange constraint if range is not full (0-1)
    if (this.playrangeStart === 0 && this.playrangeEnd === 1) return;
    // Only apply constraint when playing, not when paused (e.g., after jumping)
    if (this.timeline.paused()) return;

    const progress = this.timeline.progress();
    if (progress >= this.playrangeEnd) {
      if (this.isLooping) {
        // Loop back to start
        this.timeline.progress(this.playrangeStart);
      } else {
        // Stop at end
        this.timeline.progress(this.playrangeEnd);
        this.timeline.pause();
        this.updatePlayState();
      }
    } else if (progress < this.playrangeStart) {
      // Constrain to start
      this.timeline.progress(this.playrangeStart);
    }
  }

  private updatePlayhead() {
    if (!this.timeline || !this.timelineData) return;

    const progress = this.timeline.progress();
    this.playhead.style.left = `${progress * 100}%`;
  }

  private updateTimeDisplay() {
    if (!this.timeline || !this.timelineData) return;

    const currentTime = this.timeline.time();
    const totalTime = this.timelineData.duration;

    const currentSpan = this.timeDisplay.querySelector('.gtv-time-current')!;
    const totalSpan = this.timeDisplay.querySelector('.gtv-time-total')!;

    currentSpan.textContent = formatTime(currentTime);
    totalSpan.textContent = ` / ${formatTime(totalTime)}`;
  }

  private updateActiveTracks() {
    if (!this.timeline || !this.timelineData) return;

    const currentTime = this.timeline.time();
    const bars = this.tracksScroll.querySelectorAll('.gtv-track-bar') as NodeListOf<HTMLElement>;

    bars.forEach((bar, index) => {
      const tween = this.timelineData!.tweens[index];
      const isActive = currentTime >= tween.startTime && currentTime <= tween.endTime;
      const colorIndex = bar.dataset.color;

      if (isActive) {
        bar.style.background = `var(--gtv-track-${colorIndex}-active)`;
      } else {
        bar.style.background = `var(--gtv-track-${colorIndex})`;
      }
    });
  }

  private renderTracks() {
    if (!this.timelineData) return;

    const { duration, tweens } = this.timelineData;

    // Hide empty state
    const emptyState = this.shadow.querySelector('.gtv-empty') as HTMLElement;
    emptyState.style.display = tweens.length > 0 ? 'none' : 'flex';

    // Render ruler markers
    this.renderRuler(duration);

    // Render grid lines
    const gridLines = this.renderGridLines(duration);

    // Render track bars
    const tracksHtml = tweens
      .map((tween) => this.renderTrack(tween, duration))
      .join('');

    // Get existing structure elements
    const scrubArea = this.tracksScroll.querySelector('.gtv-scrub-area')!;

    // Clear and rebuild
    this.tracksScroll.innerHTML = gridLines + tracksHtml;
    this.tracksScroll.prepend(scrubArea);

    // Re-attach scrub area reference
    this.scrubArea = scrubArea as HTMLDivElement;
  }

  private renderGridLines(duration: number): string {
    const lines: string[] = [];
    const interval = this.calculateInterval(duration);

    for (let time = 0; time <= duration; time += interval) {
      const left = (time / duration) * 100;
      lines.push(`<div class="gtv-grid-line" style="left: ${left}%;"></div>`);
    }

    return lines.join('');
  }

  private renderRuler(duration: number) {
    const markers: string[] = [];
    const interval = this.calculateInterval(duration);

    for (let time = 0; time <= duration; time += interval) {
      const left = (time / duration) * 100;
      markers.push(`
        <div class="gtv-ruler-marker" style="left: ${left}%;">
          <div class="gtv-ruler-marker-line"></div>
          <span class="gtv-ruler-marker-label">${formatTime(time, false)}s</span>
        </div>
      `);
    }

    this.rulerInner.innerHTML = markers.join('');
  }

  private calculateInterval(duration: number): number {
    if (duration <= 1) return 0.25;
    if (duration <= 3) return 0.5;
    if (duration <= 10) return 1;
    if (duration <= 30) return 5;
    return 10;
  }

  private renderEaseCurve(samples: number[] | undefined): string {
    if (!samples?.length) return '';

    // Find actual range (elastic/bounce/back can go outside 0-1)
    const minY = Math.min(...samples);
    const maxY = Math.max(...samples);
    const yMin = Math.min(0, minY);
    const yMax = Math.max(1, maxY);
    const yRange = yMax - yMin || 1;

    // Map values to SVG coordinates, scaled to actual range
    const points = samples.map((y, i) => {
      const x = (i / (samples.length - 1)) * 100;
      const yPos = ((yMax - y) / yRange) * 100;
      return { x, y: yPos };
    });

    const curvePoints = points.map(p => `${p.x},${p.y}`).join(' L');

    // Bottom of fill area (y=0 line position)
    const bottomY = ((yMax - 0) / yRange) * 100;

    const fillPath = `M0,${bottomY} L${curvePoints} L100,${bottomY} Z`;
    const strokePath = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`;

    // Unique ID for gradient
    const gradientId = `ease-grad-${Math.random().toString(36).substr(2, 9)}`;

    return `
      <svg class="gtv-ease-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--track-color)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--track-color)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path class="gtv-ease-fill" d="${fillPath}" fill="url(#${gradientId})" />
        <path class="gtv-ease-stroke" d="${strokePath}" />
      </svg>
    `;
  }

  private getEaseClipPath(samples: number[] | undefined): string {
    if (!samples?.length) return '';

    // Generate polygon clip-path from ease samples
    const curvePoints = samples.map((y, i) => {
      const x = (i / (samples.length - 1)) * 100;
      const yPos = 100 - (y * 100);  // Flip Y axis
      return `${x}% ${yPos}%`;
    }).join(', ');

    return `polygon(0% 100%, ${curvePoints}, 100% 100%)`;
  }

  private renderTrack(tween: TweenData, totalDuration: number): string {
    const left = (tween.startTime / totalDuration) * 100;
    const width = (tween.duration / totalDuration) * 100;
    const colorIndex = tween.colorIndex + 1;
    const trackHues = [220, 70, 350, 160, 290, 25]; // Matches CSS track colors
    const hue = trackHues[tween.colorIndex % 6];

    // Ease curve SVG
    const easeCurveHtml = this.renderEaseCurve(tween.easeSamples);

    // Stagger indicator with expand arrow
    let staggerLabel = '';
    if (tween.hasStagger && tween.staggerChildren && tween.staggerChildren.length > 0) {
      staggerLabel = `<span class="gtv-track-stagger"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="10" height="10"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg> Stagger</span>`;
    }

    // Build stagger children HTML
    let childrenHtml = '';
    if (tween.staggerChildren && tween.staggerChildren.length > 0) {
      const childBars = tween.staggerChildren.map((child) => {
        const childLeft = (child.startTime / totalDuration) * 100;
        const childWidth = ((child.endTime - child.startTime) / totalDuration) * 100;
        return `
          <div class="gtv-stagger-child">
            <div class="gtv-stagger-child-bar"
                 style="left: ${childLeft}%; width: ${childWidth}%; background: var(--gtv-track-${colorIndex}); --track-color: var(--gtv-track-${colorIndex}); --track-hue: ${hue};">
              ${easeCurveHtml}
              <span class="gtv-track-label">${child.targetLabel}</span>
            </div>
          </div>
        `;
      }).join('');

      childrenHtml = `<div class="gtv-stagger-children" data-for="${tween.id}">${childBars}</div>`;
    }

    // Overlap/gap indicator
    let overlapHtml = '';
    if (tween.overlapWithPrev !== undefined) {
      const isOverlap = tween.overlapWithPrev > 0;
      const overlapWidth = (Math.abs(tween.overlapWithPrev) / totalDuration) * 100;
      const offsetLabel = isOverlap
        ? `-${formatTime(tween.overlapWithPrev)}s`
        : `+${formatTime(Math.abs(tween.overlapWithPrev))}s`;

      // Get clip-path for ease curve clipping
      const easeClipPath = this.getEaseClipPath(tween.easeSamples);

      if (isOverlap) {
        // Overlap: hatched region at the start of this tween
        overlapHtml = `
          <div class="gtv-overlap-region" style="left: ${left}%; width: ${overlapWidth}%; --ease-clip: ${easeClipPath};"></div>
          <span class="gtv-offset-badge gtv-offset-overlap" style="left: ${left}%;">${offsetLabel}</span>
        `;
      } else {
        // Gap: dotted connector before this tween
        const gapLeft = left - overlapWidth;
        overlapHtml = `
          <div class="gtv-gap-connector" style="left: ${gapLeft}%; width: ${overlapWidth}%;"></div>
          <span class="gtv-offset-badge gtv-offset-gap" style="left: ${left}%;">${offsetLabel}</span>
        `;
      }
    }

    return `
      <div class="gtv-track" data-expandable="${tween.hasStagger && tween.staggerChildren ? 'true' : 'false'}">
        ${overlapHtml}
        <div class="gtv-track-bar"
             data-color="${colorIndex}"
             data-tween-id="${tween.id}"
             style="left: ${left}%; width: ${width}%; background: var(--gtv-track-${colorIndex}); --track-color: var(--gtv-track-${colorIndex}); --track-hue: ${hue};">
          ${easeCurveHtml}
          <span class="gtv-track-label">${tween.label}</span>
          ${staggerLabel}
        </div>
        ${childrenHtml}
      </div>
    `;
  }
}

// Register the custom element
customElements.define('gsap-timeline-viewer', TimelineViewerElement);
