/** Instagram-style verified seal used in the DOM mini-previews. */
export default function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 1.5l2.35 1.7 2.9-.1 1.05 2.7 2.45 1.55-.6 2.85.95 2.75-2.2 1.9-.45 2.87-2.88.4L12.9 22.5 12 22l-2.8 1.4-2.2-2.05-2.88-.4-.45-2.87-2.2-1.9.95-2.75-.6-2.85L4.7 5.8l1.05-2.7 2.9.1L12 1.5z"
        fill="#3897f0"
      />
      <path
        d="M10.6 15.2l-3-3 1.3-1.3 1.7 1.7 4-4 1.3 1.3-5.3 5.3z"
        fill="#fff"
      />
    </svg>
  );
}
