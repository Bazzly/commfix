import { supabase } from './supabase'
import type { Category, Report, Status } from './types'

interface ReportRow {
  id: string
  category: Category
  description: string | null
  photo_url: string | null
  status: Status
  lat: number
  lng: number
  reporter_contact: string | null
  upvotes: number
  created_at: string
  updated_at: string
}

function rowToReport(row: ReportRow): Report {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    photo_url: row.photo_url,
    status: row.status,
    location: { lat: row.lat, lng: row.lng },
    reporter_contact: row.reporter_contact,
    upvotes: row.upvotes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

const SELECT_COLUMNS =
  'id, category, description, photo_url, status, lat, lng, reporter_contact, upvotes, created_at, updated_at'

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ReportRow[]).map(rowToReport)
}

export async function fetchReport(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? rowToReport(data as ReportRow) : null
}

export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('report-photos').upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('report-photos').getPublicUrl(path)
  return data.publicUrl
}

export interface NewReport {
  category: Category
  description: string
  reporterContact: string
  lat: number
  lng: number
  photoUrl: string | null
}

export async function insertReport(report: NewReport): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    category: report.category,
    description: report.description || null,
    reporter_contact: report.reporterContact || null,
    photo_url: report.photoUrl,
    location: `SRID=4326;POINT(${report.lng} ${report.lat})`,
  })

  if (error) throw error
}

export async function upvoteReport(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_upvotes', { report_id: id })
  if (error) throw error
}

export async function updateReportStatus(id: string, status: Status): Promise<void> {
  const { error } = await supabase.from('reports').update({ status }).eq('id', id)
  if (error) throw error
}
