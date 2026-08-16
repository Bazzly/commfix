'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { fetchReports, updateReportStatus } from '@/lib/reports'
import { CATEGORY_LABELS, STATUSES, STATUS_LABELS, type Report, type Status } from '@/lib/types'

type SortKey = 'created_at' | 'status'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/admin/login')
        return
      }
      setUser(data.user)
      setCheckingAuth(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/admin/login')
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return
    fetchReports()
      .then(setReports)
      .finally(() => setLoading(false))
  }, [user])

  const sortedReports = useMemo(() => {
    const copy = [...reports]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'created_at') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        cmp = a.status.localeCompare(b.status)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [reports, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  async function handleStatusChange(id: string, status: Status) {
    const prev = reports
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await updateReportStatus(id, status)
    } catch {
      setReports(prev)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (checkingAuth) {
    return <p className="p-6 text-sm text-gray-500">Checking authentication…</p>
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Reports</h1>
        <button
          onClick={handleLogout}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Log out
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Description</th>
                <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort('created_at')}>
                  Date {sortKey === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort('status')}>
                  Status {sortKey === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 py-2">Upvotes</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{CATEGORY_LABELS[r.category]}</td>
                  <td className="max-w-xs truncate px-3 py-2">{r.description}</td>
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value as Status)}
                      className="rounded border border-gray-300 px-1.5 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">{r.upvotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
