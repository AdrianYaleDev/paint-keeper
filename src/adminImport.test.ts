import { describe, expect, it } from 'vitest'
import { normaliseColor, parseCsv, rowsToPaints } from './adminImport'

describe('admin import', () => {
  it('parses quoted CSV fields, escaped quotes and CRLF', () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"']])
  })

  it('maps flexible headers, normalises colours and reports row problems', () => {
    const { paints, errors } = rowsToPaints(parseCsv([
      'Brand,Paint Type,Name,SKU,Colour',
      'Citadel,Base,Red,21-1,b22',
      'Citadel,Base,red,,',
      'Citadel,Base,,,',
      'Citadel,Layer,Blue,,notacolour',
    ].join('\n')))
    expect(paints).toEqual([{ brand: 'Citadel', type: 'Base', name: 'Red', code: '21-1', color: '#BB2222' }])
    expect(errors).toEqual([
      'Row 3: duplicate of an earlier row (red)',
      'Row 4: missing name',
      'Row 5: invalid colour "notacolour"',
    ])
  })

  it('requires the brand, type and name columns', () => {
    expect(rowsToPaints([['brand', 'name']]).errors[0]).toContain('type')
    expect(normaliseColor('#12345')).toBeNull()
  })
})
