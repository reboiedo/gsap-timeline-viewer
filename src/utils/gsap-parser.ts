export interface StaggerChild {
  targetLabel: string;
  startTime: number;
  endTime: number;
}

export interface TweenData {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  duration: number;
  targets: string;
  properties: string[];
  colorIndex: number;
  hasStagger: boolean;
  ease: string;
  easeSamples?: number[];  // Y values sampled at regular X intervals (0-1)
  staggerValue?: number;
  staggerChildren?: StaggerChild[];
  overlapWithPrev?: number;  // positive = overlap, negative = gap
}

export interface TimelineData {
  duration: number;
  tweens: TweenData[];
}

let tweenCounter = 0;
let gsapRef: typeof gsap | null = null;

/**
 * Set the gsap reference for ease sampling
 */
export function setGsapRef(gsapInstance: typeof gsap | null): void {
  gsapRef = gsapInstance;
}

function getTargetLabel(targets: Element[]): string {
  if (!targets || targets.length === 0) return 'Unknown';

  const target = targets[0];

  // Try to get a meaningful identifier
  if (target.id) {
    return `#${target.id}`;
  }

  if (target.classList && target.classList.length > 0) {
    return `.${target.classList[0]}`;
  }

  if (target.tagName) {
    return target.tagName.toLowerCase();
  }

  return 'element';
}

function getAnimatedProperties(vars: Record<string, unknown>): string[] {
  const ignore = [
    'ease', 'duration', 'delay', 'onComplete', 'onStart', 'onUpdate',
    'onCompleteParams', 'onStartParams', 'onUpdateParams', 'repeat',
    'repeatDelay', 'yoyo', 'stagger', 'overwrite', 'immediateRender',
    'lazy', 'autoAlpha', 'id', 'paused', 'reversed', 'startAt'
  ];

  return Object.keys(vars).filter(key => !ignore.includes(key));
}

/**
 * Generate linear ease samples as fallback.
 */
function linearEaseSamples(points = 50): number[] {
  const samples: number[] = [];
  for (let i = 0; i <= points; i++) {
    samples.push(i / points);
  }
  return samples;
}

/**
 * Sample an ease function to get curve points for visualization.
 * Tries GSAP's parseEase first, falls back to tween._ease, then linear.
 */
function sampleEase(easeName: string, tween?: gsap.core.Tween, points = 50): number[] {
  // Use stored gsap ref first, then fall back to window.gsap
  const gsapObj = gsapRef || (window as unknown as { gsap?: typeof gsap }).gsap;

  // First try parseEase with the ease name (works best for named eases)
  // Trim whitespace from ease name in case of typos like "ease.out "
  let easeFunc = gsapObj?.parseEase?.(easeName.trim());

  // If parseEase failed, try tween's internal _ease as fallback
  if (!easeFunc && tween) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    easeFunc = (tween as any)._ease;
  }

  if (!easeFunc) {
    return linearEaseSamples(points);
  }

  const samples: number[] = [];
  for (let i = 0; i <= points; i++) {
    samples.push(easeFunc(i / points));
  }
  return samples;
}

export function parseTimeline(timeline: gsap.core.Timeline): TimelineData {
  const tweens: TweenData[] = [];

  // Get all children - tweens and nested timelines
  const children = timeline.getChildren(true, true, false);

  children.forEach((child, index) => {
    // Skip labels and callbacks, only process tweens
    if (!('targets' in child)) return;

    const tween = child as gsap.core.Tween;
    const targets = tween.targets() as Element[];
    const vars = tween.vars || {};
    const properties = getAnimatedProperties(vars);

    // Get label from vars or generate one
    let label = '';
    if (vars.id && typeof vars.id === 'string') {
      label = vars.id;
    } else {
      const targetLabel = getTargetLabel(targets);
      const propSummary = properties.slice(0, 2).join(', ');
      label = propSummary ? `${targetLabel} (${propSummary})` : targetLabel;
    }

    const startTime = child.startTime();
    const duration = child.duration();

    // Get ease name (GSAP default is "power1.out")
    let ease = 'power1.out';
    if (vars.ease) {
      ease = typeof vars.ease === 'string' ? vars.ease : 'custom';
    }

    // Get stagger value and build stagger children
    let staggerValue: number | undefined;
    let staggerChildren: StaggerChild[] | undefined;

    if (vars.stagger && targets.length > 1) {
      // Extract numeric stagger value
      if (typeof vars.stagger === 'number') {
        staggerValue = vars.stagger;
      } else if (typeof vars.stagger === 'object') {
        staggerValue = (vars.stagger as { each?: number }).each || 0;
      }

      // Build children array showing each target's timing
      if (staggerValue) {
        // Calculate individual duration (total duration minus all stagger offsets)
        const individualDuration = duration - (staggerValue * (targets.length - 1));

        staggerChildren = targets.map((target, i) => {
          const childStart = startTime + (i * staggerValue!);
          return {
            targetLabel: getTargetLabel([target]),
            startTime: childStart,
            endTime: childStart + individualDuration,
          };
        });
      }
    }

    tweens.push({
      id: `tween-${++tweenCounter}`,
      label,
      startTime,
      endTime: startTime + duration,
      duration,
      targets: getTargetLabel(targets),
      properties,
      colorIndex: index % 6,
      hasStagger: !!vars.stagger,
      ease,
      easeSamples: sampleEase(ease, tween),
      staggerValue,
      staggerChildren,
    });
  });

  // Calculate overlaps between consecutive tweens
  for (let i = 1; i < tweens.length; i++) {
    const prev = tweens[i - 1];
    const curr = tweens[i];
    // Overlap = prev.endTime - curr.startTime
    // positive = overlap (curr starts before prev ends)
    // negative = gap (curr starts after prev ends)
    const overlap = prev.endTime - curr.startTime;
    if (Math.abs(overlap) > 0.001) { // Ignore tiny floating point differences
      curr.overlapWithPrev = Math.round(overlap * 1000) / 1000;
    }
  }

  return {
    duration: timeline.duration(),
    tweens,
  };
}

export function resetCounter(): void {
  tweenCounter = 0;
}
