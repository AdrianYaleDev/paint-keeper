import { describe, expect, it } from 'vitest'
import { getFilterOptions, matchesPaint, paginatePaints } from './catalogue'
import type { Collection, Paint } from './types'

const paint: Paint = { id: '1', name: 'Blue', brand: 'Brand', type: 'Acrylic', code: 'AB-42', color: '#0000ff', range: '' }

describe('catalogue filters', () => {
  it('finds paint codes case insensitively alongside brand and type filters', () => {
    expect(matchesPaint(paint, ' ab-42 ', 'Brand', 'Acrylic')).toBe(true)
    expect(matchesPaint(paint, 'ab-42', 'Other', 'Acrylic')).toBe(false)
    expect(matchesPaint(paint, 'ab-42', 'Brand', 'Spray')).toBe(false)
  })

  describe('filter options', () => {
    const owned = { ...paint, brand: 'Owned brand', type: 'Acrylic' }
    const legacy: Paint = { id: '2', name: 'Legacy', brand: 'Legacy brand', range: 'Base', color: '#000000' }
    const wishlist = { ...paint, id: '3', brand: 'Wishlist brand', type: 'Spray' }
    const entries: Collection['entries'] = {
      '1': { paint: owned, status: 'owned', updatedAt: '' },
      '2': { paint: legacy, status: 'owned', updatedAt: '' },
      '3': { paint: wishlist, status: 'wishlist', updatedAt: '' },
    }
    const paints = [owned, legacy, wishlist, { ...paint, id: '4', brand: 'Other', type: 'Ink' }]

    it('only offers owned brands and types, including saved paints without a type', () => {
      expect(getFilterOptions(paints, entries, true, 'All brands')).toEqual({
        brands: ['Legacy brand', 'Owned brand'],
        paintTypes: ['Acrylic'],
      })
      expect(getFilterOptions(paints, {}, true, 'All brands')).toEqual({ brands: [], paintTypes: [] })
    })

    it('keeps the complete catalogue options in other views', () => {
      expect(getFilterOptions(paints, entries, false, 'All brands')).toEqual({
        brands: ['Legacy brand', 'Other', 'Owned brand', 'Wishlist brand'],
        paintTypes: ['Acrylic', 'Ink', 'Spray'],
      })
    })

    it('restricts types to the chosen brand without restricting brand choices', () => {
      expect(getFilterOptions(paints, entries, false, 'Wishlist brand')).toEqual({
        brands: ['Legacy brand', 'Other', 'Owned brand', 'Wishlist brand'],
        paintTypes: ['Spray'],
      })
      expect(getFilterOptions(paints, entries, false, 'Legacy brand').paintTypes).toEqual([])
    })

    it('restricts types to owned paints of the chosen brand and handles removed brands', () => {
      const another = { ...paint, id: '5', brand: 'Owned brand', type: 'Ink' }
      const allPaints = [...paints, another]
      expect(getFilterOptions(allPaints, entries, true, 'Owned brand').paintTypes).toEqual(['Acrylic'])
      expect(getFilterOptions(allPaints, entries, true, 'Wishlist brand').paintTypes).toEqual(['Acrylic'])
      const updatedEntries = { ...entries, '5': { paint: another, status: 'owned' as const, updatedAt: '' } }
      expect(getFilterOptions(allPaints, updatedEntries, true, 'Owned brand').paintTypes).toEqual(['Acrylic', 'Ink'])
    })
  })

  describe('catalogue pagination', () => {
    const paints = Array.from({ length: 49 }, (_, index) => ({ ...paint, id: String(index) }))

    it('returns 24 paints per page and the remainder on the last page', () => {
      expect(paginatePaints(paints, 1, 24)).toMatchObject({ currentPage: 1, pageCount: 3, start: 0, paints: paints.slice(0, 24) })
      expect(paginatePaints(paints, 2, 24).paints).toEqual(paints.slice(24, 48))
      expect(paginatePaints(paints, 3, 24)).toMatchObject({ currentPage: 3, pageCount: 3, start: 48, paints: paints.slice(48) })
    })

    it('clamps pages when results shrink or are empty', () => {
      expect(paginatePaints(paints.slice(0, 25), 3, 24)).toMatchObject({ currentPage: 2, pageCount: 2, start: 24 })
      expect(paginatePaints([], 3, 24)).toEqual({ currentPage: 1, pageCount: 1, start: 0, paints: [] })
    })
  })

  it('supports null codes and older cached entries without a type or code', () => {
    expect(matchesPaint({ ...paint, code: null }, 'blue', 'All brands', 'All types')).toBe(true)
    const legacy: Paint = { id: '2', name: 'Red', brand: 'Brand', range: 'Base', color: '#ff0000' }
    expect(matchesPaint(legacy, 'base', 'All brands', 'All types')).toBe(true)
    expect(matchesPaint(legacy, 'red', 'All brands', 'Acrylic')).toBe(false)
  })
})
