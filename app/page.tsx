"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppState } from "@/lib/types";
import { DEFAULT_STATE } from "@/lib/types";
import AnimationList from "@/components/AnimationList";
import PreviewCanvas from "@/components/PreviewCanvas";
import ModesPanel from "@/components/ModesPanel";
import ExportButton from "@/components/ExportButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Page() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [uiDark, setUiDark] = useState(false);

  const patch = useCallback((p: Partial<AppState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  // Top-left toggle controls the surrounding interface theme.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", uiDark);
    root.classList.toggle("light", !uiDark);
  }, [uiDark]);

  return (
    <main className="relative mx-auto min-h-screen max-w-[1280px] px-5 py-6">
      {/* Top-left theme toggle */}
      <div className="absolute left-5 top-6 z-10">
        <ThemeToggle dark={uiDark} onToggle={() => setUiDark((v) => !v)} />
      </div>

      {/* Title */}
      <header className="mb-7 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Insta<span className="text-brand">tag</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Animated @username tags · render to transparent or green-screen video
        </p>
      </header>

      {/* Three columns */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_280px] lg:items-stretch">
        {/* Left — animation list */}
        <div className="order-2 h-[560px] lg:order-1 lg:h-auto">
          <AnimationList state={state} patch={patch} />
        </div>

        {/* Center — preview + export */}
        <div className="order-1 flex flex-col items-center gap-5 lg:order-2">
          <button
            onClick={() => patch({ playing: !state.playing })}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-brand transition-colors hover:border-brand"
          >
            <span className="grid h-4 w-4 place-items-center">
              {state.playing ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M7 5l12 7-12 7V5z" />
                </svg>
              )}
            </span>
            {state.playing ? "Animating" : "Paused"}
          </button>

          <PreviewCanvas state={state} />

          {/* Username input */}
          <input
            type="text"
            value={state.username}
            onChange={(e) => patch({ username: e.target.value })}
            placeholder="Type a username…"
            maxLength={30}
            className="h-14 w-full max-w-[460px] rounded-md border border-line bg-surface px-4 text-center text-base font-medium text-ink outline-none transition-colors placeholder:text-muted focus:border-brand"
          />

          <ExportButton state={state} patch={patch} />
        </div>

        {/* Right — modes */}
        <div className="order-3 h-[560px] lg:h-auto">
          <ModesPanel state={state} patch={patch} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-muted">
        Instatag Video Render · runs entirely in your browser
      </footer>
    </main>
  );
}
