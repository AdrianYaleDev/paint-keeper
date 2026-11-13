import { useMemo, useState } from 'react'
import { Bookmark, Check, ChevronDown, Cloud, Layers3, LogOut, Paintbrush, Search, ShoppingBag, X } from 'lucide-react'
import { supabase } from './supabase'
import { signUpWithEmail } from './auth'
import { matchesPaint } from './catalogue'
import type { Paint } from './types'
import { usePaints } from './usePaints'

type View = 'catalogue' | 'owned' | 'wishlist'
type Dialog = 'auth' | null

const views: { id: View; label: string; icon: typeof Layers3 }[] = [
  { id: 'catalogue', label: 'All paints', icon: Layers3 },
  { id: 'owned', label: 'My collection', icon: Paintbrush },
  { id: 'wishlist', label: 'Shopping list', icon: ShoppingBag },
]

function App() {
  const { user, authReady, collection, catalogue, notice, setNotice, syncState, changeStatus, retrySync } = usePaints()
  const [view, setView] = useState<View>('catalogue')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('All brands')
  const [paintType, setPaintType] = useState('All types')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authMessage, setAuthMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const paints = useMemo(() => {
    const all = new Map<string, Paint>()
    for (const entry of Object.values(collection.entries)) all.set(entry.paint.id, entry.paint)
    for (const paint of catalogue) all.set(paint.id, paint)
    return [...all.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [catalogue, collection])
  const brands = useMemo(() => [...new Set(paints.map(paint => paint.brand))].sort(), [paints])
  const paintTypes = useMemo(() => [...new Set(paints.map(paint => paint.type).filter((value): value is string => Boolean(value)))].sort(), [paints])
  const owned = Object.values(collection.entries).filter(entry => entry.status === 'owned').length
  const wanted = Object.values(collection.entries).filter(entry => entry.status === 'wishlist').length
  const visible = paints.filter(paint => {
    const status = collection.entries[paint.id]?.status ?? 'none'
    return (view === 'catalogue' || status === view) && matchesPaint(paint, query, brand, paintType)
  })

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setAuthMessage('')
    try {
      const { data, error } = authMode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await signUpWithEmail(supabase, email, password, window.location.origin)
      if (error) throw error
      if (data.session) {
        setDialog(null)
        setPassword('')
      } else {
        setAuthMessage('Check your email for a confirmation link to return to Paint Keeper.')
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setNotice(`Could not sign out: ${error.message}`)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="wordmark" href="/" aria-label="Paint Keeper home"><span className="logo"><Paintbrush size={20} /></span><span>paint<span className="wordmark-light">keeper</span><small>YOUR HOBBY, IN COLOUR</small></span></a>
        <div className="nav-label">YOUR WORKSPACE</div>
        <nav className="nav" aria-label="Main navigation">
          {views.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} onClick={() => setView(id)}><Icon size={18} />{label}{id === 'owned' && <span>{owned}</span>}{id === 'wishlist' && <span>{wanted}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="account-card">
            <div className="account-icon"><Cloud size={18} /></div>
            <strong>{user ? 'Your account' : 'Make it yours'}</strong>
            <p>{user ? user.email : 'Keep your collection in sync, wherever you paint.'}</p>
            {user ? <><small>{syncState}</small><button className="side-action" onClick={() => void signOut()}><LogOut size={15} /> Sign out</button></> : <button className="side-action" disabled={!supabase || !authReady} onClick={() => { setAuthMessage(''); setDialog('auth') }}>Sign in or create account <span>↗</span></button>}
          </div>
          <div className="sidebar-footer">MADE FOR THE LITTLE DETAILS <span>✳</span></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar"><div><span className="top-dot" /> YOUR PAINT SPACE</div><div className="top-right"><span className="connection-dot" />{user ? 'ACCOUNT' : 'LOCAL MODE'}{supabase && <button className="mobile-account" disabled={!authReady} onClick={() => user ? void signOut() : (setAuthMessage(''), setDialog('auth'))}>{user ? 'Sign out' : 'Sign in'}</button>}</div></header>
        <div className="content">
          {notice && <div className="notice" role="alert">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}
          {user && syncState.includes('failed') && <div className="notice" role="alert">{syncState} <button className="retry" onClick={retrySync}>Retry sync</button></div>}
          <div className="page-heading">
            <div><div className="eyebrow"><span>✳</span> THE HOBBY DESK</div><h1>Your paints,<br /><em>all in one place.</em></h1><p>A little more painting, a little less searching.</p></div>
          </div>
          <div className="stats">
            <button onClick={() => setView('catalogue')} className="stat"><div className="stat-icon sage"><Layers3 size={19} /></div><div><span>ALL PAINTS</span><strong>{paints.length}</strong><small>in your catalogue</small></div><span className="stat-arrow">↗</span></button>
            <button onClick={() => setView('owned')} className="stat"><div className="stat-icon yellow"><Paintbrush size={19} /></div><div><span>IN COLLECTION</span><strong>{owned}</strong><small>ready to paint</small></div><span className="stat-arrow">↗</span></button>
            <button onClick={() => setView('wishlist')} className="stat"><div className="stat-icon peach"><ShoppingBag size={19} /></div><div><span>ON YOUR LIST</span><strong>{wanted}</strong><small>future favourites</small></div><span className="stat-arrow">↗</span></button>
          </div>

          <section className="collection-section">
            <div className="section-heading"><div><div className="eyebrow">YOUR COLLECTION</div><h2>{view === 'catalogue' ? 'The paint shelf' : view === 'owned' ? 'Your collection' : 'Your shopping list'} <span>✳</span></h2><p>{view === 'catalogue' ? 'Every great miniature starts here.' : view === 'owned' ? 'All the colours you have at hand.' : 'The colours you have your eye on.'}</p></div><span className="result-count">{visible.length} {visible.length === 1 ? 'PAINT' : 'PAINTS'}</span></div>
            <div className="toolbar">
              <div className="tabs" role="group" aria-label="Filter paints">
                {views.map(({ id, label }) => <button key={id} className={view === id ? 'selected' : ''} onClick={() => setView(id)}>{id === 'catalogue' ? 'All paints' : id === 'owned' ? 'Owned' : 'Wishlist'}{id === 'owned' && <span>{owned}</span>}{id === 'wishlist' && <span>{wanted}</span>}<span className="sr-only"> {label}</span></button>)}
              </div>
              <div className="filters"><label className="search"><Search size={17} /><span className="sr-only">Search paints</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search paints..." /></label><label className="select-wrap"><span className="sr-only">Filter by brand</span><select value={brand} onChange={event => setBrand(event.target.value)}><option>All brands</option>{brands.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label><label className="select-wrap"><span className="sr-only">Filter by type</span><select value={paintType} onChange={event => setPaintType(event.target.value)}><option>All types</option>{paintTypes.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label></div>
            </div>
            {visible.length ? <div className="paint-grid">{visible.map(paint => {
              const status = collection.entries[paint.id]?.status ?? 'none'
              return <article className="paint-card" key={paint.id}>
                <div className="swatch" style={{ backgroundColor: paint.color }}><span className="swatch-shine" />{status !== 'none' && <span className="status-tag">{status === 'owned' ? '✓ OWNED' : '♡ WISHLIST'}</span>}</div>
                <div className="paint-info"><div className="paint-brand">{paint.brand}</div><h3>{paint.name}</h3><div className="paint-range">{paint.type || paint.range || 'Miniature paint'}{paint.code && <> · {paint.code}</>}</div>
                  <div className="paint-actions">
                    <button className={status === 'owned' ? 'action owned-active' : 'action'} onClick={() => changeStatus(paint, status === 'owned' ? 'none' : 'owned')}><Check size={15} />{status === 'owned' ? 'Owned' : 'I own this'}</button>
                    <button className={status === 'wishlist' ? 'icon-action wanted-active' : 'icon-action'} onClick={() => changeStatus(paint, status === 'wishlist' ? 'none' : 'wishlist')} aria-label={status === 'wishlist' ? `Remove ${paint.name} from shopping list` : `Add ${paint.name} to shopping list`} title={status === 'wishlist' ? 'Remove from shopping list' : 'Add to shopping list'}><Bookmark size={16} fill={status === 'wishlist' ? 'currentColor' : 'none'} /></button>
                  </div>
                </div>
              </article>
            })}</div> : <div className="empty"><div className="empty-icon"><Layers3 size={25} /></div><h3>{paints.length === 0 ? 'Your paint shelf is waiting' : 'No paints found'}</h3><p>{paints.length === 0 ? 'The shared catalogue will appear here when it has been populated.' : view === 'wishlist' ? 'Choose paints from the catalogue to add to your shopping list.' : 'Try a different search or filter.'}</p></div>}
          </section>
          <footer className="page-footer"><span>MADE FOR THE JOY OF MAKING.</span><span>YOUR COLLECTION, YOUR WAY <span>✳</span></span></footer>
        </div>
      </main>

      {dialog && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setDialog(null) }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="close" onClick={() => setDialog(null)} aria-label="Close dialog"><X size={20} /></button>
        <><div className="eyebrow">WELCOME TO PAINT KEEPER</div><h2 id="modal-title">{authMode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h2><p>Keep your paints with you, on every device. Your local collection will be merged when you sign in.</p><form onSubmit={event => void submitAuth(event)}>
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={event => setPassword(event.target.value)} /></label>
          {authMessage && <div className="form-message" role="status">{authMessage}</div>}<button disabled={busy} className="button primary full">{busy ? 'Please wait...' : authMode === 'signin' ? 'Sign in' : 'Create account'}</button>
          <button type="button" className="text-button" onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthMessage('') }}>{authMode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
        </form></>
      </div></div>}
    </div>
  )
}

export default App
