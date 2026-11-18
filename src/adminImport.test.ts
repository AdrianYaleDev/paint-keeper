import { describe, expect, it } from 'vitest'
import { normaliseColor, paintsToCsv, parseCsv, rowsToPaints } from './adminImport'

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

  it('reads the new columns and validates finish, medium and size', () => {
    const { paints, errors } = rowsToPaints(parseCsv([
      'brand,type,name,range,finish,medium,size_ml',
      'Vallejo,Air,Gold,Model Air,metallic,airbrush,17 ml',
      'Vallejo,Air,Bad,,Shiny,,',
      'Vallejo,Air,Tiny,,,,0',
    ].join('\n')))
    expect(paints).toEqual([{ brand: 'Vallejo', type: 'Air', name: 'Gold', range: 'Model Air', finish: 'Metallic', medium: 'Airbrush', size_ml: 17 }])
    expect(errors).toEqual(['Row 3: invalid finish "Shiny" (use Matte, Satin, Gloss, Metallic)', 'Row 4: invalid size "0"'])
  })

  it('round-trips an export and only changes columns that are present', () => {
    const csv = paintsToCsv([
      { id: '477a5157-462d-4f73-98cd-d092a9439219', brand: 'Citadel', type: 'Base', name: 'Red, deep', code: '21-1', color: '#B22222', range: '', finish: 'Matte', sizeMl: 12 },
      { id: '577a5157-462d-4f73-98cd-d092a9439219', brand: 'Citadel', type: 'Base', name: 'Plain', color: '#e5eee4', range: '' },
    ])
    const { paints, errors } = rowsToPaints(parseCsv(csv))
    expect(errors).toEqual([])
    expect(paints[0]).toMatchObject({ id: '577a5157-462d-4f73-98cd-d092a9439219', name: 'Plain', color: '', size_ml: null })
    expect(paints[1]).toMatchObject({ id: '477a5157-462d-4f73-98cd-d092a9439219', name: 'Red, deep', color: '#B22222', finish: 'Matte', size_ml: 12 })
    expect(rowsToPaints([['id', 'brand', 'type', 'name'], ['not-a-uuid', 'B', 'T', 'N']]).errors).toEqual(['Row 2: invalid id "not-a-uuid"'])
    expect(rowsToPaints([['brand', 'type', 'name'], ['B', 'T', 'N']]).paints[0]).toEqual({ brand: 'B', type: 'T', name: 'N' })
  })
})
