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
    <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 p-3 text-sm">
      <div>
        <p className="mb-1 font-medium">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={value.categories.includes(c)}
                onChange={() => toggleCategory(c)}
              />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 font-medium">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={value.statuses.includes(s)}
                onChange={() => toggleStatus(s)}
              />
              {STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
