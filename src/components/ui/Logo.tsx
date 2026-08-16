export default function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="24" r="15" fill="none" stroke="var(--color-amber)" strokeWidth="1.5" opacity="0.35" />
        <circle cx="20" cy="24" r="10" fill="none" stroke="var(--color-amber)" strokeWidth="1.5" opacity="0.55" />
        <path
          d="M20 6c-5.5 0-10 4.4-10 9.8 0 7.4 10 16.2 10 16.2s10-8.8 10-16.2C30 10.4 25.5 6 20 6z"
          fill="var(--color-ink)"
        />
        <circle cx="20" cy="15.5" r="3.6" fill="var(--color-paper)" />
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          CommunityFix
        </span>
      )}
    </span>
  )
}
