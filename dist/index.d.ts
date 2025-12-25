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
    private isLooping;
    private speedIndex;
    private collapsed;
    private height;
    private isDragging;
    private manageBodyPadding;
    private isAutofit;
    private showEaseCurves;
    private playrangeStart;
    private playrangeEnd;
    private draggingPlayrange;
    private container;
    private playBtn;
    private loopBtn;
    private speedBtn;
    private timeDisplay;
    private rulerInner;
    private tracksScroll;
    private playhead;
    private scrubArea;
    private resizeHandle;
    private timelineSelect;
    private isResizing;
    constructor();
    connectedCallback(): void;
    private loadSettings;
    private saveSettings;
    private applyLoadedSettings;
    disconnectedCallback(): void;
    setTimeline(timeline: gsap.core.Timeline): void;
    updateTimelineSelector(): void;
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
    private updatePlayrangeDisplay;
    private updateBodyPadding;
    private clearBodyPadding;
    private scrubToPosition;
    private togglePlay;
    private skipToStart;
    private skipToEnd;
    private getTimePoints;
    private jumpToPrevPoint;
    private jumpToNextPoint;
    private toggleLoop;
    private cycleSpeed;
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
    private renderGridLines;
    private renderRuler;
    private calculateInterval;
    private renderEaseCurve;
    private getEaseClipPath;
    private renderTrack;
}

export { }
