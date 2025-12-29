import { parseTimeline, resetCounter, type TweenData, type TimelineData, type TimelineGroupData } from './utils/gsap-parser';
import { formatTime } from './utils/time-formatter';
import styles from './styles/styles.css?inline';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];
const STORAGE_KEY = 'gsap-timeline-viewer-settings';

type LoopMode = 'oneshot' | 'loop' | 'pingpong';

interface StoredSettings {
  height: number;
  collapsed: boolean;
  speedIndex: number;
  loopMode: LoopMode;
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
  private loopMode: LoopMode = 'oneshot';
  private speedIndex = 2; // 1x
  private zoomLevel = 1; // 1 = fit all
  private readonly zoomLevels = [1, 2, 4, 6, 8, 10];
  private collapsed = false;
  private height = 200;
  private isDragging = false;
  private manageBodyPadding = true;
  private isAutofit = false;
  private showEaseCurves = false;
  private playrangeStart = 0;   // 0-1 progress
  private playrangeEnd = 1;     // 0-1 progress
  private draggingPlayrange: 'start' | 'end' | null = null;
  private draggingScrubber = false;

  // DOM references
  private container!: HTMLDivElement;
  private playBtn!: HTMLButtonElement;
  private loopDropdown!: HTMLDivElement;
  private loopMenu!: HTMLDivElement;
  private speedDropdown!: HTMLDivElement;
  private speedMenu!: HTMLDivElement;
  private zoomDropdown!: HTMLDivElement;
  private zoomMenu!: HTMLDivElement;
  private timelineDropdown!: HTMLDivElement;
  private timelineMenu!: HTMLDivElement;
  private timeDisplay!: HTMLSpanElement;
  private ruler!: HTMLDivElement;
  private rulerInner!: HTMLDivElement;
  private rulerPlayheadHead!: HTMLDivElement;
  private tracksContainer!: HTMLDivElement;
  private tracksScroll!: HTMLDivElement;
  private playrangeScroll!: HTMLDivElement;
  private playrangeInner!: HTMLDivElement;
  private playhead!: HTMLDivElement;
  private scrubArea!: HTMLDivElement;
  private resizeHandle!: HTMLDivElement;
  private selectedTimelineName = '';
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
        this.loopMode = settings.loopMode ?? 'oneshot';
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
        loopMode: this.loopMode,
        isAutofit: this.isAutofit,
        showEaseCurves: this.showEaseCurves,
        selectedTimeline: this.selectedTimelineName,
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
    this.updateLoopIcon();
    this.updateLoopMenuSelection();
    this.updateSpeedDisplay();
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
    timeline.eventCallback('onComplete', () => this.updatePlayState());
    timeline.eventCallback('onReverseComplete', () => this.updatePlayState());

    // Apply saved settings to the timeline
    timeline.timeScale(SPEED_OPTIONS[this.speedIndex]);
    timeline.repeat(this.loopMode === 'loop' ? -1 : 0);

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

      // Clear and rebuild menu items
      this.timelineMenu.innerHTML = '';

      // Add registered timelines
      timelines.forEach((_, name) => {
        const btn = document.createElement('button');
        btn.className = 'gtv-dropdown-item';
        btn.dataset.timeline = name;
        btn.innerHTML = `<span>${name}</span>`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectTimeline(name);
          this.timelineMenu.hidePopover();
        });
        this.timelineMenu.appendChild(btn);
      });

      // Update selection display
      this.updateTimelineDisplay();
    });
  }

  private selectTimeline(name: string) {
    this.selectedTimelineName = name;
    this.updateTimelineDisplay();
    if (name) {
      import('./index').then(({ TimelineViewer }) => {
        TimelineViewer.getInstance()?.select(name);
      });
    }
    this.saveSettings();
  }

  private updateTimelineDisplay() {
    const valueSpan = this.timelineDropdown.querySelector('.gtv-timeline-value')!;
    valueSpan.textContent = this.selectedTimelineName || 'Select timeline';

    // Update menu selection
    this.timelineMenu.querySelectorAll('[data-timeline]').forEach(item => {
      const itemName = (item as HTMLElement).dataset.timeline;
      item.classList.toggle('selected', itemName === this.selectedTimelineName);
    });
  }

  setSelectedTimeline(name: string) {
    this.selectedTimelineName = name;
    this.updateTimelineDisplay();
    this.saveSettings();
  }

  private detachTimeline() {
    if (this.timeline) {
      this.timeline.eventCallback('onUpdate', null);
      this.timeline.eventCallback('onComplete', null);
      this.timeline.eventCallback('onReverseComplete', null);
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
    `;

    // Cache DOM references
    this.container = this.shadow.querySelector('.gtv-container')!;
    this.playBtn = this.shadow.querySelector('[data-action="play"]')!;
    this.loopDropdown = this.shadow.querySelector('.gtv-loop-dropdown')!;
    this.loopMenu = this.shadow.querySelector('#loop-menu')!;
    this.speedDropdown = this.shadow.querySelector('.gtv-speed-dropdown')!;
    this.speedMenu = this.shadow.querySelector('#speed-menu')!;
    this.zoomDropdown = this.shadow.querySelector('.gtv-zoom-dropdown')!;
    this.zoomMenu = this.shadow.querySelector('#zoom-menu')!;
    this.timelineDropdown = this.shadow.querySelector('.gtv-timeline-dropdown')!;
    this.timelineMenu = this.shadow.querySelector('#timeline-menu')!;
    this.timeDisplay = this.shadow.querySelector('.gtv-time-display')!;
    this.ruler = this.shadow.querySelector('.gtv-ruler')!;
    this.rulerInner = this.shadow.querySelector('.gtv-ruler-inner')!;
    this.rulerPlayheadHead = this.shadow.querySelector('.gtv-ruler-playhead-head')!;
    this.tracksContainer = this.shadow.querySelector('.gtv-tracks-container')!;
    this.tracksScroll = this.shadow.querySelector('.gtv-tracks-scroll')!;
    this.playrangeScroll = this.shadow.querySelector('.gtv-playrange-scroll')!;
    this.playrangeInner = this.shadow.querySelector('.gtv-playrange-inner')!;
    this.playhead = this.shadow.querySelector('.gtv-playhead')!;
    this.scrubArea = this.shadow.querySelector('.gtv-scrub-area')!;
    this.resizeHandle = this.shadow.querySelector('.gtv-resize-handle')!;
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
        case 'rewind':
          this.playReverse();
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

    // Loop dropdown trigger - popovertarget doesn't work in Shadow DOM so handle manually
    const loopTrigger = this.loopDropdown.querySelector('.gtv-dropdown-trigger')!;
    let loopMenuOpen = false;
    loopTrigger.addEventListener('mousedown', () => {
      loopMenuOpen = this.loopMenu.matches(':popover-open');
    });
    loopTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other popovers first
      this.speedMenu.hidePopover();
      this.timelineMenu.hidePopover();
      this.zoomMenu.hidePopover();
      // Only open if it wasn't already open before mousedown
      if (!loopMenuOpen) {
        this.loopMenu.showPopover();
      }
    });

    // Position popover when it opens, blur trigger when it closes
    this.loopMenu.addEventListener('toggle', (e) => {
      const event = e as ToggleEvent;
      if (event.newState === 'open') {
        this.positionPopover(this.loopMenu, loopTrigger as HTMLElement);
      } else {
        (loopTrigger as HTMLElement).blur();
      }
    });

    // Speed dropdown trigger
    const speedTrigger = this.speedDropdown.querySelector('.gtv-dropdown-trigger')!;
    let speedMenuOpen = false;
    speedTrigger.addEventListener('mousedown', () => {
      speedMenuOpen = this.speedMenu.matches(':popover-open');
    });
    speedTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other popovers first
      this.loopMenu.hidePopover();
      this.timelineMenu.hidePopover();
      this.zoomMenu.hidePopover();
      if (!speedMenuOpen) {
        this.speedMenu.showPopover();
      }
    });

    // Position speed popover when it opens, blur trigger when it closes
    this.speedMenu.addEventListener('toggle', (e) => {
      const event = e as ToggleEvent;
      if (event.newState === 'open') {
        this.positionPopover(this.speedMenu, speedTrigger as HTMLElement);
      } else {
        (speedTrigger as HTMLElement).blur();
      }
    });

    // Speed dropdown item clicks
    this.speedMenu.querySelectorAll('[data-speed]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = parseFloat((item as HTMLElement).dataset.speed!);
        this.setSpeed(speed);
        this.speedMenu.hidePopover();
      });
    });

    // Zoom dropdown trigger
    const zoomTrigger = this.zoomDropdown.querySelector('.gtv-dropdown-trigger')!;
    let zoomMenuOpen = false;
    zoomTrigger.addEventListener('mousedown', () => {
      zoomMenuOpen = this.zoomMenu.matches(':popover-open');
    });
    zoomTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other popovers first
      this.loopMenu.hidePopover();
      this.speedMenu.hidePopover();
      this.timelineMenu.hidePopover();
      if (!zoomMenuOpen) {
        this.zoomMenu.showPopover();
      }
    });

    // Position zoom popover when it opens, blur trigger when it closes
    this.zoomMenu.addEventListener('toggle', (e) => {
      const event = e as ToggleEvent;
      if (event.newState === 'open') {
        this.positionPopover(this.zoomMenu, zoomTrigger as HTMLElement);
      } else {
        (zoomTrigger as HTMLElement).blur();
      }
    });

    // Zoom dropdown item clicks
    this.zoomMenu.querySelectorAll('[data-zoom]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const zoom = parseFloat((item as HTMLElement).dataset.zoom!);
        this.setZoom(zoom);
        this.zoomMenu.hidePopover();
      });
    });

    // Timeline dropdown trigger
    const timelineTrigger = this.timelineDropdown.querySelector('.gtv-dropdown-trigger')!;
    let timelineMenuOpen = false;
    timelineTrigger.addEventListener('mousedown', () => {
      timelineMenuOpen = this.timelineMenu.matches(':popover-open');
    });
    timelineTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other popovers first
      this.loopMenu.hidePopover();
      this.speedMenu.hidePopover();
      this.zoomMenu.hidePopover();
      if (!timelineMenuOpen) {
        this.timelineMenu.showPopover();
      }
    });

    // Position timeline popover when it opens, blur trigger when it closes
    this.timelineMenu.addEventListener('toggle', (e) => {
      const event = e as ToggleEvent;
      if (event.newState === 'open') {
        this.positionPopover(this.timelineMenu, timelineTrigger as HTMLElement);
      } else {
        (timelineTrigger as HTMLElement).blur();
      }
    });

    // Loop dropdown item clicks
    this.loopMenu.querySelectorAll('[data-loop]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = (item as HTMLElement).dataset.loop as LoopMode;
        this.setLoopMode(mode);
        this.loopMenu.hidePopover();
      });
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
          // Re-apply autofit and alignment after expand/collapse
          requestAnimationFrame(() => {
            this.applyAutofit();
            this.updateContentAlignment();
          });
        }
      }

      // Group header click to expand/collapse group
      const groupHeader = target.closest('.gtv-group-header') as HTMLElement;
      if (groupHeader) {
        const group = groupHeader.closest('.gtv-timeline-group') as HTMLElement;
        if (group?.dataset.expandable === 'true') {
          e.stopPropagation();
          const isExpanding = !group.classList.contains('expanded');
          group.classList.toggle('expanded');
          // Re-apply autofit and alignment after expand/collapse
          requestAnimationFrame(() => {
            this.applyAutofit();
            // Only check alignment for children when expanding
            if (isExpanding) {
              this.updateContentAlignmentForElement(group.querySelector('.gtv-group-children'));
            }
          });
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
      this.onScrubberDrag(e);
    });
    document.addEventListener('mouseup', () => {
      this.endScrub();
      this.endResize();
      this.endPlayrangeDrag();
      this.endScrubberDrag();
    });

    // Resize handle
    this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));

    // Playrange handle dragging
    this.shadow.querySelectorAll('.gtv-playrange-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => this.startPlayrangeDrag(e as MouseEvent));
    });

    // Scrubber handle dragging (collapsed mode)
    const scrubber = this.shadow.querySelector('.gtv-playrange-scrubber');
    if (scrubber) {
      scrubber.addEventListener('mousedown', (e) => this.startScrubberDrag(e as MouseEvent));
    }

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
        case 'KeyR':
          e.preventDefault();
          this.playReverse();
          break;
        case 'KeyO':
          e.preventDefault();
          this.setLoopMode('oneshot');
          break;
        case 'KeyL':
          e.preventDefault();
          this.setLoopMode('loop');
          break;
        case 'KeyP':
          e.preventDefault();
          this.setLoopMode('pingpong');
          break;
        case 'BracketLeft': // [
          e.preventDefault();
          this.setPlayrangeStart();
          break;
        case 'BracketRight': // ]
          e.preventDefault();
          this.setPlayrangeEnd();
          break;
        case 'Backslash': // \
          e.preventDefault();
          this.resetPlayrange();
          break;
        case 'Equal': // + (or =)
        case 'NumpadAdd':
          e.preventDefault();
          this.zoomIn();
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          this.zoomOut();
          break;
        case 'Digit0':
        case 'Numpad0':
          e.preventDefault();
          this.resetZoom();
          break;
      }
    });

    // Sync scroll between all scrollable containers
    this.tracksContainer.addEventListener('scroll', () => {
      this.ruler.scrollLeft = this.tracksContainer.scrollLeft;
      this.playrangeScroll.scrollLeft = this.tracksContainer.scrollLeft;
    });

    // Sync from playrange scroll to other containers
    this.playrangeScroll.addEventListener('scroll', () => {
      this.ruler.scrollLeft = this.playrangeScroll.scrollLeft;
      this.tracksContainer.scrollLeft = this.playrangeScroll.scrollLeft;
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
    const inner = this.playrangeInner;
    const scroll = this.playrangeScroll;
    if (!inner || !scroll) return;

    // Get scroll container's visible area and scroll position
    const scrollRect = scroll.getBoundingClientRect();
    const scrollPos = scroll.scrollLeft;
    const innerWidth = inner.offsetWidth;

    // Calculate x position relative to the full zoomed inner container
    const x = Math.max(0, Math.min(e.clientX - scrollRect.left + scrollPos, innerWidth));
    const progress = x / innerWidth;

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

  private startScrubberDrag(e: MouseEvent) {
    if (!this.timeline) return;
    e.preventDefault();
    e.stopPropagation();
    this.draggingScrubber = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    this.onScrubberDrag(e);
  }

  private onScrubberDrag(e: MouseEvent) {
    if (!this.draggingScrubber || !this.timeline) return;
    const inner = this.playrangeInner;
    const scroll = this.playrangeScroll;
    if (!inner || !scroll) return;

    // Get scroll container's visible area and scroll position
    const scrollRect = scroll.getBoundingClientRect();
    const scrollPos = scroll.scrollLeft;
    const innerWidth = inner.offsetWidth;

    // Calculate x position relative to the full zoomed inner container
    const x = Math.max(0, Math.min(e.clientX - scrollRect.left + scrollPos, innerWidth));
    let progress = x / innerWidth;

    // Constrain to playrange
    progress = Math.max(this.playrangeStart, Math.min(progress, this.playrangeEnd));
    this.timeline.progress(progress);
    this.timeline.pause();
    this.updatePlayState();
  }

  private endScrubberDrag() {
    if (!this.draggingScrubber) return;
    this.draggingScrubber = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  private updatePlayrangeDisplay() {
    const handleStart = this.shadow.querySelector('.gtv-playrange-handle-start') as HTMLElement;
    const handleEnd = this.shadow.querySelector('.gtv-playrange-handle-end') as HTMLElement;
    const active = this.shadow.querySelector('.gtv-playrange-active') as HTMLElement;
    const inactiveLeft = this.shadow.querySelector('.gtv-playrange-inactive-left') as HTMLElement;
    const inactiveRight = this.shadow.querySelector('.gtv-playrange-inactive-right') as HTMLElement;

    if (handleStart && handleEnd && active && inactiveLeft && inactiveRight) {
      const startPct = this.playrangeStart * 100;
      const endPct = this.playrangeEnd * 100;

      // Position handles using percentages (relative to track, will scroll with content)
      handleStart.style.left = `${startPct}%`;
      handleEnd.style.left = `${endPct}%`;

      // Update active region (lighter area between handles)
      active.style.left = `${startPct}%`;
      active.style.width = `${endPct - startPct}%`;

      // Update inactive regions (darker areas outside handles)
      inactiveLeft.style.width = `${startPct}%`;
      inactiveRight.style.width = `${100 - endPct}%`;
    }
  }

  private setPlayrangeStart() {
    if (!this.timeline) return;
    const progress = this.timeline.progress();
    // If already at start position, reset to 0
    if (Math.abs(progress - this.playrangeStart) < 0.001) {
      this.playrangeStart = 0;
    } else {
      // Don't let start go past end
      this.playrangeStart = Math.min(progress, this.playrangeEnd - 0.01);
    }
    this.updatePlayrangeDisplay();
    this.saveSettings();
  }

  private setPlayrangeEnd() {
    if (!this.timeline) return;
    const progress = this.timeline.progress();
    // If already at end position, reset to 1
    if (Math.abs(progress - this.playrangeEnd) < 0.001) {
      this.playrangeEnd = 1;
    } else {
      // Don't let end go before start
      this.playrangeEnd = Math.max(progress, this.playrangeStart + 0.01);
    }
    this.updatePlayrangeDisplay();
    this.saveSettings();
  }

  private resetPlayrange() {
    this.playrangeStart = 0;
    this.playrangeEnd = 1;
    this.updatePlayrangeDisplay();
    this.saveSettings();
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

    // Use tracksScroll for consistent coordinate system with track rendering
    // Track bars are positioned as % of tracksScroll, so clicking should use the same reference
    const inner = this.tracksScroll;
    const innerRect = inner.getBoundingClientRect();
    const innerWidth = inner.offsetWidth;

    // Calculate position: click relative to inner element's visual position
    const x = Math.max(0, Math.min(e.clientX - innerRect.left, innerWidth));
    const progress = x / innerWidth;

    this.timeline.progress(progress);
    this.timeline.pause();
    this.updatePlayState();
  }

  private togglePlay() {
    if (!this.timeline) return;

    const progress = this.timeline.progress();
    const atStart = progress <= this.playrangeStart;
    const atEnd = progress >= this.playrangeEnd;

    if (this.timeline.paused() || atEnd || atStart) {
      if (atEnd && !this.timeline.reversed()) {
        // At end playing forward, restart from playrange start
        this.timeline.progress(this.playrangeStart);
        this.timeline.play();
      } else if (atStart && this.timeline.reversed()) {
        // At start after reversing, play forward
        this.timeline.reversed(false);
        this.timeline.play();
      } else {
        this.timeline.play();
      }
    } else {
      this.timeline.pause();
    }

    this.updatePlayState();
  }

  private playReverse() {
    if (!this.timeline) return;
    // If at start, seek to end first so reverse has somewhere to go
    if (this.timeline.progress() === 0) {
      this.timeline.progress(1);
    }
    this.timeline.reverse();
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

  private positionPopover(popover: HTMLElement, trigger: HTMLElement) {
    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    // Position centered horizontally
    const left = triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2);

    // Position above when collapsed, below when expanded
    let top: number;
    if (this.collapsed) {
      top = triggerRect.top - popoverRect.height - 4;
    } else {
      top = triggerRect.bottom + 4;
    }

    popover.style.position = 'fixed';
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    popover.style.margin = '0';
  }

  private setLoopMode(mode: LoopMode) {
    this.loopMode = mode;
    this.updateLoopIcon();
    this.updateLoopMenuSelection();
    // Update GSAP repeat based on loop mode
    if (this.timeline) {
      this.timeline.repeat(this.loopMode === 'loop' ? -1 : 0);
    }
    this.saveSettings();
  }

  private updateLoopIcon() {
    const trigger = this.loopDropdown.querySelector('.gtv-dropdown-trigger')!;
    const oneshotIcon = trigger.querySelector('.icon-oneshot') as HTMLElement;
    const loopIcon = trigger.querySelector('.icon-loop') as HTMLElement;
    const pingpongIcon = trigger.querySelector('.icon-pingpong') as HTMLElement;

    oneshotIcon.style.display = this.loopMode === 'oneshot' ? 'block' : 'none';
    loopIcon.style.display = this.loopMode === 'loop' ? 'block' : 'none';
    pingpongIcon.style.display = this.loopMode === 'pingpong' ? 'block' : 'none';

    // Update title for accessibility
    const titles: Record<LoopMode, string> = {
      oneshot: 'One Shot',
      loop: 'Loop',
      pingpong: 'Ping Pong'
    };
    trigger.setAttribute('title', titles[this.loopMode]);
  }

  private updateLoopMenuSelection() {
    this.loopDropdown.querySelectorAll('[data-loop]').forEach(item => {
      const mode = (item as HTMLElement).dataset.loop;
      item.classList.toggle('selected', mode === this.loopMode);
    });
  }

  private setSpeed(speed: number) {
    this.speedIndex = SPEED_OPTIONS.indexOf(speed);
    if (this.timeline) {
      this.timeline.timeScale(speed);
    }
    this.updateSpeedDisplay();
    this.saveSettings();
  }

  private updateSpeedDisplay() {
    const speed = SPEED_OPTIONS[this.speedIndex];
    const valueSpan = this.speedDropdown.querySelector('.gtv-speed-value')!;
    valueSpan.textContent = `${speed}x`;

    // Update menu selection
    this.speedMenu.querySelectorAll('[data-speed]').forEach(item => {
      const itemSpeed = parseFloat((item as HTMLElement).dataset.speed!);
      item.classList.toggle('selected', itemSpeed === speed);
    });
  }

  private setZoom(zoom: number) {
    this.zoomLevel = zoom;
    this.updateZoomDisplay();
    this.renderTracks();
  }

  private zoomIn() {
    const currentIndex = this.zoomLevels.indexOf(this.zoomLevel);
    if (currentIndex < this.zoomLevels.length - 1) {
      this.setZoom(this.zoomLevels[currentIndex + 1]);
    }
  }

  private zoomOut() {
    const currentIndex = this.zoomLevels.indexOf(this.zoomLevel);
    if (currentIndex > 0) {
      this.setZoom(this.zoomLevels[currentIndex - 1]);
    }
  }

  private resetZoom() {
    this.setZoom(1);
  }

  private updateZoomDisplay() {
    const valueSpan = this.zoomDropdown.querySelector('.gtv-zoom-value')!;
    valueSpan.textContent = this.zoomLevel === 1 ? 'Fit' : `${this.zoomLevel * 100}%`;

    // Update menu selection
    this.zoomMenu.querySelectorAll('[data-zoom]').forEach(item => {
      const itemZoom = parseFloat((item as HTMLElement).dataset.zoom!);
      item.classList.toggle('selected', itemZoom === this.zoomLevel);
    });
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

    const progress = this.timeline.progress();
    const atEnd = progress >= this.playrangeEnd;
    const atStart = progress <= this.playrangeStart;

    // Not playing if: paused, at end going forward, or at start going backward
    this.isPlaying = !this.timeline.paused() &&
                     !(atEnd && !this.timeline.reversed()) &&
                     !(atStart && this.timeline.reversed());

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
    // Only apply constraint when playing, not when paused (e.g., after jumping)
    if (this.timeline.paused()) return;

    const progress = this.timeline.progress();

    // Handle ping-pong mode
    if (this.loopMode === 'pingpong') {
      if (progress >= this.playrangeEnd && !this.timeline.reversed()) {
        // Reached end while playing forward - reverse
        this.timeline.reverse();
      } else if (progress <= this.playrangeStart && this.timeline.reversed()) {
        // Reached start while playing backward - play forward
        this.timeline.reversed(false);
        this.timeline.play();
      }
      return;
    }

    // Only apply playrange constraint if range is not full (0-1)
    if (this.playrangeStart === 0 && this.playrangeEnd === 1) return;

    if (progress >= this.playrangeEnd) {
      if (this.loopMode === 'loop') {
        // Loop back to start
        this.timeline.progress(this.playrangeStart);
      } else {
        // One shot: stop at end
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
    const pos = `${progress * 100}%`;
    this.playhead.style.left = pos;
    this.rulerPlayheadHead.style.left = pos;

    // Update collapsed mode progress indicator
    const fill = this.shadow.querySelector('.gtv-playrange-fill') as HTMLElement;
    const scrubber = this.shadow.querySelector('.gtv-playrange-scrubber') as HTMLElement;
    if (fill) {
      // Fill only within playrange (from start marker to current position)
      const startPct = this.playrangeStart * 100;
      const currentPct = progress * 100;
      fill.style.left = `${startPct}%`;
      fill.style.width = `${Math.max(0, currentPct - startPct)}%`;
    }
    if (scrubber) {
      scrubber.style.left = `${progress * 100}%`;
    }
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

    const { duration, tweens, groups } = this.timelineData;

    // Hide empty state
    const emptyState = this.shadow.querySelector('.gtv-empty') as HTMLElement;
    emptyState.style.display = tweens.length > 0 ? 'none' : 'flex';

    // Apply zoom level
    const zoomWidth = `${this.zoomLevel * 100}%`;
    this.tracksScroll.style.width = zoomWidth;
    this.rulerInner.style.width = zoomWidth;
    this.playrangeInner.style.width = zoomWidth;

    // Render ruler markers
    this.renderRuler(duration);

    // Render grid lines
    const gridLines = this.renderGridLines(duration);

    // Build a map of group id -> color index for consistent coloring
    const groupColorMap = new Map<string, number>();
    groups.forEach((group, index) => {
      groupColorMap.set(group.id, index % 6);
    });

    // Group tweens by parentTimelineId
    const ungroupedTweens: TweenData[] = [];
    const groupedTweens = new Map<string, TweenData[]>();

    tweens.forEach(tween => {
      if (tween.parentTimelineId) {
        const existing = groupedTweens.get(tween.parentTimelineId);
        if (existing) {
          existing.push(tween);
        } else {
          groupedTweens.set(tween.parentTimelineId, [tween]);
        }
      } else {
        ungroupedTweens.push(tween);
      }
    });

    // Render all tracks - ungrouped first, then groups
    let tracksHtml = '';

    // Render ungrouped tweens
    ungroupedTweens.forEach(tween => {
      tracksHtml += this.renderTrack(tween, duration);
    });

    // Render groups with their tweens
    groups.forEach(group => {
      const groupTweens = groupedTweens.get(group.id) || [];
      if (groupTweens.length > 0) {
        tracksHtml += this.renderGroup(group, groupTweens, duration, groupColorMap.get(group.id) || 0);
      }
    });

    // Get existing structure elements (playhead and scrubArea are in the initial HTML)
    const scrubArea = this.tracksScroll.querySelector('.gtv-scrub-area')!;
    const playhead = this.tracksScroll.querySelector('.gtv-playhead')!;

    // Clear and rebuild
    this.tracksScroll.innerHTML = gridLines + tracksHtml;
    this.tracksScroll.prepend(scrubArea);
    this.tracksScroll.appendChild(playhead);

    // Re-attach references
    this.scrubArea = scrubArea as HTMLDivElement;
    this.playhead = playhead as HTMLDivElement;

    // Update content alignment based on actual DOM measurements
    this.updateContentAlignment();
  }

  /**
   * Dynamically update bar content alignment based on actual DOM measurements.
   * Right-aligns bars whose content would overflow past the timeline boundary.
   */
  private updateContentAlignment(): void {
    this.updateContentAlignmentForElement(this.tracksScroll);
  }

  /**
   * Update content alignment for bars within a specific container element.
   */
  private updateContentAlignmentForElement(container: Element | null): void {
    if (!container) return;

    const timelineWidth = this.tracksScroll.offsetWidth;
    if (timelineWidth === 0) return;

    // Check all bars (group-bar and track-bar) within the container
    container.querySelectorAll('.gtv-group-bar, .gtv-track-bar').forEach(bar => {
      const el = bar as HTMLElement;

      // Calculate absolute left position relative to tracksScroll
      // (handles nested elements inside groups)
      let absoluteLeft = el.offsetLeft;
      let parent = el.offsetParent as HTMLElement | null;
      while (parent && parent !== this.tracksScroll) {
        absoluteLeft += parent.offsetLeft;
        parent = parent.offsetParent as HTMLElement | null;
      }

      const contentWidth = el.scrollWidth;
      const contentEnd = absoluteLeft + contentWidth;

      // If content extends past timeline boundary, right-align
      el.classList.toggle('gtv-align-right', contentEnd > timelineWidth);
    });
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

    // Preserve the playhead head element before clearing innerHTML
    const playheadHead = this.rulerInner.querySelector('.gtv-ruler-playhead-head')!;
    this.rulerInner.innerHTML = markers.join('');
    this.rulerInner.appendChild(playheadHead);
    this.rulerPlayheadHead = playheadHead as HTMLDivElement;

    // Render label lines in timeline area (full height)
    this.renderLabelLines(duration);
  }

  private renderLabelLines(duration: number) {
    // Remove existing label wrapper
    const existingWrapper = this.shadow.querySelector('.gtv-labels-wrapper');
    if (existingWrapper) existingWrapper.remove();

    if (!this.timelineData?.labels?.length) return;

    const timelineArea = this.shadow.querySelector('.gtv-timeline-area');
    if (!timelineArea) return;

    // Create wrapper with same padding as playhead
    const wrapper = document.createElement('div');
    wrapper.className = 'gtv-labels-wrapper';

    for (const label of this.timelineData.labels) {
      const left = (label.time / duration) * 100;
      // Position text on right if near start (< 10%), otherwise on left
      const textPosition = left < 10 ? 'right' : 'left';
      const textTransform = textPosition === 'left'
        ? 'translateX(-100%) translateX(-4px)'
        : 'translateX(4px)';

      const labelEl = document.createElement('div');
      labelEl.className = 'gtv-label-line';
      labelEl.style.left = `${left}%`;
      labelEl.innerHTML = `<span class="gtv-label-line-text" style="transform: ${textTransform};">${label.name}</span>`;
      wrapper.appendChild(labelEl);
    }

    timelineArea.appendChild(wrapper);
  }

  private calculateInterval(duration: number): number {
    if (duration <= 1) return 0.25;
    if (duration <= 3) return 0.5;
    if (duration <= 10) return 1;
    if (duration <= 30) return 5;
    return 10;
  }

  private renderEaseCurve(samples: number[] | undefined, repeat?: number, yoyo?: boolean): string {
    if (!samples?.length) return '';

    // Build expanded samples array for repeat/yoyo
    let expandedSamples: number[] = [...samples];

    if (repeat && repeat > 0) {
      const totalIterations = 1 + repeat; // original + repeats
      const allSamples: number[] = [];

      for (let i = 0; i < totalIterations; i++) {
        // For yoyo, alternate direction
        const isReversed = yoyo && i % 2 === 1;
        const iterSamples = isReversed ? [...samples].reverse() : samples;

        // Skip first point of subsequent iterations to avoid duplicate at join
        const startIdx = i === 0 ? 0 : 1;
        for (let j = startIdx; j < iterSamples.length; j++) {
          allSamples.push(iterSamples[j]);
        }
      }
      expandedSamples = allSamples;
    }

    // Find actual range (elastic/bounce/back can go outside 0-1)
    const minY = Math.min(...expandedSamples);
    const maxY = Math.max(...expandedSamples);
    const yMin = Math.min(0, minY);
    const yMax = Math.max(1, maxY);
    const yRange = yMax - yMin || 1;

    // Add vertical padding for stroke (so it doesn't get clipped at top/bottom)
    const padY = 5;
    const contentHeight = 100 - padY * 2;

    // Map values to SVG coordinates, scaled to actual range, with vertical padding
    const points = expandedSamples.map((y, i) => {
      const x = (i / (expandedSamples.length - 1)) * 100;
      const yPos = padY + ((yMax - y) / yRange) * contentHeight;
      return { x, y: yPos };
    });

    const curvePoints = points.map(p => `${p.x},${p.y}`).join(' L');

    // Bottom of fill area (y=0 line position, with padding)
    const bottomY = padY + ((yMax - 0) / yRange) * contentHeight;

    const fillPath = `M0,${bottomY} L${curvePoints} L100,${bottomY} Z`;
    const strokePath = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`;

    // Unique IDs for gradient and clip
    const uid = Math.random().toString(36).substr(2, 9);
    const gradientId = `ease-grad-${uid}`;
    const clipId = `ease-clip-${uid}`;

    return `
      <svg class="gtv-ease-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--track-color)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--track-color)" stop-opacity="0" />
          </linearGradient>
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="100" height="100" />
          </clipPath>
        </defs>
        <path class="gtv-ease-fill" d="${fillPath}" fill="url(#${gradientId})" clip-path="url(#${clipId})" />
        <path class="gtv-ease-stroke" d="${strokePath}" />
      </svg>
    `;
  }

  /**
   * Determine label position class based on bar width and position.
   * Currently disabled - labels always stay inside bars with overflow hidden.
   */
  private getLabelPositionClass(_label: string, _widthPercent: number, _leftPercent: number): string {
    // Smart label positioning disabled - too aggressive and causes display issues
    // Labels stay inside bars with text-overflow: ellipsis
    return '';
  }


  private renderGroup(group: TimelineGroupData, tweens: TweenData[], totalDuration: number, colorIndex: number): string {
    const left = (group.startTime / totalDuration) * 100;
    const width = ((group.endTime - group.startTime) / totalDuration) * 100;
    const groupDuration = group.endTime - group.startTime;
    const trackHues = [220, 70, 350, 160, 290, 25];
    const hue = trackHues[colorIndex % 6];
    const cssColorIndex = colorIndex + 1;

    // Render child tweens
    const childTracksHtml = tweens
      .map(tween => this.renderTrack(tween, totalDuration, colorIndex))
      .join('');

    // Overlap/gap visual indicator and inline offset badge
    let overlapHtml = '';
    let offsetBadge = '';
    let offsetText = '';
    if (group.positionOffset !== undefined) {
      const isOverlap = group.positionOffset > 0;
      const overlapWidth = (Math.abs(group.positionOffset) / totalDuration) * 100;

      if (isOverlap) {
        offsetText = `${formatTime(group.positionOffset)}s`;
        offsetBadge = `<span class="gtv-offset-badge">${offsetText}</span>`;
        overlapHtml = `<div class="gtv-overlap-region" style="left: ${left}%; width: ${overlapWidth}%;"></div>`;
      } else {
        offsetText = `+${formatTime(Math.abs(group.positionOffset))}s`;
        offsetBadge = `<span class="gtv-offset-badge">${offsetText}</span>`;
        const gapLeft = left - overlapWidth;
        overlapHtml = `<div class="gtv-gap-connector" style="left: ${gapLeft}%; width: ${overlapWidth}%;"></div>`;
      }
    }

    const infoText = `${formatTime(groupDuration)}s · ${group.tweenCount} tweens`;

    return `
      <div class="gtv-timeline-group" data-group-id="${group.id}" data-expandable="true">
        <div class="gtv-group-header" style="--group-color: var(--gtv-track-${cssColorIndex}); --track-hue: ${hue};">
          ${overlapHtml}
          <div class="gtv-group-bar" style="left: ${left}%; width: ${width}%;">
            <span class="gtv-group-expand"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg></span>
            <span class="gtv-group-name">${group.name}</span>
            <span class="gtv-group-info">${infoText}</span>
            ${offsetBadge}
          </div>
        </div>
        <div class="gtv-group-children" style="--group-border-color: var(--gtv-track-${cssColorIndex});">
          ${childTracksHtml}
        </div>
      </div>
    `;
  }

  private renderTrack(tween: TweenData, totalDuration: number, groupColorIndex?: number): string {
    const left = (tween.startTime / totalDuration) * 100;
    const width = (tween.duration / totalDuration) * 100;
    // Use group color if part of a group, otherwise use tween's own color
    const effectiveColorIndex = groupColorIndex !== undefined ? groupColorIndex : tween.colorIndex;
    const colorIndex = effectiveColorIndex + 1;
    const trackHues = [220, 70, 350, 160, 290, 25]; // Matches CSS track colors
    const hue = trackHues[effectiveColorIndex % 6];

    // Ease curve SVG (includes repeat/yoyo pattern)
    const easeCurveHtml = this.renderEaseCurve(tween.easeSamples, tween.repeat, tween.yoyo);

    // Determine label positioning
    const labelPosClass = this.getLabelPositionClass(tween.label, width, left);

    // Stagger indicator - just dropdown arrow
    let staggerLabel = '';
    if (tween.hasStagger && tween.staggerChildren && tween.staggerChildren.length > 0) {
      staggerLabel = `<span class="gtv-track-stagger"><svg class="gtv-expand-icon" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg></span>`;
    }

    // Repeat/yoyo indicator
    let repeatLabel = '';
    if (tween.repeat && tween.repeat > 0) {
      const yoyoIndicator = tween.yoyo ? ' ↔' : '';
      repeatLabel = `<span class="gtv-repeat-badge">↻${tween.repeat}${yoyoIndicator}</span>`;
    }

    // Build stagger children HTML
    let childrenHtml = '';
    if (tween.staggerChildren && tween.staggerChildren.length > 0) {
      const childBars = tween.staggerChildren.map((child) => {
        const childLeft = (child.startTime / totalDuration) * 100;
        const childWidth = ((child.endTime - child.startTime) / totalDuration) * 100;
        const childLabelPosClass = this.getLabelPositionClass(child.targetLabel, childWidth, childLeft);
        return `
          <div class="gtv-stagger-child">
            <div class="gtv-stagger-child-bar"
                 style="left: ${childLeft}%; width: ${childWidth}%; background: var(--gtv-track-${colorIndex}); --track-color: var(--gtv-track-${colorIndex}); --track-hue: ${hue};">
              ${easeCurveHtml}
              <span class="gtv-track-label${childLabelPosClass ? ' ' + childLabelPosClass : ''}">${child.targetLabel}</span>
            </div>
          </div>
        `;
      }).join('');

      childrenHtml = `<div class="gtv-stagger-children" data-for="${tween.id}">${childBars}</div>`;
    }

    // Overlap/gap visual indicator (just the line/region, badge is now inside track-bar)
    let overlapHtml = '';
    let offsetBadge = '';
    let offsetText = '';
    if (tween.overlapWithPrev !== undefined) {
      const isOverlap = tween.overlapWithPrev > 0;
      const overlapWidth = (Math.abs(tween.overlapWithPrev) / totalDuration) * 100;

      if (isOverlap) {
        // Overlap: show relative offset (negative)
        offsetText = `${formatTime(tween.overlapWithPrev)}s`;
        offsetBadge = `<span class="gtv-offset-badge">${offsetText}</span>`;
        overlapHtml = `<div class="gtv-overlap-region" style="left: ${left}%; width: ${overlapWidth}%;"></div>`;
      } else {
        // Gap: show relative offset (positive)
        offsetText = `+${formatTime(Math.abs(tween.overlapWithPrev))}s`;
        offsetBadge = `<span class="gtv-offset-badge">${offsetText}</span>`;
        const gapLeft = left - overlapWidth;
        overlapHtml = `<div class="gtv-gap-connector" style="left: ${gapLeft}%; width: ${overlapWidth}%;"></div>`;
      }
    }

    return `
      <div class="gtv-track"
           data-expandable="${tween.hasStagger && tween.staggerChildren ? 'true' : 'false'}">
        ${overlapHtml}
        <div class="gtv-track-bar"
             data-color="${colorIndex}"
             data-tween-id="${tween.id}"
             style="left: ${left}%; width: ${width}%; background: var(--gtv-track-${colorIndex}); --track-color: var(--gtv-track-${colorIndex}); --track-hue: ${hue};">
          ${easeCurveHtml}
          ${staggerLabel}
          <span class="gtv-track-label${labelPosClass ? ' ' + labelPosClass : ''}">${tween.label}</span>
          ${repeatLabel}
          ${offsetBadge}
        </div>
        ${childrenHtml}
      </div>
    `;
  }
}

// Register the custom element
customElements.define('gsap-timeline-viewer', TimelineViewerElement);
