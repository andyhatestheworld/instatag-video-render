import type { AppState, RenderOptions } from "./types";
import { getAnim, getBaseProgress, revealSeconds } from "./animations";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

// Subtle bottom-up reveal applied to the text inside the bubble (non-typewriter).
const TEXT_RISE = 26; // px (1024-base) the text rises into place
const TEXT_BLUR = 16; // px (1024-base) of soft blur that clears as it settles

/**
 * Turns the app state + elapsed time into a plain RenderOptions object.
 * Shared by the live canvas preview and every export path so they stay
 * pixel-identical.
 */
export function composeFrame(state: AppState, elapsed: number): RenderOptions {
  const anim = getAnim(state.animationId);
  const reveal = revealSeconds(state);
  const base = getBaseProgress(elapsed, state.duration, state.direction, reveal);
  const hasEntrance = anim.id !== "none";

  const name = state.username && state.username.length ? state.username : "username";
  const fullText = (state.atPrefix ? "@" : "") + name;
  const len = fullText.length;

  let transform;
  let visibleCount = len;
  let textAlpha = 1;
  let textOffsetY = 0;
  let textBlur = 0;
  let charReveal = len;

  // -1 when letters come from the top (fall down), +1 when from the bottom (rise up).
  const dir = state.revealFrom === "top" ? -1 : 1;

  if (state.typewriter) {
    // Bubble pops in quickly, then the letters cascade in one by one.
    const bubbleP = clamp01(base / 0.14);
    transform = state.background ? anim.frame(hasEntrance ? bubbleP : 1) : anim.frame(1);
    const typeStart = 0.1;
    const typeProg = clamp01((base - typeStart) / (1 - typeStart));
    // Overshoot by 1 so the final letter fully lands (each letter settles over
    // ~1.5 units, so charReveal must reach len + ~0.5 for the last one).
    charReveal = typeProg * (len + 1);
  } else if (state.background && hasEntrance) {
    // Phase 1: the bubble performs the entrance animation (at full size).
    const bubbleP = clamp01(base / 0.45);
    transform = anim.frame(bubbleP);
    // Phase 2: the text reveals inside the settled bubble (slides with a blur).
    const r = clamp01((base - 0.4) / 0.6);
    const eased = easeOutCubic(r);
    textAlpha = easeOutCubic(clamp01(r * 1.7));
    textOffsetY = (1 - eased) * TEXT_RISE * dir;
    textBlur = (1 - eased) * TEXT_BLUR;
  } else {
    transform = anim.frame(base);
  }

  visibleCount = Math.max(0, Math.min(len, visibleCount));

  return {
    fullText,
    visibleCount,
    textAlpha,
    textOffsetY,
    textBlur,
    typewriter: state.typewriter,
    charReveal,
    revealFrom: state.revealFrom,
    // Typewriter always lays out against the full text so letters don't shift.
    fixedLayout: state.background || state.typewriter,
    verified: state.verified,
    background: state.background,
    tip: state.tip,
    bgOpacity: state.bgOpacity,
    darkMode: state.darkMode,
    transform,
  };
}
