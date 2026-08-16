'use client'

import { useState, type FormEvent } from 'react'
import { insertReport, uploadPhoto } from '@/lib/reports'
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/lib/types'
import Button from './ui/Button'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5MB

interface ReportFormProps {
  pin: { lat: number; lng: number } | null
  onCancel: () => void
  onSubmitted: () => void
}

const inputClasses =
  'mt-1 w-full rounded-lg border border-ink/15 bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-amber'

export default function ReportForm({ pin, onCancel, onSubmitted }: ReportFormProps) {
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > MAX_PHOTO_BYTES) {
      setError('Photo must be 5MB or smaller.')
      setPhoto(null)
      e.target.value = ''
      return
    }
    setError(null)
    setPhoto(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!pin) {
      setError('Click a location on the map to drop a pin first.')
      return
    }
    if (!category) {
      setError('Please choose a category.')
      return
    }

    setSubmitting(true)
    try {
      let photoUrl: string | null = null
      if (photo) {
        photoUrl = await uploadPhoto(photo)
      }

      await insertReport({
        category,
        description,
        reporterContact: contact,
        lat: pin.lat,
        lng: pin.lng,
        photoUrl,
      })

      setSuccess(true)
      setCategory('')
      setDescription('')
      setContact('')
      setPhoto(null)
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-3 rounded-card bg-moss/10 p-4">
        <p className="text-sm font-medium text-moss">
          Thanks! Your report has been submitted and is now visible on the map.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setSuccess(false)
            onCancel()
          }}
        >
          Done
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {pin && (
        <p className="font-mono text-xs text-ink/50">
          Pin set at {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-ink">Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          required
          className={inputClasses}
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClasses}
          placeholder="What's the issue? Where exactly?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Photo (optional, max 5MB)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-1 w-full text-sm text-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Contact (optional)</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={inputClasses}
          placeholder="Phone or email, if you'd like updates"
        />
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={submitting || !pin}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
