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
  pothole: '#c1543c', // rust
  streetlight: '#f2a93b', // amber
  waste: '#8a6d3b', // moss-adjacent brown
  drainage: '#7a94a0', // slate
  other: '#8c8478', // warm neutral
}

export const STATUS_LABELS: Record<Status, string> = {
  reported: 'Reported',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export const STATUS_COLORS: Record<Status, string> = {
  reported: '#f2a93b', // amber
  in_progress: '#7a94a0', // slate
  resolved: '#4c7a5b', // moss
}

export const CATEGORIES: Category[] = ['pothole', 'streetlight', 'waste', 'drainage', 'other']
export const STATUSES: Status[] = ['reported', 'in_progress', 'resolved']
