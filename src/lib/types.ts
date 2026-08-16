export type Category = 'pothole' | 'streetlight' | 'waste' | 'drainage' | 'other'
export type Status = 'reported' | 'in_progress' | 'resolved'

export interface Report {
  id: string
  category: Category
  description: string | null
  photo_url: string | null
  status: Status
  location: { lat: number; lng: number }
  reporter_contact: string | null
  upvotes: number
  created_at: string
  updated_at: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  pothole: 'Pothole',
  streetlight: 'Broken Streetlight',
  waste: 'Illegal Waste Dump',
  drainage: 'Broken Drainage',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  pothole: '#ef4444',
  streetlight: '#eab308',
  waste: '#16a34a',
  drainage: '#3b82f6',
  other: '#6b7280',
}

export const STATUS_LABELS: Record<Status, string> = {
  reported: 'Reported',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export const CATEGORIES: Category[] = ['pothole', 'streetlight', 'waste', 'drainage', 'other']
export const STATUSES: Status[] = ['reported', 'in_progress', 'resolved']
