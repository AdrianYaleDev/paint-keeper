import { describe, expect, it } from 'vitest'
import { mergeProjects, projectProgress } from './projects'
import type { Collection, Paint, Project } from './types'

const paint = (id: string): Paint => ({ id, name: id, brand: 'B', range: '', color: '#000000' })
const project = (id: string, updatedAt: string, extra: Partial<Project> = {}): Project => ({ id, name: id, paintIds: [], updatedAt, ...extra })

describe('projects', () => {
  it('keeps the newest copy of each project, including deletions', () => {
    const merged = mergeProjects(
      [project('a', '2026-01-02', { name: 'new' }), project('b', '2026-01-01')],
      [project('a', '2026-01-01', { name: 'old' }), project('b', '2026-01-03', { deleted: true }), project('c', '2026-01-01')],
    )
    expect(merged.map(p => [p.id, p.name, Boolean(p.deleted)])).toEqual([['a', 'new', false], ['b', 'b', true], ['c', 'c', false]])
  })

  it('splits owned from missing paints and counts ones no longer in the catalogue', () => {
    const paints = new Map(['1', '2', '3'].map(id => [id, paint(id)]))
    const entries: Collection['entries'] = {
      '1': { paint: paint('1'), status: 'owned', updatedAt: '' },
      '2': { paint: paint('2'), status: 'wishlist', updatedAt: '' },
    }
    const result = projectProgress(project('p', '', { paintIds: ['1', '2', '3', 'gone'] }), paints, entries)
    expect(result.owned.map(p => p.id)).toEqual(['1'])
    expect(result.missing.map(p => p.id)).toEqual(['2', '3'])
    expect(result.unavailable).toBe(1)
  })

  it('treats dried-out pots as still needed', () => {
    const entries: Collection['entries'] = {
      a: { paint: paint('a'), status: 'owned', condition: 'dried', updatedAt: '' },
      b: { paint: paint('b'), status: 'owned', condition: 'low', updatedAt: '' },
    }
    const result = projectProgress(project('p', '', { paintIds: ['a', 'b'] }), new Map([['a', paint('a')], ['b', paint('b')]]), entries)
    expect(result.missing.map(p => p.id)).toEqual(['a'])
    expect(result.owned.map(p => p.id)).toEqual(['b'])
  })
})
