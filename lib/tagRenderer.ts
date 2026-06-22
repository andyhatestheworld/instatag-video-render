import type { RenderOptions, Tip } from "./types";

const FONT_STACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

/**
 * Traces a rounded-rectangle bubble whose tip (if any) is part of the same
 * continuous outline, so the tip is perfectly flush with the bubble — one path,
 * one fill, no seam and no double-blended overlap.
 */
function bubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  tip: Tip,
  aw: number,
  ah: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  const cx = x + w / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  if (tip === "up") {
    ctx.lineTo(cx - aw / 2, y);
    ctx.lineTo(cx, y - ah);
    ctx.lineTo(cx + aw / 2, y);
  }
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  if (tip === "down") {
    ctx.lineTo(cx + aw / 2, y + h);
    ctx.lineTo(cx, y + h + ah);
    ctx.lineTo(cx - aw / 2, y + h);
  }
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/** Instagram-style verified seal (scalloped blue badge + white check). */
function drawVerifiedBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const spikes = 12;
  const inner = r * 0.84;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (Math.PI / spikes) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#3897f0";
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.36);
  ctx.lineTo(cx + r * 0.46, cy - r * 0.34);
  ctx.stroke();
}

/**
 * Draws a single animated tag frame onto a (transparent) canvas context.
 * `size` is the canvas pixel size in both dimensions (square). The caller is
 * responsible for clearing the canvas first.
 */
export function drawTag(ctx: CanvasRenderingContext2D, size: number, o: RenderOptions) {
  const s = size / 1024; // scale factor relative to the 1024 base grid

  // Auto-fit: shrink the font so the full tag (text + badge + bubble padding)
  // always stays inside the frame, even for long usernames.
  let fontSize = size * 0.084;
  ctx.font = `700 ${fontSize}px ${FONT_STACK}`;
  const badgeSlotAt = (fs: number) => (o.verified ? fs * 0.22 + fs * 0.46 * 2 : 0);
  const padXAt = (fs: number) => (o.background ? fs * 0.62 : 0);
  const fullWAtBase = ctx.measureText(o.fullText).width;
  const outerWidth = fullWAtBase + badgeSlotAt(fontSize) + 2 * padXAt(fontSize);
  const maxWidth = size * 0.9;
  if (outerWidth > maxWidth) {
    fontSize *= maxWidth / outerWidth;
    ctx.font = `700 ${fontSize}px ${FONT_STACK}`;
  }

  const len = o.fullText.length;
  const visible = o.fullText.slice(0, o.visibleCount);
  const fullW = ctx.measureText(o.fullText).width;
  const visibleW = ctx.measureText(visible).width;

  const badgeR = o.verified ? fontSize * 0.46 : 0;
  const badgeGap = o.verified ? fontSize * 0.22 : 0;
  const badgeSlot = o.verified ? badgeGap + badgeR * 2 : 0;

  // When a bubble is shown it is sized to the FULL text from the start, and the
  // text is left-aligned so it fills the (fixed) bubble. Without a bubble the
  // box hugs the currently visible text and stays centered.
  const layoutTextW = o.fixedLayout ? fullW : visibleW;
  const contentW = layoutTextW + badgeSlot;

  const tr = o.transform;
  const groupAlpha = tr.opacity;

  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  if (tr.blur > 0) ctx.filter = `blur(${tr.blur * s}px)`;
  ctx.translate(size / 2 + tr.x * s, size / 2 + tr.y * s);
  ctx.rotate((tr.rotate * Math.PI) / 180);
  ctx.scale(tr.scaleX, tr.scaleY);

  const left = -contentW / 2;

  if (o.background) {
    const padX = fontSize * 0.62;
    const padY = fontSize * 0.42;
    const bx = left - padX;
    const by = -fontSize / 2 - padY;
    const bw = contentW + padX * 2;
    const bh = fontSize + padY * 2;
    // Same classic rounded-rectangle shape for every tip mode — the tip is part
    // of the same outline so it sits perfectly flush with the bubble.
    const radius = bh * 0.34;
    const aw = fontSize * 0.5;
    const ah = fontSize * 0.42;

    ctx.globalAlpha = groupAlpha;
    ctx.fillStyle = o.darkMode
      ? `rgba(244,244,247,${o.bgOpacity})`
      : `rgba(18,18,22,${o.bgOpacity})`;
    bubblePath(ctx, bx, by, bw, bh, radius, o.tip, aw, ah);
    ctx.fill();
  }

  // Text color: contrasts the pill when a background is shown, otherwise
  // contrasts the (transparent) canvas based on the dark-mode toggle.
  const textColor = o.background
    ? o.darkMode
      ? "#111114"
      : "#fafafa"
    : o.darkMode
      ? "#fafafa"
      : "#111114";

  let badgeAlpha: number;

  if (o.typewriter) {
    // Each letter materializes out of a soft, smoky blur: it starts larger and
    // very diffuse, then condenses + sharpens into place (with a faint glow).
    const DROP = 16; // px (1024-base) the letter travels into place
    const SMOKE_BLUR = 26; // px of soft blur the letter emerges from
    const GLOW = 14; // px of faint halo while forming
    const GROW = 0.24; // how much bigger the letter starts (puff -> condense)
    const SPAN = 2.0; // the softness lingers across ~2 letters
    const glow = o.darkMode ? "rgba(140,180,255,A)" : "rgba(235,245,255,A)";
    // -1: letters come in from above; +1: from below.
    const dir = o.revealFrom === "top" ? -1 : 1;

    ctx.fillStyle = textColor;
    for (let i = 0; i < len; i++) {
      const sub = clamp01((o.charReveal - i) / SPAN);
      if (sub <= 0) continue;
      const e = easeOutCubic(sub);
      const ch = o.fullText[i];
      const x = left + ctx.measureText(o.fullText.slice(0, i)).width;
      const lw = ctx.measureText(ch).width;
      const oy = dir * (1 - e) * DROP * s; // travel into the baseline
      const scale = 1 + (1 - e) * GROW; // start bigger, condense to 1
      ctx.save();
      ctx.globalAlpha = groupAlpha * e;
      const blurPx = (1 - e) * SMOKE_BLUR * s;
      if (blurPx > 0.1) ctx.filter = `blur(${blurPx}px)`;
      if (sub < 1) {
        ctx.shadowColor = glow.replace("A", String(0.5 * (1 - e)));
        ctx.shadowBlur = (1 - e) * GLOW * s;
      }
      // Scale around the letter's own centre so it condenses in place.
      ctx.translate(x + lw / 2, oy);
      ctx.scale(scale, scale);
      ctx.fillText(ch, -lw / 2, 0);
      ctx.restore();
    }
    // Badge appears as the last letter lands.
    badgeAlpha = clamp01(o.charReveal - (len - 1));
  } else {
    // Whole-text reveal: rises from below with a clearing blur.
    const textY = o.textOffsetY * s;
    ctx.filter =
      o.textBlur > 0
        ? `blur(${o.textBlur * s}px)`
        : tr.blur > 0
          ? `blur(${tr.blur * s}px)`
          : "none";
    ctx.globalAlpha = groupAlpha * o.textAlpha;
    ctx.fillStyle = textColor;
    ctx.fillText(visible, left, textY);
    badgeAlpha = o.visibleCount >= len ? o.textAlpha : 0;
  }

  // Badge sits at the end of the (full-text) slot.
  if (o.verified && badgeAlpha > 0) {
    ctx.filter = "none";
    ctx.globalAlpha = groupAlpha * badgeAlpha;
    const cx = left + layoutTextW + badgeGap + badgeR;
    drawVerifiedBadge(ctx, cx, 0, badgeR);
  }

  ctx.restore();
}
