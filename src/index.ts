import { TimelineViewerElement } from './timeline-viewer';
import { setGsapRef } from './utils/gsap-parser';

export { TimelineViewerElement };

export interface TimelineViewerConfig {
  height?: number;
  collapsed?: boolean;
  defaultTimeline?: string; // Name of timeline to select by default
  autoDetect?: boolean; // Auto-detect timelines (default: true)
  gsap?: typeof gsap; // Pass gsap instance if using ES modules
}

// Registry of named timelines
const timelineRegistry = new Map<string, gsap.core.Timeline>();
let viewerInstance: TimelineViewer | null = null;
let autoDetectEnabled = true;
let timelineCounter = 0;
let gsapInstance: typeof gsap | null = null;

// Track timelines we've already seen to avoid duplicates
const seenTimelines = new WeakSet<gsap.core.Timeline>();
let scanInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Get gsap object - checks passed instance, window.gsap, or common globals
 */
function getGsap(): typeof gsap | null {
  // First check if gsap was passed to create()
  if (gsapInstance) return gsapInstance;

  // Then check window.gsap
  const win = window as unknown as { gsap?: typeof gsap; GSAP?: typeof gsap };
  return win.gsap || win.GSAP || null;
}

/**
 * Scan GSAP's global timeline for child timelines.
 * This works regardless of how gsap was imported.
 */
function scanForTimelines() {
  const gsapObj = getGsap();
  if (!gsapObj?.globalTimeline) return;

  // Get all child timelines from globalTimeline
  const children = gsapObj.globalTimeline.getChildren(false, false, true) as gsap.core.Timeline[];

  children.forEach((timeline) => {
    // Skip if we've already registered this timeline
    if (seenTimelines.has(timeline)) return;
    seenTimelines.add(timeline);

    // Get name from timeline's vars.id or generate one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vars = (timeline as any).vars || {};
    let name: string;
    if (vars.id && typeof vars.id === 'string') {
      name = vars.id;
    } else {
      name = `Timeline ${++timelineCounter}`;
    }

    // Avoid duplicate names
    let finalName = name;
    let suffix = 1;
    while (timelineRegistry.has(finalName)) {
      finalName = `${name} (${++suffix})`;
    }

    timelineRegistry.set(finalName, timeline);

    // Update viewer if it exists
    if (viewerInstance) {
      viewerInstance.htmlElement.updateTimelineSelector();
      // Auto-select if this is the first timeline
      if (timelineRegistry.size === 1) {
        viewerInstance.select(finalName);
      }
    }
  });
}

/**
 * Start scanning for timelines periodically
 */
function startAutoDetect() {
  if (scanInterval) return;

  // Initial scan
  scanForTimelines();

  // Scan periodically for new timelines
  scanInterval = setInterval(scanForTimelines, 500);
}

/**
 * Stop scanning for timelines
 */
function stopAutoDetect() {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
}

export class TimelineViewer {
  private element: TimelineViewerElement;
  private currentTimelineName: string | null = null;

  private constructor(config: TimelineViewerConfig = {}) {
    this.element = document.createElement('gsap-timeline-viewer') as TimelineViewerElement;

    if (config.height) {
      this.element.style.setProperty('--viewer-height', `${config.height}px`);
    }
  }

  /**
   * Create and attach the timeline viewer to the page.
   * Call this once - subsequent calls return the existing instance.
   */
  static create(config: TimelineViewerConfig = {}): TimelineViewer {
    if (viewerInstance) {
      return viewerInstance;
    }

    // Store gsap instance if provided (required for ES module imports)
    if (config.gsap) {
      gsapInstance = config.gsap;
      setGsapRef(config.gsap);
    }

    // Enable/disable auto-detection (default: true)
    autoDetectEnabled = config.autoDetect !== false;

    viewerInstance = new TimelineViewer(config);
    document.body.appendChild(viewerInstance.element);

    // Start auto-detection (scans gsap.globalTimeline for child timelines)
    if (autoDetectEnabled) {
      startAutoDetect();
    }

    // Auto-select default or first available timeline after a tick
    setTimeout(() => {
      viewerInstance!.element.updateTimelineSelector();
      if (config.defaultTimeline && timelineRegistry.has(config.defaultTimeline)) {
        viewerInstance!.select(config.defaultTimeline);
      } else if (timelineRegistry.size > 0) {
        const firstName = timelineRegistry.keys().next().value as string;
        if (firstName) {
          viewerInstance!.select(firstName);
        }
      }
    }, 0);

    return viewerInstance;
  }

  /**
   * Register a timeline with a name so it appears in the dropdown.
   */
  static register(name: string, timeline: gsap.core.Timeline): void {
    timelineRegistry.set(name, timeline);
    // Update dropdown if viewer exists
    if (viewerInstance) {
      viewerInstance.element.updateTimelineSelector();
      // Auto-select if this is the first timeline
      if (timelineRegistry.size === 1) {
        viewerInstance.select(name);
      }
    }
  }

  /**
   * Unregister a timeline.
   */
  static unregister(name: string): void {
    timelineRegistry.delete(name);
    if (viewerInstance) {
      viewerInstance.element.updateTimelineSelector();
    }
  }

  /**
   * Get all registered timelines.
   */
  static getTimelines(): Map<string, gsap.core.Timeline> {
    return timelineRegistry;
  }

  /**
   * Get the viewer instance (if created).
   */
  static getInstance(): TimelineViewer | null {
    return viewerInstance;
  }

  /**
   * Select a timeline by name.
   */
  select(name: string): void {
    const timeline = timelineRegistry.get(name);

    if (timeline) {
      this.currentTimelineName = name;
      this.element.setTimeline(timeline);
      this.element.setSelectedTimeline(name);
    }
  }

  /**
   * Get current timeline name.
   */
  getCurrentTimelineName(): string | null {
    return this.currentTimelineName;
  }

  /**
   * Remove the viewer from the page.
   */
  destroy(): void {
    stopAutoDetect();
    this.element.remove();
    viewerInstance = null;
  }

  get htmlElement(): TimelineViewerElement {
    return this.element;
  }
}
