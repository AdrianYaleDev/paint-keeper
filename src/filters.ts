export type SavedFilters = { query: string; brand: string; paintType: string; colour: string }

const KEY = 'paint-keeper:v1:filters'
export const defaultFilters: SavedFilters = { query: '', brand: 'All brands', paintType: 'All types', colour: 'All colours' }

export function loadFilters(): SavedFilters {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<SavedFilters>
    const text = (value: unknown, fallback: string) => typeof value === 'string' ? value : fallback
    return {
      query: text(data.query, defaultFilters.query),
      brand: text(data.brand, defaultFilters.brand),
      paintType: text(data.paintType, defaultFilters.paintType),
      colour: text(data.colour, defaultFilters.colour),
    }
  } catch {
    return defaultFilters
  }
}

export function saveFilters(filters: SavedFilters) {
  try { localStorage.setItem(KEY, JSON.stringify(filters)) } catch { /* storage unavailable */ }
}

export function hasActiveFilters(filters: SavedFilters) {
  return (Object.keys(defaultFilters) as (keyof SavedFilters)[]).some(key => filters[key] !== defaultFilters[key])
}
