import type { AppState, ExportFormat } from "./types";
import { getCycleDuration, revealSeconds } from "./animations";
import { composeFrame } from "./compose";
import { drawTag } from "./tagRenderer";

const LOOPS = 2; // how many animation cycles to capture
/** Solid chroma-key green used as the exported video background. */
export const GREEN_SCREEN = "#00ff00";

function createCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  return { canvas, ctx };
}

/* --------------------------- MP4 / video (green) ------------------------ */

/**
 * Picks the best recordable container. MP4 (H.264) is preferred so the file
 * drops straight into any editor; WebM is used only as a fallback when the
 * browser can't record MP4.
 */
function pickVideoMime(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const mp4 = ["video/mp4;codecs=avc1.42E01E", "video/mp4;codecs=avc1", "video/mp4"];
  const webm = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const m of mp4) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext: "mp4" };
  for (const m of webm) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext: "webm" };
  return null;
}

export function isVideoSupported(): boolean {
  return pickVideoMime() !== null;
}

/** True when the browser can record true MP4 (not just the WebM fallback). */
export function isMp4Supported(): boolean {
  return pickVideoMime()?.ext === "mp4";
}

/** A WebM mime to fall back to if MP4 recording yields nothing. */
function webmFallbackMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const webm = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return webm.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

/** Records a green-screen clip with the given mime. Returns the raw Blob. */
async function recordWithMime(state: AppState, size: number, mime: string, ext: string): Promise<Blob> {
  const { canvas, ctx } = createCanvas(size);
  // Attaching the canvas to the DOM (off-screen) makes some browsers reliably
  // produce frames for captureStream — an orphan canvas can record 0 bytes.
  canvas.style.cssText =
    "position:fixed;left:-100000px;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none;";
  document.body.appendChild(canvas);

  const paint = (elapsed: number) => {
    ctx.fillStyle = GREEN_SCREEN; // solid green for chroma keying (no alpha in MP4)
    ctx.fillRect(0, 0, size, size);
    drawTag(ctx, size, composeFrame(state, elapsed));
  };

  try {
    paint(0); // ensure the first frame exists before recording starts
    const stream = canvas.captureStream(60); // 60fps -> smooth fast entrance
    // A generous, resolution-scaled bitrate for crisp text/edges. If the
    // browser rejects an explicit bitrate, fall back to its default so the
    // recording still succeeds.
    const bitrate = Math.min(24_000_000, Math.max(8_000_000, Math.round(size * size * 6)));
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate });
    } catch {
      recorder = new MediaRecorder(stream, { mimeType: mime });
    }
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    const totalMs = getCycleDuration(state.duration, revealSeconds(state)) * LOOPS * 1000;
    recorder.start(100); // timeslice -> periodic dataavailable events
    const start = performance.now();

    await new Promise<void>((resolve) => {
      const loop = (now: number) => {
        paint((now - start) / 1000);
        if (now - start >= totalMs) resolve();
        else requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });

    if (recorder.state !== "inactive") {
      try {
        recorder.requestData();
      } catch {
        /* ignore */
      }
      recorder.stop();
    }
    await stopped;
    return new Blob(chunks, { type: ext === "mp4" ? "video/mp4" : "video/webm" });
  } finally {
    canvas.remove();
  }
}

/**
 * Browser video encoders (H.264/VP9 via MediaRecorder) reliably top out around
 * ~2.5K square — 4096²/3840² produce empty files. Video export is therefore
 * capped, and steps down through a ladder until a size actually encodes, so it
 * always yields a real file. (GIF/PNG keep the full selected resolution.)
 */
export const MAX_VIDEO_SIZE = 2560;

function videoSizeLadder(requested: number): number[] {
  const ceiling = Math.min(requested, MAX_VIDEO_SIZE);
  const ladder = [ceiling, 2048, 1536, 1024].filter((s) => s <= ceiling);
  return [...new Set(ladder)];
}

async function exportVideo(state: AppState, size: number): Promise<{ blob: Blob; ext: string }> {
  const picked = pickVideoMime();
  if (!picked) throw new Error("Video recording is not supported in this browser.");
  const fallback = webmFallbackMime();

  for (const target of videoSizeLadder(size)) {
    let blob = await recordWithMime(state, target, picked.mime, picked.ext);
    let ext = picked.ext;

    // If the preferred container produced an empty file, fall back to WebM,
    // which records reliably across browsers (still on the green background).
    if (blob.size === 0 && picked.ext === "mp4" && fallback) {
      blob = await recordWithMime(state, target, fallback, "webm");
      ext = "webm";
    }

    if (blob.size > 0) return { blob, ext };
  }

  throw new Error("Recording produced an empty file in this browser — try the GIF export.");
}

/* ------------------------------- GIF (key) ------------------------------ */

async function exportGIF(state: AppState, size: number): Promise<Blob> {
  const GIF = (await import("gif.js")).default;
  // GIF only supports 1-bit transparency and is heavy at large sizes, so cap it.
  const gifSize = Math.min(size, 720);
  const KEY = 0x00ff00; // magic green keyed out as transparent

  const gif = new GIF({
    workers: 2,
    quality: 8,
    width: gifSize,
    height: gifSize,
    transparent: KEY,
    workerScript: "/gif.worker.js",
  });

  const { ctx } = createCanvas(gifSize);
  const fps = 20;
  const frames = Math.max(2, Math.round(getCycleDuration(state.duration, revealSeconds(state)) * fps));

  for (let i = 0; i < frames; i++) {
    const elapsed = i / fps;
    ctx.clearRect(0, 0, gifSize, gifSize);
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(0, 0, gifSize, gifSize);
    drawTag(ctx, gifSize, composeFrame(state, elapsed));
    gif.addFrame(ctx, { copy: true, delay: 1000 / fps });
  }

  return new Promise<Blob>((resolve, reject) => {
    gif.on("finished", (blob: Blob) => resolve(blob));
    try {
      gif.render();
    } catch (err) {
      reject(err);
    }
  });
}

/* --------------------------------- PNG ---------------------------------- */

async function exportPNG(state: AppState, size: number): Promise<Blob> {
  const { canvas, ctx } = createCanvas(size);
  ctx.clearRect(0, 0, size, size);
  // Render the fully-revealed tag (end of entrance / start of exit), transparent.
  const elapsed = state.direction === "in" ? state.duration : 0;
  drawTag(ctx, size, composeFrame(state, elapsed));
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

/* ------------------------------- dispatch ------------------------------- */

export async function exportTag(
  format: ExportFormat,
  state: AppState,
  size: number
): Promise<{ blob: Blob; ext: string }> {
  switch (format) {
    case "mp4":
      return exportVideo(state, size);
    case "gif":
      return { blob: await exportGIF(state, size), ext: "gif" };
    case "png":
      return { blob: await exportPNG(state, size), ext: "png" };
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
