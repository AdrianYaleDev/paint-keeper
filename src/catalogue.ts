import type { Collection, Paint } from './types'

export const COLOUR_GROUPS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'White', 'Grey', 'Black'] as const
export type ColourGroup = typeof COLOUR_GROUPS[number]

export function colourGroup(hex: string | null | undefined): ColourGroup | 'Other' {
  const digits = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')?.[1]
  if (!digits) return 'Other'
  const channel = (i: number) => parseInt(digits.slice(i, i + 2), 16) / 255
  const r = channel(0), g = channel(2), b = channel(4)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  if (l >= 0.92) return 'White'
  if (l <= 0.1) return 'Black'
  if (s < 0.12) return l > 0.85 ? 'White' : l < 0.15 ? 'Black' : 'Grey'
  let h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  h = (h * 60 + 360) % 360
  if (h >= 15 && h < 50 && (l < 0.38 || s < 0.45)) return 'Brown'
  if (h < 15 || h >= 345) return l > 0.7 ? 'Pink' : 'Red'
  if (h < 45) return 'Orange'
  if (h < 70) return 'Yellow'
  if (h < 165) return 'Green'
  if (h < 260) return 'Blue'
  if (h < 295) return 'Purple'
  return l > 0.65 ? 'Pink' : h < 320 ? 'Purple' : 'Red'
}

export function getFilterOptions(paints: Paint[], entries: Collection['entries'], ownedOnly: boolean, brand: string) {
  const available = ownedOnly ? paints.filter(paint => entries[paint.id]?.status === 'owned') : paints
  const brands = [...new Set(available.map(paint => paint.brand))].sort()
  const activeBrand = ownedOnly && !brands.includes(brand) ? 'All brands' : brand
  const brandPaints = activeBrand === 'All brands' ? available : available.filter(paint => paint.brand === activeBrand)
  return {
    brands,
    paintTypes: [...new Set(brandPaints.map(paint => paint.type).filter((value): value is string => Boolean(value)))].sort(),
  }
}

export function paginatePaints(paints: Paint[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(paints.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), pageCount)
  const start = (currentPage - 1) * pageSize
  return { paints: paints.slice(start, start + pageSize), currentPage, pageCount, start }
}

export function matchesPaint(paint: Paint, query: string, brand: string, paintType: string, colour = 'All colours'): boolean {
  const search = `${paint.name} ${paint.brand} ${paint.type ?? ''} ${paint.range} ${paint.code ?? ''}`
  return (brand === 'All brands' || paint.brand === brand)
    && (paintType === 'All types' || paint.type === paintType)
    && (colour === 'All colours' || colourGroup(paint.color) === colour)
    && search.toLowerCase().includes(query.toLowerCase().trim())
}
