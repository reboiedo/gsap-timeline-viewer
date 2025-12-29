# GSAP Timeline Viewer

A lightweight, framework-agnostic development tool for visualizing and debugging GSAP timelines. Inspect your animations with a visual timeline panel.

![GSAP Timeline Viewer](https://raw.githubusercontent.com/reboiedo/gsap-timeline-viewer/main/screenshot.png)

**~11 KB gzipped** | Works with React, Vue, Angular, Svelte, or vanilla JS

[**▶ Try it on CodePen**](https://codepen.io/ry2/pen/GgqJvYJ)

## Features

- **Auto-detection** - Automatically captures all `gsap.timeline()` calls
- **Visual timeline** - Colored tracks for each tween with labels
- **Playrange bar** - Drag handles to set playback boundaries
- **Ease curve visualization** - Toggle to see ease curves as track shapes
- **Stagger expansion** - Expand staggered animations to see individual targets
- **Overlap/gap indicators** - Visual badges showing `-=` and `+=` timing offsets
- **Playback controls** - Play/pause, reverse, skip, speed (0.25x–4x), loop modes
- **Scrubbing** - Click or drag anywhere on the timeline
- **Resizable** - Drag the top edge to resize
- **Keyboard shortcuts** - Full keyboard control for playback and navigation
- **Timeline selector** - Switch between multiple timelines
- **Collapsible panel** - Minimize when not in use
- **Persistent settings** - Panel size, playrange, and preferences saved

## Installation

```bash
npm install gsap-timeline-viewer
```

Note: GSAP is a peer dependency:

```bash
npm install gsap
```

## Quick Start

```javascript
import { TimelineViewer } from 'gsap-timeline-viewer';
import gsap from 'gsap';

// Create the viewer - pass gsap for ES module imports
TimelineViewer.create({ gsap });

// All timelines are auto-detected
const tl = gsap.timeline({ id: 'My Animation' });
tl.to('.box', { x: 100, duration: 1, id: 'Move Right' })
  .to('.box', { y: 50, duration: 0.5, id: 'Move Down' });
```

The `id` on timelines and tweens is optional but provides better labels in the viewer.

## API

### TimelineViewer.create(config?)

Creates and attaches the viewer to the page. Call once - subsequent calls return the existing instance.

```typescript
TimelineViewer.create({
  gsap: gsap,            // Required for ES module imports, optional for UMD/script tag
  height: 200,           // Optional: Initial panel height (default: 200)
  collapsed: false,      // Optional: Start collapsed (default: false)
  defaultTimeline: 'My Animation',  // Optional: Auto-select this timeline
  autoDetect: true,      // Optional: Auto-detect timelines (default: true)
});
```

### TimelineViewer.register(name, timeline)

Manually register a timeline (useful if autoDetect is disabled):

```javascript
const tl = gsap.timeline({ paused: true });
TimelineViewer.register('Hero Animation', tl);
```

### TimelineViewer.unregister(name)

Remove a timeline from the viewer.

### TimelineViewer.getInstance()

Get the current viewer instance:

```javascript
const viewer = TimelineViewer.getInstance();
viewer.select('Other Timeline');
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `R` | Reverse |
| `J` | Jump to previous point |
| `K` | Jump to next point |
| `O` | Oneshot mode |
| `L` | Loop mode |
| `P` | Ping-pong mode |
| `[` | Set playrange start |
| `]` | Set playrange end |
| `\` | Reset playrange |

## Named Tweens

Add `id` to your tweens for better labels:

```javascript
tl.to('.hero', {
  opacity: 1,
  duration: 1,
  id: 'Hero Fade In'  // Shows in viewer instead of ".hero (opacity)"
});
```

## ES Modules (React, Vue, Astro, etc.)

When using gsap as an ES module import, you must pass the gsap instance to the viewer:

```javascript
import gsap from 'gsap';
import { TimelineViewer } from 'gsap-timeline-viewer';

// Pass gsap so the viewer can access globalTimeline
TimelineViewer.create({ gsap });

const tl = gsap.timeline({ id: 'My Animation' });
tl.to('.box', { x: 100, duration: 1 });
```

This is required because ES module imports don't set `window.gsap`.

## UMD / Script Tag

```html
<script src="https://unpkg.com/gsap"></script>
<script src="https://unpkg.com/gsap-timeline-viewer"></script>

<script>
  GSAPTimelineViewer.TimelineViewer.create();

  // Your animations are auto-detected
  gsap.timeline({ id: 'Main' })
    .to('.box', { x: 100, duration: 1 });
</script>
```

## Disabling Auto-Detection

If you prefer manual control:

```javascript
TimelineViewer.create({ autoDetect: false });

// Manually register timelines
const tl = gsap.timeline();
TimelineViewer.register('My Timeline', tl);
```

## Browser Support

Works in all modern browsers that support Web Components (Chrome, Firefox, Safari, Edge).

## Repository

[GitHub](https://github.com/reboiedo/gsap-timeline-viewer)

## License

MIT
