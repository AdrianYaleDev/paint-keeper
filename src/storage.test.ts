import { describe, expect, it } from 'vitest'
import { emptyCollection, mergeGuest, mergeRemote, setStatus } from './storage'
import type { Paint } from './types'

const paint: Paint = { id: 'one', name: 'Black', brand: 'Brand', range: 'Base', color: '#000000' }
const other: Paint = { ...paint, id: 'two', name: 'White' }

describe('collection state', () => {
  it('moves a wishlist paint into the collection without duplicating it', () => {
    const wanted = setStatus(emptyCollection(), paint, 'wishlist')
    const purchased = setStatus(wanted, paint, 'owned')
    expect(purchased.entries.one?.status).toBe('owned')
    expect(purchased.dirty).toEqual(['one'])
  })

  it('merges guest data and gives owned priority over wishlist', () => {
    const account = setStatus(emptyCollection(), paint, 'wishlist')
    const guest = setStatus(setStatus(emptyCollection(), paint, 'owned'), other, 'wishlist')
    const merged = mergeGuest(account, guest)
    expect(merged.entries.one?.status).toBe('owned')
    expect(merged.entries.two?.status).toBe('wishlist')
    expect(merged.dirty).toEqual(['one', 'two'])
  })

  it('does not import guest removals or replace an owned account paint', () => {
    const account = setStatus(emptyCollection(), paint, 'owned')
    const guest = setStatus(setStatus(emptyCollection(), paint, 'wishlist'), other, 'none')
    expect(mergeGuest(account, guest)).toEqual(account)
  })

  it('preserves pending local edits when loading remote data', () => {
    const local = setStatus(emptyCollection(), paint, 'none')
    const remote = [{ paint, status: 'owned' as const, updatedAt: '2025-01-01' }, { paint: other, status: 'wishlist' as const, updatedAt: '2025-01-01' }]
    const merged = mergeRemote(local, remote)
    expect(merged.entries.one?.status).toBe('none')
    expect(merged.entries.two?.status).toBe('wishlist')
  })
})
