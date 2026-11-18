import { NO_COLOUR, type Paint } from './types'

export const FINISHES = ['Matte', 'Satin', 'Gloss', 'Metallic']
export const MEDIUMS = ['Acrylic', 'Wash/Shade', 'Ink', 'Airbrush', 'Varnish']

// Optional keys are only present when the source (form or file column) supplies them.
// When updating an existing paint, absent keys are left unchanged and empty values clear the field.
export type NewPaint = {
  id?: string
  brand: string
  type: string
  name: string
  code?: string
  color?: string
  range?: string
  finish?: string
  medium?: string
  size_ml?: number | null
}
export type ImportResult = { paints: NewPaint[]; errors: string[] }

const FIELDS: Record<keyof NewPaint, string[]> = {
  id: ['id'],
  brand: ['brand'],
  type: ['type', 'paint type'],
  name: ['name', 'paint', 'paint name'],
  code: ['code', 'sku'],
  color: ['color', 'colour', 'hex', 'swatch'],
  range: ['range', 'product range'],
  finish: ['finish'],
  medium: ['medium'],
  size_ml: ['size_ml', 'size (ml)', 'size', 'ml', 'bottle size'],
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const input = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { cell += '"'; i++ }
      else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(cell); cell = '' }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++
      row.push(cell); cell = ''
      rows.push(row); row = []
    } else cell += char
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

export function normaliseColor(value: string): string | null {
  const hex = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(hex)) return `#${[...hex].map(c => c + c).join('')}`.toUpperCase()
  return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}`.toUpperCase() : null
}

const matchOption = (options: string[], value: string) => options.find(option => option.toLowerCase() === value.toLowerCase())

export function validatePaint(input: Partial<Record<keyof NewPaint, unknown>>): { paint?: NewPaint; error?: string } {
  const text = (value: unknown) => String(value ?? '').trim()
  const paint: NewPaint = { brand: text(input.brand), type: text(input.type), name: text(input.name) }
  if (input.code !== undefined) paint.code = text(input.code)
  if (input.color !== undefined) paint.color = text(input.color)
  const missing = (['brand', 'type', 'name'] as const).filter(key => !paint[key])
  if (missing.length) return { error: `missing ${missing.join(', ')}` }
  if (paint.color) {
    const color = normaliseColor(paint.color)
    if (!color) return { error: `invalid colour "${paint.color}"` }
    paint.color = color
  }
  if (input.id !== undefined && text(input.id)) {
    if (!UUID.test(text(input.id))) return { error: `invalid id "${text(input.id)}"` }
    paint.id = text(input.id).toLowerCase()
  }
  if (input.range !== undefined) paint.range = text(input.range)
  for (const [key, options] of [['finish', FINISHES], ['medium', MEDIUMS]] as const) {
    if (input[key] === undefined) continue
    const value = text(input[key])
    const match = value ? matchOption(options, value) : ''
    if (match === undefined) return { error: `invalid ${key} "${value}" (use ${options.join(', ')})` }
    paint[key] = match
  }
  if (input.size_ml !== undefined) {
    const value = text(input.size_ml)
    const size = value ? Number(value.replace(/\s*ml$/i, '')) : null
    if (size !== null && (!Number.isFinite(size) || size <= 0)) return { error: `invalid size "${value}"` }
    paint.size_ml = size
  }
  return { paint }
}

export function rowsToPaints(rows: unknown[][]): ImportResult {
  const [header, ...body] = rows.filter(row => row.some(cell => String(cell ?? '').trim()))
  if (!header) return { paints: [], errors: ['The file is empty.'] }
  const names = header.map(cell => String(cell ?? '').trim().toLowerCase())
  const columns = {} as Record<keyof NewPaint, number>
  for (const key of Object.keys(FIELDS) as (keyof NewPaint)[]) columns[key] = names.findIndex(name => FIELDS[key].includes(name))
  const absent = (['brand', 'type', 'name'] as const).filter(key => columns[key] < 0)
  if (absent.length) return { paints: [], errors: [`Missing required column${absent.length > 1 ? 's' : ''}: ${absent.join(', ')}. Expected headers: brand, type, name, code, colour, range, finish, medium, size_ml (plus id to update existing paints).`] }

  const paints: NewPaint[] = []
  const errors: string[] = []
  const seen = new Set<string>()
  body.forEach((row, index) => {
    const line = index + 2
    const { paint, error } = validatePaint(Object.fromEntries((Object.keys(columns) as (keyof NewPaint)[]).filter(key => columns[key] >= 0).map(key => [key, columns[key] < 0 ? '' : row[columns[key]]])))
    if (!paint) { errors.push(`Row ${line}: ${error}`); return }
    const id = paint.id ?? `${paint.brand}|${paint.type}|${paint.name}`.toLowerCase()
    if (seen.has(id)) { errors.push(`Row ${line}: duplicate of an earlier row (${paint.name})`); return }
    seen.add(id)
    paints.push(paint)
  })
  return { paints, errors }
}

export async function readPaintFile(file: File): Promise<ImportResult> {
  if (/\.xlsx$/i.test(file.name)) {
    const { readSheet } = await import('read-excel-file/browser')
    return rowsToPaints(await readSheet(file))
  }
  if (/\.csv$/i.test(file.name)) return rowsToPaints(parseCsv(await file.text()))
  return { paints: [], errors: ['Upload a .csv or .xlsx file.'] }
}

export const CSV_TEMPLATE = 'brand,type,name,code,colour,range,finish,medium,size_ml\nCitadel,Base,Example Red,21-99,#B22222,Base,Matte,Acrylic,12\n'

const csvCell = (value: unknown) => {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// Includes the id column so the file can be edited and re-imported to update existing paints.
export function paintsToCsv(paints: Paint[]): string {
  const rows = [['id', 'brand', 'type', 'name', 'code', 'colour', 'range', 'finish', 'medium', 'size_ml']]
  for (const paint of [...paints].sort((a, b) => a.brand.localeCompare(b.brand) || (a.type ?? '').localeCompare(b.type ?? '') || a.name.localeCompare(b.name))) {
    rows.push([paint.id, paint.brand, paint.type ?? '', paint.name, paint.code ?? '', paint.color === NO_COLOUR ? '' : paint.color, paint.range, paint.finish ?? '', paint.medium ?? '', paint.sizeMl == null ? '' : String(paint.sizeMl)])
  }
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
