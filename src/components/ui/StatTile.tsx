export default function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card bg-paper p-3">
      <p className="text-xs text-ink/55">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold text-ink">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}
