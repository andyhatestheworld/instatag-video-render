export type Quality = "HD" | "2K" | "4K";
export type Tip = "up" | "down" | "none";
export type Direction = "in" | "out";
export type ExportFormat = "mp4" | "gif" | "png";
/** Which way the text/letters travel as they appear. */
export type RevealFrom = "top" | "bottom";

/** Resolved transform for a single rendered frame (resolution independent). */
export interface Transform {
  opacity: number;
  scaleX: number;
  scaleY: number;
  /** horizontal offset in 1024-base px (scaled to actual canvas size) */
  x: number;
  /** vertical offset in 1024-base px */
  y: number;
  /** rotation in degrees */
  rotate: number;
  /** blur radius in 1024-base px */
  blur: number;
}

export interface AppState {
  username: string;
  animationId: string;
  direction: Direction;
  duration: number; // seconds per animation cycle
  playing: boolean;
  quality: Quality;
  // MODES
  typewriter: boolean;
  verified: boolean;
  atPrefix: boolean;
  background: boolean;
  darkMode: boolean;
  /** direction the text/letters travel in as they appear */
  revealFrom: RevealFrom;
  // background sub-controls
  tip: Tip;
  bgOpacity: number; // 0..1
}

/** Everything drawTag needs for one frame (no React/DOM state). */
export interface RenderOptions {
  fullText: string;
  /** number of characters currently revealed (typewriter); = fullText.length otherwise */
  visibleCount: number;
  /** extra alpha applied to the text/badge so it can fade in after the bubble */
  textAlpha: number;
  /** vertical offset (1024-base px) for the subtle bottom-up text reveal */
  textOffsetY: number;
  /** blur (1024-base px) that clears as the text settles in */
  textBlur: number;
  /** whether to render the text letter-by-letter (typewriter cascade) */
  typewriter: boolean;
  /** fractional number of letters revealed so far (drives the per-letter cascade) */
  charReveal: number;
  /** direction the text/letters travel in as they appear */
  revealFrom: RevealFrom;
  /** size the bubble to the full text and left-align the text inside it */
  fixedLayout: boolean;
  verified: boolean;
  background: boolean;
  tip: Tip;
  bgOpacity: number;
  darkMode: boolean;
  transform: Transform;
}

export const QUALITY_SIZE: Record<Quality, number> = {
  HD: 1024,
  "2K": 2048,
  "4K": 4096,
};

export const DEFAULT_STATE: AppState = {
  username: "andyhatestheworld",
  animationId: "zoomIn",
  direction: "in",
  duration: 1.0,
  playing: true,
  quality: "2K",
  typewriter: true,
  verified: true,
  atPrefix: true,
  background: true,
  darkMode: true,
  revealFrom: "bottom",
  tip: "up",
  bgOpacity: 1.0,
};
