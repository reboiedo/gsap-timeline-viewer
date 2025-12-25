import { TimelineViewerElement } from './timeline-viewer';

export { TimelineViewerElement };

export interface TimelineViewerConfig {
  height?: number;
  collapsed?: boolean;
  defaultTimeline?: string; // Name of timeline to select by default
  autoDetect?: boolean; // Auto-detect timelines (default: true)
}

// Registry of named timelines
const timelineRegistry = new Map<string, gsap.core.Timeline>();
let viewerInstance: TimelineViewer | null = null;
let autoDetectEnabled = true;
let timelineCounter = 0;
let originalTimelineMethod: typeof gsap.timeline | null = null;

/**
 * Install the auto-detection hook on gsap.timeline()
 */
function installAutoDetect() {
  const gsapObj = (window as unknown as { gsap?: typeof gsap }).gsap;
  if (!gsapObj || originalTimelineMethod) return; // Already installed or no GSAP

  originalTimelineMethod = gsapObj.timeline.bind(gsapObj);

  gsapObj.timeline = function(vars?: gsap.TimelineVars) {
    const timeline = originalTimelineMethod!(vars);

    if (autoDetectEnabled) {
      // Use the id from vars, or generate one
      let name: string;
      if (vars?.id && typeof vars.id === 'string') {
        name = vars.id;
      } else {
        name = `Timeline ${++timelineCounter}`;
      }

      // Avoid duplicates
      if (!timelineRegistry.has(name)) {
        timelineRegistry.set(name, timeline);

        // Update viewer if it exists
        if (viewerInstance) {
          viewerInstance.htmlElement.updateTimelineSelector();
          // Auto-select if this is the first timeline
          if (timelineRegistry.size === 1) {
            viewerInstance.select(name);
          }
        }
      }
    }

    return timeline;
  } as typeof gsap.timeline;
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

    // Enable/disable auto-detection (default: true)
    autoDetectEnabled = config.autoDetect !== false;

    // Install auto-detection hook
    if (autoDetectEnabled) {
      installAutoDetect();
    }

    viewerInstance = new TimelineViewer(config);
    document.body.appendChild(viewerInstance.element);

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
    this.element.remove();
    viewerInstance = null;
  }

  get htmlElement(): TimelineViewerElement {
    return this.element;
  }
}
