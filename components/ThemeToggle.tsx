"use client";

interface Props {
  dark: boolean;
  onToggle: () => void;
}

/** Top-left UI theme toggle (light / dark chrome — independent of the tag's own Dark mode). */
export default function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={dark ? "Switch to light UI" : "Switch to dark UI"}
      aria-label="Toggle interface theme"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-sub transition-colors hover:border-brand hover:text-brand"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
