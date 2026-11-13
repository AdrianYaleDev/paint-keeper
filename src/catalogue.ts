import type { Collection, Paint } from './types'

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

export function matchesPaint(paint: Paint, query: string, brand: string, paintType: string): boolean {
  const search = `${paint.name} ${paint.brand} ${paint.type ?? ''} ${paint.range} ${paint.code ?? ''}`
  return (brand === 'All brands' || paint.brand === brand)
    && (paintType === 'All types' || paint.type === paintType)
    && search.toLowerCase().includes(query.toLowerCase().trim())
}
