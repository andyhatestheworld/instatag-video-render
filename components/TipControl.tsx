"use client";

import type { AppState, Tip } from "@/lib/types";

interface Props {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}

/** Three icon buttons that pick the shape of the background bubble. */
export default function TipControl({ state, patch }: Props) {
  const options: { value: Tip; label: string; icon: JSX.Element }[] = [
    {
      value: "up",
      label: "Tip up",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M12 4l4 4H8l4-4z" fill="currentColor" />
          <rect x="4" y="8" width="16" height="9" rx="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      value: "down",
      label: "Tip down",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <rect x="4" y="7" width="16" height="9" rx="3" fill="currentColor" />
          <path d="M12 20l-4-4h8l-4 4z" fill="currentColor" />
        </svg>
      ),
    },
    {
      value: "none",
      label: "No tip",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <rect x="4" y="8" width="16" height="8" rx="4" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted">
        Tip
      </span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => patch({ tip: o.value })}
            title={o.label}
            aria-label={o.label}
            className={`flex h-10 flex-1 items-center justify-center rounded-md border transition-colors ${
              state.tip === o.value
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {o.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
