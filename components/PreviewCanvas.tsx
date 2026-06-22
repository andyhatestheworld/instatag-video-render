"use client";

import { useEffect, useRef } from "react";
import type { AppState } from "@/lib/types";
import { composeFrame } from "@/lib/compose";
import { drawTag } from "@/lib/tagRenderer";

interface Props {
  state: AppState;
}

/**
 * Live, canvas-based preview. Uses the same compose + drawTag pipeline as the
 * exporter, so what you see is exactly what gets recorded. The canvas itself is
 * fully transparent — the checkerboard lives behind it as a CSS layer.
 */
export default function PreviewCanvas({ state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const sizeRef = useRef(512);
  const virtualRef = useRef(0);

  // Always read the freshest state from inside the rAF loop.
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const applySize = () => {
      const css = canvas.clientWidth || 512;
      const px = Math.round(css * dpr);
      if (canvas.width !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      sizeRef.current = px;
    };
    applySize();

    const ro = new ResizeObserver(applySize);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      if (s.playing) virtualRef.current += dt;

      const size = sizeRef.current;
      ctx.clearRect(0, 0, size, size);
      drawTag(ctx, size, composeFrame(s, virtualRef.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className={`relative aspect-square w-full max-w-[460px] overflow-hidden rounded-xl border border-line ${
        state.darkMode ? "checker-dark" : "checker-light"
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
