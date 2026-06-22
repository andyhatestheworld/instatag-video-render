import type { TargetAndTransition, Transition } from "framer-motion";
import type { Transform, Direction, AppState } from "./types";

/**
 * Central animation configuration.
 *
 * Each animation provides two representations:
 *  - `frame(p)`  : a resolution-independent transform used by the canvas
 *                  renderer (live preview + video/GIF/PNG export). `p` is the
 *                  eased base progress in [0,1] for the ENTRANCE.
 *  - `motion`    : Framer Motion variants used by the small live previews in
 *                  the animation list (DOM rendering).
 *
 * "Pop out" reuses the same `frame` function with reversed progress, so a
 * single definition drives both directions.
 */

export const DEFAULT_TRANSFORM: Transform = {
  opacity: 1,
  scaleX: 1,
  scaleY: 1,
  x: 0,
  y: 0,
  rotate: 0,
  blur: 0,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeOutBack = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

const SLIDE = 130; // px in 1024-base
const t = (over: Partial<Transform>): Transform => ({ ...DEFAULT_TRANSFORM, ...over });

// Shared loop transition for the DOM mini-previews.
const loop = (duration = 1.7, ease: string | number[] = "easeOut") => ({
  duration,
  ease,
  times: [0, 0.6, 1],
  repeat: Infinity,
  repeatDelay: 0.25,
});

export interface AnimationDef {
  id: string;
  name: string;
  frame: (p: number) => Transform;
  motion: {
    initial: TargetAndTransition;
    animate: TargetAndTransition;
    transition: Transition;
  };
}

export const ANIMATIONS: AnimationDef[] = [
  {
    id: "none",
    name: "None",
    frame: () => t({}),
    motion: { initial: {}, animate: {}, transition: {} },
  },
  {
    id: "fade",
    name: "Fade",
    frame: (p) => t({ opacity: p }),
    motion: {
      initial: { opacity: 0 },
      animate: { opacity: [0, 1, 1] },
      transition: loop(),
    },
  },
  {
    id: "zoomIn",
    name: "Zoom in",
    frame: (p) => t({ opacity: p, scaleX: 0.5 + 0.5 * easeOutCubic(p), scaleY: 0.5 + 0.5 * easeOutCubic(p) }),
    motion: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: [0, 1, 1], scale: [0.5, 1, 1] },
      transition: loop(),
    },
  },
  {
    id: "zoomOut",
    name: "Zoom out",
    frame: (p) => t({ opacity: p, scaleX: 1.5 - 0.5 * easeOutCubic(p), scaleY: 1.5 - 0.5 * easeOutCubic(p) }),
    motion: {
      initial: { opacity: 0, scale: 1.5 },
      animate: { opacity: [0, 1, 1], scale: [1.5, 1, 1] },
      transition: loop(),
    },
  },
  {
    id: "blurIn",
    name: "Blur in",
    frame: (p) => t({ opacity: p, blur: (1 - easeOutCubic(p)) * 18 }),
    motion: {
      initial: { opacity: 0, filter: "blur(14px)" },
      animate: { opacity: [0, 1, 1], filter: ["blur(14px)", "blur(0px)", "blur(0px)"] },
      transition: loop(),
    },
  },
  {
    id: "slideUp",
    name: "Slide up",
    frame: (p) => t({ opacity: p, y: (1 - easeOutCubic(p)) * SLIDE }),
    motion: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: [0, 1, 1], y: [40, 0, 0] },
      transition: loop(),
    },
  },
  {
    id: "slideDown",
    name: "Slide down",
    frame: (p) => t({ opacity: p, y: -(1 - easeOutCubic(p)) * SLIDE }),
    motion: {
      initial: { opacity: 0, y: -40 },
      animate: { opacity: [0, 1, 1], y: [-40, 0, 0] },
      transition: loop(),
    },
  },
  {
    id: "spring",
    name: "Spring",
    frame: (p) => {
      const s = 0.3 + 0.7 * easeOutBack(clamp01(p));
      return t({ opacity: clamp01(p * 2.2), scaleX: s, scaleY: s });
    },
    motion: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { opacity: [0, 1, 1], scale: [0.3, 1, 1] },
      transition: { type: "spring", stiffness: 260, damping: 12, repeat: Infinity, repeatDelay: 0.6 },
    },
  },
  {
    id: "pop",
    name: "Pop",
    frame: (p) => {
      const s = p < 0.5 ? 0.5 + (1.25 - 0.5) * (p / 0.5) : 1.25 - 0.25 * ((p - 0.5) / 0.5);
      return t({ opacity: clamp01(p * 3), scaleX: s, scaleY: s });
    },
    motion: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: [0, 1, 1, 1], scale: [0.5, 1.25, 1, 1] },
      transition: { duration: 1.6, times: [0, 0.4, 0.6, 1], ease: "easeOut", repeat: Infinity, repeatDelay: 0.3 },
    },
  },
  {
    id: "swing",
    name: "Swing",
    frame: (p) => t({ opacity: clamp01(p * 3), rotate: Math.sin(p * Math.PI * 3) * 14 * (1 - p) }),
    motion: {
      initial: { opacity: 0, rotate: 0 },
      animate: { opacity: [0, 1, 1, 1, 1], rotate: [0, -14, 10, -5, 0] },
      transition: { duration: 1.6, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 0.3 },
    },
  },
  {
    id: "flip",
    name: "Flip",
    frame: (p) => {
      // Simulate a 3D rotateY flip with horizontal scale (edge -> face).
      const e = easeOutCubic(p);
      return t({ opacity: clamp01(p * 1.6), scaleX: Math.sin(e * (Math.PI / 2)) });
    },
    motion: {
      initial: { opacity: 0, rotateY: 90 },
      animate: { opacity: [0, 1, 1], rotateY: [90, 0, 0] },
      transition: { ...loop(), times: [0, 0.6, 1] },
    },
  },
];

export const getAnim = (id: string): AnimationDef =>
  ANIMATIONS.find((a) => a.id === id) ?? ANIMATIONS[0];

/* ------------------------------------------------------------------ */
/* Loop timing                                                         */
/* ------------------------------------------------------------------ */

/**
 * The entrance/exit is intentionally fast and fixed — the text snaps in in a
 * fraction of a second. The slider instead controls how long the finished tag
 * stays on screen before the loop repeats.
 */
export const ENTRANCE_SECONDS = 0.2;

/** Seconds spent revealing one letter in Typewriter mode. */
const PER_LETTER_SECONDS = 0.085;

/**
 * How long the "reveal" phase lasts for the current state. For Typewriter the
 * letters need real time to cascade in, so it scales with the username length;
 * otherwise it's the quick fixed entrance.
 */
export function revealSeconds(state: AppState): number {
  if (!state.typewriter) return ENTRANCE_SECONDS;
  const name = state.username && state.username.length ? state.username : "username";
  const len = ((state.atPrefix ? "@" : "") + name).length;
  return Math.min(2.4, Math.max(0.5, len * PER_LETTER_SECONDS));
}

/** Total length of one looped cycle (reveal + on-screen hold), in seconds. */
export const getCycleDuration = (onScreen: number, reveal: number = ENTRANCE_SECONDS) =>
  reveal + Math.max(0.1, onScreen);

/**
 * Eased base progress in [0,1] for the entrance.
 * - "in"  : ramps 0 -> 1 over the fixed entrance, then holds at 1 for `onScreen`.
 * - "out" : holds at 1 for `onScreen`, then ramps 1 -> 0 over the fixed exit.
 * `onScreen` is the slider value (how long the tag stays visible).
 */
export function getBaseProgress(
  elapsed: number,
  onScreen: number,
  direction: Direction,
  reveal: number = ENTRANCE_SECONDS
): number {
  const hold = Math.max(0.1, onScreen);
  const cycle = reveal + hold;
  const local = ((elapsed % cycle) + cycle) % cycle;
  if (direction === "in") {
    return local < reveal ? clamp01(local / reveal) : 1;
  }
  // out: show the full tag first, then animate it away.
  return local < hold ? 1 : 1 - clamp01((local - hold) / reveal);
}
