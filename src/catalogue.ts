import type { Paint } from './types'

export function matchesPaint(paint: Paint, query: string, brand: string, paintType: string): boolean {
  const search = `${paint.name} ${paint.brand} ${paint.type ?? ''} ${paint.range} ${paint.code ?? ''}`
  return (brand === 'All brands' || paint.brand === brand)
    && (paintType === 'All types' || paint.type === paintType)
    && search.toLowerCase().includes(query.toLowerCase().trim())
}
