export type FixKey = 'pothole' | 'streetlight' | 'waste'

export interface Beat {
  key: FixKey
  label: string
  reportedCaption: string
  fixedCaption: string
}

export const BEATS: Beat[] = [
  {
    key: 'pothole',
    label: 'Pothole',
    reportedCaption: 'Pothole reported.',
    fixedCaption: 'Reported → Confirmed by 12 neighbors → Fixed in 9 days.',
  },
  {
    key: 'streetlight',
    label: 'Streetlight',
    reportedCaption: 'Streetlight reported.',
    fixedCaption: 'Reported → Confirmed by 8 neighbors → Fixed in 5 days.',
  },
  {
    key: 'waste',
    label: 'Waste dump',
    reportedCaption: 'Waste dump reported.',
    fixedCaption: 'Reported → Confirmed by 21 neighbors → Fixed in 14 days.',
  },
]

export type FixState = Record<FixKey, boolean>

export const INITIAL_FIX_STATE: FixState = {
  pothole: false,
  streetlight: false,
  waste: false,
}
