# GSAP Timeline Viewer

A lightweight, framework-agnostic development tool for visualizing GSAP timelines. Debug and scrub through your animations with a visual timeline panel.

**4.8 KB gzipped** | Works with React, Vue, Angular, Svelte, or vanilla JS

## Installation

```bash
npm install gsap-timeline-viewer
```

Note: GSAP is a peer dependency. Make sure you have it installed:

```bash
npm install gsap
```

## Quick Start

```javascript
import { TimelineViewer } from 'gsap-timeline-viewer';
import gsap from 'gsap';

// Create your GSAP timeline
const tl = gsap.timeline();
tl.to('.box', { x: 100, duration: 1 })
  .to('.box', { y: 50, duration: 0.5 });

// Attach the viewer
const viewer = new TimelineViewer({ timeline: tl });
viewer.attach();
```

## Features

- Visual timeline with colored tracks for each tween
- Scrubber/playhead synced with your timeline
- Playback controls (play/pause, skip to start/end)
- Speed control (0.25x, 0.5x, 1x, 2x, 4x)
- Loop toggle
- Auto-scaling time ruler
- Keyboard shortcut: `Space` to play/pause
- Collapsible panel
- Dark theme

## API

### TimelineViewer

```typescript
import { TimelineViewer } from 'gsap-timeline-viewer';

const viewer = new TimelineViewer({
  timeline: myTimeline,  // Required: GSAP timeline instance
  height: 200,           // Optional: Panel height in pixels (default: 200)
});

viewer.attach();                    // Add viewer to document.body
viewer.attach(containerElement);    // Add to specific container
viewer.detach();                    // Remove from DOM
viewer.setTimeline(newTimeline);    // Switch to a different timeline
```

### Named Tweens

For better labels in the viewer, add an `id` to your tweens:

```javascript
tl.to('.hero', {
  opacity: 1,
  duration: 1,
  id: 'Hero Fade In'  // This label appears in the viewer
});
```

## Web Component

The viewer is also available as a custom element:

```html
<gsap-timeline-viewer></gsap-timeline-viewer>

<script type="module">
  import 'gsap-timeline-viewer';

  const viewer = document.querySelector('gsap-timeline-viewer');
  viewer.setTimeline(myTimeline);
</script>
```

## UMD / Script Tag

```html
<script src="https://unpkg.com/gsap"></script>
<script src="https://unpkg.com/gsap-timeline-viewer"></script>

<script>
  const viewer = new GSAPTimelineViewer.TimelineViewer({ timeline: tl });
  viewer.attach();
</script>
```

## Browser Support

Works in all modern browsers that support Web Components (Chrome, Firefox, Safari, Edge).

## License

MIT
