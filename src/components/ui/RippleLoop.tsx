export default function RippleLoop({ color = 'var(--color-amber)' }: { color?: string }) {
  return (
    <span className="relative flex h-16 w-16 items-center justify-center">
      {[0, 0.6, 1.2].map((delay) => (
        <span
          key={delay}
          className="communityfix-ripple-loop-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: color, animationDelay: `${delay}s` }}
        />
      ))}
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}
