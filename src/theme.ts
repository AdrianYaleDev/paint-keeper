export type Theme = 'light' | 'dark'

const KEY = 'paint-keeper-theme'
const META_COLORS: Record<Theme, string> = { light: '#f7f6f2', dark: '#161d19' }

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme])
  if (!persist) return
  try { localStorage.setItem(KEY, theme) } catch { /* storage unavailable */ }
}
