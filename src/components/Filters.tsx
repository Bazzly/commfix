'use client'

import {
  CATEGORIES,
  CATEGORY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Category,
  type Status,
} from '@/lib/types'

export interface FilterState {
  categories: Category[]
  statuses: Status[]
}

interface FiltersProps {
  value: FilterState
  onChange: (next: FilterState) => void
}

export default function Filters({ value, onChange }: FiltersProps) {
  function toggleCategory(c: Category) {
    const categories = value.categories.includes(c)
      ? value.categories.filter((x) => x !== c)
      : [...value.categories, c]
    onChange({ ...value, categories })
  }

  function toggleStatus(s: Status) {
    const statuses = value.statuses.includes(s)
      ? value.statuses.filter((x) => x !== s)
      : [...value.statuses, s]
    onChange({ ...value, statuses })
  }

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div>
        <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-ink/50">
          Category
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-ink">
              <input
                type="checkbox"
                checked={value.categories.includes(c)}
                onChange={() => toggleCategory(c)}
                className="accent-amber"
              />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-ink/50">
          Status
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-ink">
              <input
                type="checkbox"
                checked={value.statuses.includes(s)}
                onChange={() => toggleStatus(s)}
                className="accent-amber"
              />
              {STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
