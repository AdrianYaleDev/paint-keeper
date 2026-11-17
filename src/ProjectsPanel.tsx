import { useMemo, useState } from 'react'
import { ArrowLeft, Bookmark, Check, FolderOpen, Plus, Trash2, X } from 'lucide-react'
import { matchesPaint } from './catalogue'
import { projectProgress } from './projects'
import type { Collection, Paint, PaintStatus, Project } from './types'

type Props = {
  projects: Project[]
  paints: Paint[]
  entries: Collection['entries']
  onCreate: (name: string) => string
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onAddPaints: (id: string, paintIds: string[]) => void
  onRemovePaint: (id: string, paintId: string) => void
  onStatus: (paint: Paint, status: PaintStatus) => void
}

const RESULT_LIMIT = 12

function Progress({ owned, total }: { owned: number; total: number }) {
  return <div className="progress" role="img" aria-label={`${owned} of ${total} owned`}><span style={{ width: total ? `${(owned / total) * 100}%` : 0 }} /></div>
}

export default function ProjectsPanel({ projects, paints, entries, onCreate, onRename, onDelete, onAddPaints, onRemovePaint, onStatus }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [query, setQuery] = useState('')
  const paintsById = useMemo(() => new Map(paints.map(paint => [paint.id, paint])), [paints])
  const project = projects.find(item => item.id === openId)

  function create(event: React.FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    setOpenId(onCreate(newName))
    setNewName('')
  }

  function open(id: string | null) {
    setOpenId(id)
    setRenaming(null)
    setConfirmDelete(false)
    setQuery('')
  }

  if (!project) {
    return (
      <section className="projects">
        <div className="page-heading"><div><div className="eyebrow"><span>✳</span> PROJECTS</div><h1>Your <em>projects.</em></h1><p>Group the paints for an army or scheme and see what you still need.</p></div></div>
        <form className="project-new" onSubmit={create}>
          <label className="sr-only" htmlFor="project-name">Project name</label>
          <input id="project-name" value={newName} onChange={event => setNewName(event.target.value)} placeholder="e.g. Ultramarines army" maxLength={80} />
          <button className="button primary" disabled={!newName.trim()}><Plus size={16} /> Create project</button>
        </form>
        {projects.length === 0
          ? <div className="empty"><div className="empty-icon"><FolderOpen size={25} /></div><h3>No projects yet</h3><p>Create one above, then add the paints you need for it.</p></div>
          : <div className="project-grid">{projects.map(item => {
            const { paints: found, owned } = projectProgress(item, paintsById, entries)
            return <button key={item.id} className="project-card" onClick={() => open(item.id)}>
              <strong>{item.name}</strong>
              <span>{found.length === 0 ? 'No paints yet' : `${owned.length} of ${found.length} owned`}</span>
              <Progress owned={owned.length} total={found.length} />
            </button>
          })}</div>}
      </section>
    )
  }

  const { paints: found, owned, missing, unavailable } = projectProgress(project, paintsById, entries)
  const projectId = project.id
  const inProject = new Set(project.paintIds)
  const results = query.trim() ? paints.filter(paint => !inProject.has(paint.id) && matchesPaint(paint, query, 'All brands', 'All types')) : []
  const toWishlist = missing.filter(paint => entries[paint.id]?.status !== 'wishlist')

  function row(paint: Paint, showActions: boolean) {
    const status = entries[paint.id]?.status ?? 'none'
    return <li key={paint.id} className="project-paint">
      <span className="mini-swatch" style={{ background: paint.color }} />
      <div><strong>{paint.name}</strong><small>{paint.brand}{paint.type ? ` · ${paint.type}` : ''}{paint.code ? ` · ${paint.code}` : ''}</small></div>
      {showActions && <>
        <button className={status === 'wishlist' ? 'action wanted-active' : 'action'} onClick={() => onStatus(paint, status === 'wishlist' ? 'none' : 'wishlist')} aria-pressed={status === 'wishlist'}><Bookmark size={14} /> {status === 'wishlist' ? 'Wishlisted' : 'Wishlist'}</button>
        <button className="action" onClick={() => onStatus(paint, 'owned')}><Check size={14} /> Got it</button>
      </>}
      <button className="icon-action" onClick={() => onRemovePaint(projectId, paint.id)} aria-label={`Remove ${paint.name} from project`}><X size={15} /></button>
    </li>
  }

  return (
    <section className="projects">
      <button className="text-button back" onClick={() => open(null)}><ArrowLeft size={14} /> All projects</button>
      <div className="page-heading project-heading">
        <div>
          {renaming !== null
            ? <form className="project-new" onSubmit={event => { event.preventDefault(); if (renaming.trim()) onRename(project.id, renaming); setRenaming(null) }}>
              <input autoFocus aria-label="Project name" value={renaming} onChange={event => setRenaming(event.target.value)} maxLength={80} />
              <button className="button primary">Save</button><button type="button" className="button secondary" onClick={() => setRenaming(null)}>Cancel</button>
            </form>
            : <><h1>{project.name}</h1><button className="text-button" onClick={() => setRenaming(project.name)}>Rename</button></>}
          <p>{found.length === 0 ? 'Add paints below to start tracking this project.' : `${owned.length} of ${found.length} paints owned`}</p>
          <Progress owned={owned.length} total={found.length} />
        </div>
        {confirmDelete
          ? <div className="project-confirm"><span>Delete this project?</span><button className="button secondary" onClick={() => setConfirmDelete(false)}>Keep</button><button className="button primary danger" onClick={() => { onDelete(project.id); open(null) }}>Delete</button></div>
          : <button className="button secondary" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>}
      </div>

      <div className="project-add">
        <label className="search"><span className="sr-only">Search paints to add</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search paints to add to this project..." /></label>
        {query.trim() && (results.length === 0 ? <p className="project-note">No matching paints to add.</p> : <ul className="project-results">
          {results.slice(0, RESULT_LIMIT).map(paint => <li key={paint.id} className="project-paint">
            <span className="mini-swatch" style={{ background: paint.color }} />
            <div><strong>{paint.name}</strong><small>{paint.brand}{paint.type ? ` · ${paint.type}` : ''}{entries[paint.id]?.status === 'owned' ? ' · owned' : ''}</small></div>
            <button className="action" onClick={() => onAddPaints(project.id, [paint.id])}><Plus size={14} /> Add</button>
          </li>)}
          {results.length > RESULT_LIMIT && <li className="project-note">Showing {RESULT_LIMIT} of {results.length}. Keep typing to narrow it down.</li>}
        </ul>)}
      </div>

      {missing.length > 0 && <>
        <div className="project-section-head"><h2>Still needed <span>({missing.length})</span></h2>{toWishlist.length > 0 && <button className="button secondary" onClick={() => toWishlist.forEach(paint => onStatus(paint, 'wishlist'))}><Bookmark size={14} /> Add {toWishlist.length} to wishlist</button>}</div>
        <ul className="project-list">{missing.map(paint => row(paint, true))}</ul>
      </>}
      {owned.length > 0 && <>
        <div className="project-section-head"><h2>Owned <span>({owned.length})</span></h2></div>
        <ul className="project-list">{owned.map(paint => row(paint, false))}</ul>
      </>}
      {unavailable > 0 && <p className="project-note">{unavailable} paint{unavailable === 1 ? ' is' : 's are'} no longer in the catalogue.</p>}
    </section>
  )
}
