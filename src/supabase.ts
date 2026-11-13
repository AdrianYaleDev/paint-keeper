import { createClient } from '@supabase/supabase-js'
import type { Paint, PaintEntry, PaintStatus } from './types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key ? createClient(url, key) : null

type CatalogueRow = {
  id: string
  name: string
  code: string | null
  color: string | null
  brand: { name: string }
  paint_type: { name: string }
}
type EntryRow = {
  paint_id: string
  paint: Paint
  status: PaintStatus
  updated_at: string
}

export async function fetchCatalogue(): Promise<Paint[]> {
  if (!supabase) return []
  const rows: CatalogueRow[] = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from('paints').select('id, name, code, color, brand:brands!inner(name), paint_type:paint_types!inner(name)')
      .order('id').range(offset, offset + pageSize - 1)
      .overrideTypes<CatalogueRow[], { merge: false }>()
    if (error) throw error
    const page = data
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    code: row.code,
    brand: row.brand.name,
    type: row.paint_type.name,
    range: '',
    color: row.color ?? '#e5eee4',
  }))
}

export async function fetchEntries(userId: string): Promise<PaintEntry[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const rows: EntryRow[] = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from('user_paints')
      .select('paint_id, paint, status, updated_at').eq('user_id', userId)
      .order('paint_id').range(offset, offset + pageSize - 1)
    if (error) throw error
    const page = data as EntryRow[]
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return rows.map(row => ({
    paint: row.paint,
    status: row.status,
    updatedAt: row.updated_at,
  }))
}

export async function saveEntries(userId: string, entries: PaintEntry[]) {
  if (!supabase) throw new Error('Supabase is not configured.')
  if (!entries.length) return
  const { error } = await supabase.from('user_paints').upsert(entries.map(entry => ({
    user_id: userId,
    paint_id: entry.paint.id,
    paint: entry.paint,
    status: entry.status,
    updated_at: entry.updatedAt,
  })), { onConflict: 'user_id,paint_id' })
  if (error) throw error
}
