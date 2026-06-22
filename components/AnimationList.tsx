"use client";

import { ANIMATIONS } from "@/lib/animations";
import type { AppState, Direction } from "@/lib/types";
import MiniPreview from "./MiniPreview";

interface Props {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}

export default function AnimationList({ state, patch }: Props) {
  const tab = (dir: Direction, label: string) => (
    <button
      onClick={() => patch({ direction: dir })}
      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        state.direction === dir
          ? "bg-brand text-white"
          : "bg-surface2 text-sub hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <aside className="flex h-full flex-col gap-3 rounded-md border border-line bg-surface p-3">
      {/* Pop in / Pop out tabs */}
      <div className="flex items-center gap-2">
        {tab("in", "Pop in")}
        {tab("out", "Pop out")}
        <span className="rounded-sm bg-surface2 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-muted">
          BETA
        </span>
      </div>

      {/* Scrollable list of effects */}
      <div className="scroll -mr-1 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {ANIMATIONS.map((anim) => {
          const active = state.animationId === anim.id;
          return (
            <button
              key={anim.id}
              onClick={() => patch({ animationId: anim.id })}
              className={`flex w-full items-center gap-3 rounded-md border p-2 text-left transition-colors ${
                active
                  ? "border-brand bg-brand/5"
                  : "border-line bg-surface hover:bg-surface2"
              }`}
            >
              <MiniPreview anim={anim} state={state} />
              <span
                className={`text-sm font-medium ${active ? "text-ink" : "text-sub"}`}
              >
                {anim.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* On-screen time slider */}
      <div className="rounded-md border border-line bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-sub">On-screen time</span>
          <span className="text-xs font-semibold text-brand">{state.duration.toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={3}
          step={0.1}
          value={state.duration}
          onChange={(e) => patch({ duration: parseFloat(e.target.value) })}
          className="range w-full"
        />
      </div>
    </aside>
  );
}
