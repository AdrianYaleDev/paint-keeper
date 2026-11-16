export type NewPaint = { brand: string; type: string; name: string; code: string; color: string }
export type ImportResult = { paints: NewPaint[]; errors: string[] }

const FIELDS: Record<keyof NewPaint, string[]> = {
  brand: ['brand'],
  type: ['type', 'paint type', 'range'],
  name: ['name', 'paint', 'paint name'],
  code: ['code', 'sku'],
  color: ['color', 'colour', 'hex', 'swatch'],
}

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

export function validatePaint(input: Partial<Record<keyof NewPaint, unknown>>): { paint?: NewPaint; error?: string } {
  const text = (value: unknown) => String(value ?? '').trim()
  const paint: NewPaint = { brand: text(input.brand), type: text(input.type), name: text(input.name), code: text(input.code), color: text(input.color) }
  const missing = (['brand', 'type', 'name'] as const).filter(key => !paint[key])
  if (missing.length) return { error: `missing ${missing.join(', ')}` }
  if (paint.color) {
    const color = normaliseColor(paint.color)
    if (!color) return { error: `invalid colour "${paint.color}"` }
    paint.color = color
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
  if (absent.length) return { paints: [], errors: [`Missing required column${absent.length > 1 ? 's' : ''}: ${absent.join(', ')}. Expected headers: brand, type, name, code, colour.`] }

  const paints: NewPaint[] = []
  const errors: string[] = []
  const seen = new Set<string>()
  body.forEach((row, index) => {
    const line = index + 2
    const { paint, error } = validatePaint(Object.fromEntries((Object.keys(columns) as (keyof NewPaint)[]).map(key => [key, columns[key] < 0 ? '' : row[columns[key]]])))
    if (!paint) { errors.push(`Row ${line}: ${error}`); return }
    const id = `${paint.brand}|${paint.type}|${paint.name}`.toLowerCase()
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

export const CSV_TEMPLATE = 'brand,type,name,code,colour\nCitadel,Base,Example Red,21-99,#B22222\n'
