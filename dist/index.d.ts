export declare class TimelineViewer {
    private element;
    private currentTimelineName;
    private constructor();
    /**
     * Create and attach the timeline viewer to the page.
     * Call this once - subsequent calls return the existing instance.
     */
    static create(config?: TimelineViewerConfig): TimelineViewer;
    /**
     * Register a timeline with a name so it appears in the dropdown.
     */
    static register(name: string, timeline: gsap.core.Timeline): void;
    /**
     * Unregister a timeline.
     */
    static unregister(name: string): void;
    /**
     * Get all registered timelines.
     */
    static getTimelines(): Map<string, gsap.core.Timeline>;
    /**
     * Get the viewer instance (if created).
     */
    static getInstance(): TimelineViewer | null;
    /**
     * Select a timeline by name.
     */
    select(name: string): void;
    /**
     * Get current timeline name.
     */
    getCurrentTimelineName(): string | null;
    /**
     * Remove the viewer from the page.
     */
    destroy(): void;
    get htmlElement(): TimelineViewerElement;
}

export declare interface TimelineViewerConfig {
    height?: number;
    collapsed?: boolean;
    defaultTimeline?: string;
    autoDetect?: boolean;
    gsap?: typeof gsap;
}

export declare class TimelineViewerElement extends HTMLElement {
    private shadow;
    private timeline;
    private timelineData;
    private isPlaying;
    private loopMode;
    private speedIndex;
    private zoomLevel;
    private readonly zoomLevels;
    private collapsed;
    private height;
    private isDragging;
    private manageBodyPadding;
    private isAutofit;
    private showEaseCurves;
    private playrangeStart;
    private playrangeEnd;
    private draggingPlayrange;
    private draggingScrubber;
    private container;
    private playBtn;
    private loopDropdown;
    private loopMenu;
    private speedDropdown;
    private speedMenu;
    private zoomDropdown;
    private zoomMenu;
    private timelineDropdown;
    private timelineMenu;
    private timeDisplay;
    private ruler;
    private rulerInner;
    private rulerPlayheadHead;
    private tracksContainer;
    private tracksScroll;
    private playrangeScroll;
    private playrangeInner;
    private playhead;
    private scrubArea;
    private resizeHandle;
    private selectedTimelineName;
    private isResizing;
    constructor();
    connectedCallback(): void;
    private loadSettings;
    private saveSettings;
    private applyLoadedSettings;
    disconnectedCallback(): void;
    setTimeline(timeline: gsap.core.Timeline): void;
    updateTimelineSelector(): void;
    private selectTimeline;
    private updateTimelineDisplay;
    setSelectedTimeline(name: string): void;
    private detachTimeline;
    private render;
    private setupEventListeners;
    private startScrub;
    private onScrub;
    private endScrub;
    private startResize;
    private onResize;
    private endResize;
    private startPlayrangeDrag;
    private onPlayrangeDrag;
    private endPlayrangeDrag;
    private startScrubberDrag;
    private onScrubberDrag;
    private endScrubberDrag;
    private updatePlayrangeDisplay;
    private setPlayrangeStart;
    private setPlayrangeEnd;
    private resetPlayrange;
    private updateBodyPadding;
    private clearBodyPadding;
    private scrubToPosition;
    private togglePlay;
    private playReverse;
    private getTimePoints;
    private jumpToPrevPoint;
    private jumpToNextPoint;
    private positionPopover;
    private setLoopMode;
    private updateLoopIcon;
    private updateLoopMenuSelection;
    private setSpeed;
    private updateSpeedDisplay;
    private setZoom;
    private zoomIn;
    private zoomOut;
    private resetZoom;
    private updateZoomDisplay;
    private toggleCollapse;
    private toggleAutofit;
    private toggleEaseCurves;
    private applyAutofit;
    private updatePlayState;
    private onTimelineUpdate;
    private checkPlayrangeConstraint;
    private updatePlayhead;
    private updateTimeDisplay;
    private updateActiveTracks;
    private renderTracks;
    /**
     * Dynamically update bar content alignment based on actual DOM measurements.
     * Right-aligns bars whose content would overflow past the timeline boundary.
     */
    private updateContentAlignment;
    /**
     * Update content alignment for bars within a specific container element.
     */
    private updateContentAlignmentForElement;
    private renderGridLines;
    private renderRuler;
    private renderLabelLines;
    private calculateInterval;
    private renderEaseCurve;
    /**
     * Determine label position class based on bar width and position.
     * Currently disabled - labels always stay inside bars with overflow hidden.
     */
    private getLabelPositionClass;
    private renderGroup;
    private renderTrack;
}

export { }
