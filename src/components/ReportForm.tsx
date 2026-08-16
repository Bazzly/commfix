'use client'

import { useState, type FormEvent } from 'react'
import { insertReport, uploadPhoto } from '@/lib/reports'
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/lib/types'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5MB

interface ReportFormProps {
  pin: { lat: number; lng: number } | null
  onCancel: () => void
  onSubmitted: () => void
}

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
      <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          Thanks! Your report has been submitted and is now visible on the map.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            onCancel()
          }}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-600">
        {pin ? (
          <>
            Pin set at {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
          </>
        ) : (
          'Click anywhere on the map to drop a pin at the issue location.'
        )}
      </p>

      <div>
        <label className="block text-sm font-medium">Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          required
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
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
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="What's the issue? Where exactly?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Photo (optional, max 5MB)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-1 w-full text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Contact (optional)</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="Phone or email, if you'd like updates"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !pin}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
