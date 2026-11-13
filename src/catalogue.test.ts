import { describe, expect, it } from 'vitest'
import { matchesPaint } from './catalogue'
import type { Paint } from './types'

const paint: Paint = { id: '1', name: 'Blue', brand: 'Brand', type: 'Acrylic', code: 'AB-42', color: '#0000ff', range: '' }

describe('catalogue filters', () => {
  it('finds paint codes case insensitively alongside brand and type filters', () => {
    expect(matchesPaint(paint, ' ab-42 ', 'Brand', 'Acrylic')).toBe(true)
    expect(matchesPaint(paint, 'ab-42', 'Other', 'Acrylic')).toBe(false)
    expect(matchesPaint(paint, 'ab-42', 'Brand', 'Spray')).toBe(false)
  })

  it('supports null codes and older cached entries without a type or code', () => {
    expect(matchesPaint({ ...paint, code: null }, 'blue', 'All brands', 'All types')).toBe(true)
    const legacy: Paint = { id: '2', name: 'Red', brand: 'Brand', range: 'Base', color: '#ff0000' }
    expect(matchesPaint(legacy, 'base', 'All brands', 'All types')).toBe(true)
    expect(matchesPaint(legacy, 'red', 'All brands', 'Acrylic')).toBe(false)
  })
})
