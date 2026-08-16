import { CATEGORY_COLORS, CATEGORY_LABELS, type Category } from '@/lib/types'

export default function CategoryPill({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: CATEGORY_COLORS[category] }}
        aria-hidden="true"
      />
      {CATEGORY_LABELS[category]}
    </span>
  )
}
