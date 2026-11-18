import { createClient } from '@supabase/supabase-js'
import type { Paint, PaintEntry, PaintStatus, PotCondition, Project } from './types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key ? createClient(url, key) : null

type CatalogueRow = {
  id: string
  name: string
  code: string | null
  color: string | null
  range?: string | null
  finish?: string | null
  medium?: string | null
  size_ml?: number | null
  brand: { name: string }
  paint_type: { name: string }
}
type EntryRow = {
  paint_id: string
  paint: Paint
  status: PaintStatus
  condition?: PotCondition | null
  restock?: boolean | null
  updated_at: string
}

const CATALOGUE_COLUMNS = 'id, name, code, color, brand:brands!inner(name), paint_type:paint_types!inner(name)'

export async function fetchCatalogue(): Promise<Paint[]> {
  if (!supabase) return []
  const rows: CatalogueRow[] = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const query = (columns: string) => supabase.from('paints').select(columns)
      .order('id').range(offset, offset + pageSize - 1)
      .overrideTypes<CatalogueRow[], { merge: false }>()
    let { data, error } = await query(`${CATALOGUE_COLUMNS}, range, finish, medium, size_ml`)
    // Falls back to the base columns until migration_inventory.sql has been run.
    if (error) ({ data, error } = await query(CATALOGUE_COLUMNS))
    if (error) throw error
    const page = data ?? []
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    code: row.code,
    brand: row.brand.name,
    type: row.paint_type.name,
    range: row.range ?? '',
    finish: row.finish ?? null,
    medium: row.medium ?? null,
    sizeMl: row.size_ml ?? null,
    color: row.color ?? '#e5eee4',
  }))
}

export async function fetchEntries(userId: string): Promise<PaintEntry[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const rows: EntryRow[] = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const query = (columns: string) => supabase.from('user_paints')
      .select(columns).eq('user_id', userId)
      .order('paint_id').range(offset, offset + pageSize - 1)
    let { data, error } = await query('paint_id, paint, status, condition, restock, updated_at')
    if (error) ({ data, error } = await query('paint_id, paint, status, updated_at'))
    if (error) throw error
    const page = (data ?? []) as unknown as EntryRow[]
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return rows.map(row => ({
    paint: row.paint,
    status: row.status,
    condition: row.condition ?? null,
    restock: Boolean(row.restock),
    updatedAt: row.updated_at,
  }))
}

export async function saveEntries(userId: string, entries: PaintEntry[]) {
  if (!supabase) throw new Error('Supabase is not configured.')
  if (!entries.length) return
  const rows = entries.map(entry => ({
    user_id: userId,
    paint_id: entry.paint.id,
    paint: entry.paint,
    status: entry.status,
    updated_at: entry.updatedAt,
  }))
  const { error } = await supabase.from('user_paints').upsert(rows.map((row, i) => ({
    ...row,
    condition: entries[i]!.condition ?? null,
    restock: Boolean(entries[i]!.restock),
  })), { onConflict: 'user_id,paint_id' })
  if (!error) return
  // Retry without the new columns until migration_inventory.sql has been run.
  const retry = await supabase.from('user_paints').upsert(rows, { onConflict: 'user_id,paint_id' })
  if (retry.error) throw retry.error
}

export async function fetchIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  return !error && Boolean(data)
}

export async function addPaints(paints: { brand: string; type: string; name: string; code: string; color: string }[]) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('admin_add_paints', { items: paints })
  if (error) throw error
  return data as { added: number; skipped: number }
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('user_projects').select('project').eq('user_id', userId)
  if (error) throw error
  return (data as { project: Project }[]).map(row => row.project)
}

export async function saveProjects(userId: string, projects: Project[]) {
  if (!supabase) throw new Error('Supabase is not configured.')
  if (!projects.length) return
  const { error } = await supabase.from('user_projects').upsert(projects.map(project => ({
    user_id: userId,
    project_id: project.id,
    project,
    updated_at: project.updatedAt,
  })), { onConflict: 'user_id,project_id' })
  if (error) throw error
}
