export default function StatsCard({
  total,
  resolved,
  className = '',
}: {
  total: number
  resolved: number
  className?: string
}) {
  return (
    <div
      className={`rounded-card bg-paper/80 px-4 py-3 shadow-(--shadow-soft) backdrop-blur-md ${className}`}
    >
      <p className="font-display text-sm font-bold text-ink">
        {total.toLocaleString()} issue{total === 1 ? '' : 's'} reported.{' '}
        <span className="text-moss">{resolved.toLocaleString()} fixed.</span>
      </p>
    </div>
  )
}
