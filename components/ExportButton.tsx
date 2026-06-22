"use client";

import { useEffect, useState } from "react";
import type { AppState, ExportFormat, Quality } from "@/lib/types";
import { QUALITY_SIZE } from "@/lib/types";
import { exportTag, downloadBlob, isVideoSupported, isMp4Supported } from "@/lib/export";

interface Props {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}

const QUALITIES: Quality[] = ["HD", "2K", "4K"];
const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "mp4", label: "MP4 (green screen)" },
  { value: "gif", label: "GIF (transparent)" },
  { value: "png", label: "PNG (transparent)" },
];

export default function ExportButton({ state, patch }: Props) {
  const [format, setFormat] = useState<ExportFormat>("mp4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Codec detection is client-only; defer it to after mount so SSR and the
  // first client render match (avoids hydration mismatches).
  const [webmFallback, setWebmFallback] = useState(false);
  useEffect(() => setWebmFallback(!isMp4Supported()), []);

  const handleDownload = async () => {
    setError(null);
    if (format === "mp4" && !isVideoSupported()) {
      setError("Video recording isn't supported here — try GIF or PNG.");
      return;
    }
    setBusy(true);
    try {
      const size = QUALITY_SIZE[state.quality];
      const { blob, ext } = await exportTag(format, state, size);
      const name = (state.username || "username").replace(/[^a-z0-9_-]/gi, "") || "instatag";
      downloadBlob(blob, `instatag-${name}-${state.quality}.${ext}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] space-y-3">
      {/* Download row */}
      <div className="flex gap-2">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
          className="h-11 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink outline-none transition-colors focus:border-brand"
          aria-label="Export format"
        >
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleDownload}
          disabled={busy}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Rendering…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download video
            </>
          )}
        </button>
      </div>

      {/* Quality selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-sub">Quality</span>
        <div className="flex flex-1 gap-1.5">
          {QUALITIES.map((q) => (
            <button
              key={q}
              onClick={() => patch({ quality: q })}
              className={`flex-1 rounded-md border py-2 text-xs font-semibold transition-colors ${
                state.quality === q
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-sub hover:text-ink"
              }`}
            >
              {q}
              <span className="ml-1 hidden text-[10px] font-normal opacity-70 sm:inline">
                {QUALITY_SIZE[q]}px
              </span>
            </button>
          ))}
        </div>
      </div>

      {format === "mp4" && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#00ff00]" />
          Exports on a green background — key it out with chroma key in your editor.
          {webmFallback && " (Your browser will save WebM instead of MP4.)"}
        </p>
      )}

      {format === "mp4" && state.quality === "4K" && (
        <p className="text-[11px] text-muted">
          Browsers can&apos;t encode 4K video — the MP4 is rendered at ~2.5K. Use GIF or PNG for full 4K.
        </p>
      )}

      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
