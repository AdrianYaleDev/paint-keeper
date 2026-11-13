import type { Collection, Paint, PaintEntry, PaintStatus } from './types'

const PREFIX = 'paint-keeper:v1:'
export const guestKey = 'guest'
export const emptyCollection = (): Collection => ({ entries: {}, dirty: [] })

export function readCollection(key: string): Collection {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return emptyCollection()
  const data: unknown = JSON.parse(raw)
  if (!data || typeof data !== 'object' || !('entries' in data) || !('dirty' in data)) {
    throw new Error('Saved collection data is invalid. Your data has not been overwritten.')
  }
  return data as Collection
}

export function writeCollection(key: string, collection: Collection) {
  localStorage.setItem(PREFIX + key, JSON.stringify(collection))
}

export function setStatus(collection: Collection, paint: Paint, status: PaintStatus): Collection {
  return {
    entries: {
      ...collection.entries,
      [paint.id]: { paint, status, updatedAt: new Date().toISOString() },
    },
    dirty: [...new Set([...collection.dirty, paint.id])],
  }
}

export function mergeGuest(account: Collection, guest: Collection): Collection {
  let result = account
  for (const entry of Object.values(guest.entries)) {
    if (entry.status === 'none') continue
    const existing = result.entries[entry.paint.id]
    const status = existing?.status === 'owned' || entry.status === 'owned' ? 'owned' : 'wishlist'
    if (!existing || existing.status !== status) {
      result = setStatus(result, entry.paint, status)
    }
  }
  return result
}

export function mergeRemote(local: Collection, remote: PaintEntry[]): Collection {
  const entries = Object.fromEntries(remote.map(entry => [entry.paint.id, entry]))
  for (const id of local.dirty) {
    const entry = local.entries[id]
    if (entry) entries[id] = entry
  }
  return { entries, dirty: local.dirty }
}

export function readCatalogue(): Paint[] {
  const raw = localStorage.getItem(PREFIX + 'catalogue')
  return raw ? JSON.parse(raw) as Paint[] : []
}

export function writeCatalogue(paints: Paint[]) {
  localStorage.setItem(PREFIX + 'catalogue', JSON.stringify(paints))
}
