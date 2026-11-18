import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { addPaints } from './supabase'
import { CSV_TEMPLATE, FINISHES, MEDIUMS, paintsToCsv, readPaintFile, validatePaint, type NewPaint } from './adminImport'
import type { Paint } from './types'

const empty = { brand: '', type: '', name: '', code: '', color: '#888888', range: '', finish: '', medium: '', size_ml: '' }

function message(error: unknown) {
  return error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : String(error)
}

export default function AdminPanel({ onAdded, catalogue }: { onAdded: () => void; catalogue: Paint[] }) {
  const [form, setForm] = useState(empty)
  const [useColor, setUseColor] = useState(true)
  const [pending, setPending] = useState<NewPaint[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(paints: NewPaint[]) {
    setBusy(true)
    setStatus('')
    try {
      const { added, updated, skipped } = await addPaints(paints)
      const parts = [`Added ${added} paint${added === 1 ? '' : 's'}`]
      if (updated) parts.push(`updated ${updated}`)
      if (skipped) parts.push(`${skipped} unchanged or already existed`)
      setStatus(`${parts.join(', ')}.`)
      onAdded()
      return true
    } catch (error) {
      setStatus(`Could not add paints: ${message(error)}`)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function addOne(event: React.FormEvent) {
    event.preventDefault()
    const { paint, error } = validatePaint({ ...form, color: useColor ? form.color : '' })
    if (!paint) { setStatus(`Could not add paint: ${error}.`); return }
    if (await submit([paint])) setForm({ ...empty, brand: form.brand, type: form.type })
  }

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setStatus('')
    try {
      const result = await readPaintFile(file)
      setPending(result.paints)
      setErrors(result.errors)
    } catch (error) {
      setPending([])
      setErrors([`Could not read the file: ${message(error)}`])
    }
  }

  async function importPending() {
    if (await submit(pending)) { setPending([]); setErrors([]) }
  }

  function download(content: string, filename: string) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const downloadTemplate = () => download(CSV_TEMPLATE, 'paint-template.csv')
  const exportCatalogue = () => download('\uFEFF' + paintsToCsv(catalogue), `paint-catalogue-${new Date().toISOString().slice(0, 10)}.csv`)

  return (
    <section className="admin">
      <div className="page-heading"><div><div className="eyebrow"><span>✳</span> ADMIN</div><h1>Manage <em>paints.</em></h1><p>New paints are added to the shared catalogue for everyone. Export the catalogue, edit it, and re-import it to update existing paints.</p></div></div>
      {status && <div className="notice" role="status">{status}</div>}
      <div className="admin-grid">
        <form className="admin-card" onSubmit={event => void addOne(event)}>
          <h2>Add one paint</h2>
          <label>Brand<input required value={form.brand} onChange={event => setForm({ ...form, brand: event.target.value })} /></label>
          <label>Type<input required value={form.type} onChange={event => setForm({ ...form, type: event.target.value })} placeholder="Base, Layer, Air…" /></label>
          <label>Name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
          <label>Code <span className="optional">(optional)</span><input value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} /></label>
          <label>Range <span className="optional">(optional)</span><input value={form.range} onChange={event => setForm({ ...form, range: event.target.value })} placeholder="Game Color, Contrast, Speedpaint…" /></label>
          <div className="admin-row">
            <label>Finish <span className="optional">(optional)</span><select value={form.finish} onChange={event => setForm({ ...form, finish: event.target.value })}><option value="">—</option>{FINISHES.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Medium <span className="optional">(optional)</span><select value={form.medium} onChange={event => setForm({ ...form, medium: event.target.value })}><option value="">—</option>{MEDIUMS.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Size (ml)<input type="number" min="0" step="any" inputMode="decimal" value={form.size_ml} onChange={event => setForm({ ...form, size_ml: event.target.value })} /></label>
          </div>
          <label>Colour <span className="optional">(optional)</span><span className="color-row"><input type="color" disabled={!useColor} value={form.color} onChange={event => setForm({ ...form, color: event.target.value })} /><span><input type="checkbox" checked={useColor} onChange={event => setUseColor(event.target.checked)} /> Set a swatch</span></span></label>
          <button className="button primary" disabled={busy}>{busy ? 'Saving...' : 'Add paint'}</button>
        </form>
        <div className="admin-card">
          <h2>Import from file</h2>
          <p>Upload a .csv or .xlsx file with a header row: <strong>brand, type, name</strong>, and optionally <strong>code, colour</strong> (hex like #B22222), <strong>range, finish, medium, size_ml</strong>. Finish is one of {FINISHES.join(', ')}; medium is one of {MEDIUMS.join(', ')}.</p>
          <p>Rows with an <strong>id</strong> (from the export) update that paint. Only the columns in your file change, and an empty cell clears the value. Rows without an id are added if new.</p>
          <div className="admin-links"><button type="button" className="text-button" onClick={downloadTemplate}>Download CSV template</button><button type="button" className="text-button" onClick={exportCatalogue} disabled={!catalogue.length}><Download size={13} /> Export catalogue ({catalogue.length})</button></div>
          <label className="button secondary file-button"><Upload size={15} /> Choose file<input type="file" accept=".csv,.xlsx" className="sr-only" onChange={event => void chooseFile(event)} /></label>
          {errors.length > 0 && <ul className="admin-errors">{errors.slice(0, 10).map(error => <li key={error}>{error}</li>)}{errors.length > 10 && <li>…and {errors.length - 10} more</li>}</ul>}
          {pending.length > 0 && <>
            <p><strong>{pending.length}</strong> paint{pending.length === 1 ? '' : 's'} ready to import{errors.length ? ' (rows with errors will be left out)' : ''}.</p>
            <div className="admin-preview"><table><tbody>{pending.slice(0, 5).map(paint => <tr key={`${paint.brand}${paint.type}${paint.name}`}><td><span className="mini-swatch" style={{ background: paint.color || 'transparent' }} /></td><td>{paint.brand}</td><td>{paint.type}</td><td>{paint.name}</td><td>{paint.id ? 'update' : 'new'}</td></tr>)}</tbody></table>{pending.length > 5 && <small>…and {pending.length - 5} more</small>}</div>
            <button className="button primary" disabled={busy} onClick={() => void importPending()}>{busy ? 'Importing...' : `Import ${pending.length} paint${pending.length === 1 ? '' : 's'}`}</button>
          </>}
        </div>
      </div>
    </section>
  )
}
