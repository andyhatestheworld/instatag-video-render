"use client";

import type { AppState } from "@/lib/types";
import TipControl from "./TipControl";

interface Props {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}

function Toggle({
  label,
  active,
  onClick,
  hint,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors ${
        active ? "border-brand bg-brand/5" : "border-line bg-surface hover:bg-surface2"
      }`}
    >
      <span className="flex flex-col">
        <span className={`text-sm font-medium ${active ? "text-ink" : "text-sub"}`}>
          {label}
        </span>
        {hint && <span className="text-[10px] text-muted">{hint}</span>}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          active ? "bg-brand" : "bg-surface2 border border-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            active ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function ModesPanel({ state, patch }: Props) {
  return (
    <aside className="scroll flex h-full flex-col gap-2.5 overflow-y-auto rounded-md border border-line bg-surface p-3">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Modes
      </h2>

      <Toggle
        label="Typewriter"
        hint="Type out letter by letter"
        active={state.typewriter}
        onClick={() => patch({ typewriter: !state.typewriter })}
      />
      <Toggle
        label="Verified"
        hint="Blue verified badge"
        active={state.verified}
        onClick={() => patch({ verified: !state.verified })}
      />
      <Toggle
        label="@ Prefix"
        hint="Show the @ symbol"
        active={state.atPrefix}
        onClick={() => patch({ atPrefix: !state.atPrefix })}
      />
      <Toggle
        label="Background"
        hint="Rounded bubble behind text"
        active={state.background}
        onClick={() => patch({ background: !state.background })}
      />
      <Toggle
        label={state.darkMode ? "Light mode" : "Dark mode"}
        hint="Flip text / bubble colors"
        active={state.darkMode}
        onClick={() => patch({ darkMode: !state.darkMode })}
      />

      {/* Reveal direction */}
      <div className="rounded-md border border-line bg-surface p-3">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted">
          Text reveal
        </span>
        <div className="flex gap-2">
          {(
            [
              { value: "top", label: "From top", d: "M12 5v12m0 0l-5-5m5 5l5-5" },
              { value: "bottom", label: "From bottom", d: "M12 19V7m0 0l-5 5m5-5l5 5" },
            ] as const
          ).map((o) => (
            <button
              key={o.value}
              onClick={() => patch({ revealFrom: o.value })}
              className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition-colors ${
                state.revealFrom === o.value
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line bg-surface text-sub hover:text-ink"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d={o.d}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {state.background && (
        <div className="mt-1 space-y-3 rounded-md border border-line bg-surface2 p-3">
          <TipControl state={state} patch={patch} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Opacity
              </span>
              <span className="text-xs font-semibold text-brand">
                {Math.round(state.bgOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(state.bgOpacity * 100)}
              onChange={(e) => patch({ bgOpacity: parseInt(e.target.value, 10) / 100 })}
              className="range w-full"
            />
          </div>
        </div>
      )}
    </aside>
  );
}
