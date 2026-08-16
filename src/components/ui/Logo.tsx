export default function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="34" height="34" viewBox="0 0 240 240" aria-hidden="true">
        <path
          d="M120 40
             C 90 40, 65 65, 65 100
             C 65 148, 120 190, 120 190
             C 120 190, 175 148, 175 100
             C 175 65, 150 40, 120 40
             Z"
          fill="var(--color-ink)"
        />
        <circle cx="120" cy="100" r="22" fill="var(--color-amber)" />
        <g fill="none" stroke="var(--color-slate)" strokeWidth="5">
          <circle cx="120" cy="196" r="11" opacity="0.85" />
          <circle cx="120" cy="196" r="22" opacity="0.5" />
          <circle cx="120" cy="196" r="33" opacity="0.25" />
        </g>
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          CommunityFix
        </span>
      )}
    </span>
  )
}
