import { createClient } from '@supabase/supabase-js'

// Falls back to a syntactically-valid placeholder so builds don't crash before
// real Supabase credentials are set in .env.local / Vercel env vars.
function isValidUrl(value: string | undefined): boolean {
  if (!value) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const supabaseUrl = isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL as string)
  : 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
