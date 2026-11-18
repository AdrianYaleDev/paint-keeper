import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { emptyCollection, guestKey, mergeGuest, mergeRemote, readCatalogue, readCollection, setCondition, setStatus, writeCatalogue, writeCollection } from './storage'
import { fetchCatalogue, fetchEntries, fetchIsAdmin, saveEntries, supabase } from './supabase'
import type { Collection, Paint, PaintStatus, PotCondition } from './types'

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export function usePaints() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [collection, setCollection] = useState<Collection>(emptyCollection)
  const [catalogue, setCatalogue] = useState<Paint[]>([])
  const [notice, setNotice] = useState('')
  const [syncState, setSyncState] = useState('Saved on this device')
  const [isAdmin, setIsAdmin] = useState(false)
  const reloadRef = useRef<() => void>(() => {})
  const syncRef = useRef<() => void>(() => {})
  const key = user ? `user:${user.id}` : guestKey

  useEffect(() => {
    try {
      setCatalogue(readCatalogue())
    } catch (error) {
      setNotice(`Could not read the saved catalogue: ${message(error)}`)
    }
    if (!supabase) return
    let active = true
    const loadCatalogue = () => {
      fetchCatalogue().then(paints => {
        if (!active) return
        writeCatalogue(paints)
        setCatalogue(paints)
      }).catch(error => {
        if (active) setNotice(`Could not load the paint catalogue: ${message(error)}. Saved paints remain available.`)
      })
    }
    reloadRef.current = loadCatalogue
    loadCatalogue()
    window.addEventListener('online', loadCatalogue)
    return () => { active = false; window.removeEventListener('online', loadCatalogue) }
  }, [])

  useEffect(() => {
    setIsAdmin(false)
    if (!user) return
    let active = true
    fetchIsAdmin(user.id).then(result => { if (active) setIsAdmin(result) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true
    client.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setNotice(`Could not restore your session: ${error.message}`)
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    }).catch(error => {
      if (active) {
        setNotice(`Could not restore your session: ${message(error)}`)
        setAuthReady(true)
      }
    })
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setAuthReady(true)
      }
    })
    return () => { active = false; subscription.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    try {
      setCollection(readCollection(key))
      setSyncState(user ? 'Waiting to sync' : 'Saved on this device')
    } catch (error) {
      setNotice(`Could not read your collection: ${message(error)}`)
    }
  }, [key, user])

  useEffect(() => {
    if (!user) {
      syncRef.current = () => {}
      return
    }
    const userId = user.id
    const userKey = `user:${userId}`
    let active = true
    let running = false
    let requested = false

    async function sync() {
      if (running) { requested = true; return }
      running = true
      setSyncState('Syncing...')
      try {
        const remote = await fetchEntries(userId)
        if (!active) return
        const guest = readCollection(guestKey)
        const guestSnapshot = JSON.stringify(guest)
        const merged = mergeGuest(mergeRemote(readCollection(userKey), remote), guest)
        writeCollection(userKey, merged)
        setCollection(merged)
        const sent = merged.dirty.map(id => merged.entries[id]).filter(entry => entry !== undefined)
        await saveEntries(userId, sent)
        if (!active) return
        const latest = readCollection(userKey)
        const sentById = new Map(sent.map(entry => [entry.paint.id, JSON.stringify(entry)]))
        latest.dirty = latest.dirty.filter(id => {
          const entry = latest.entries[id]
          return !entry || sentById.get(id) !== JSON.stringify(entry)
        })
        writeCollection(userKey, latest)
        if (JSON.stringify(readCollection(guestKey)) === guestSnapshot) {
          writeCollection(guestKey, emptyCollection())
        } else {
          requested = true
        }
        setCollection(latest)
        setSyncState(latest.dirty.length ? 'Waiting to sync' : 'Synced to your account')
      } catch (error) {
        if (active) setSyncState(`Saved on this device; sync failed: ${message(error)}`)
      } finally {
        running = false
        if (active && requested) {
          requested = false
          void sync()
        }
      }
    }
    syncRef.current = () => { void sync() }
    const onOnline = () => { void sync() }
    window.addEventListener('online', onOnline)
    void sync()
    return () => {
      active = false
      window.removeEventListener('online', onOnline)
      syncRef.current = () => {}
    }
  }, [user])

  const changeStatus = useCallback((paint: Paint, status: PaintStatus) => {
    try {
      const next = setStatus(readCollection(key), paint, status)
      writeCollection(key, next)
      setCollection(next)
      if (user) syncRef.current()
    } catch (error) {
      setNotice(`Could not save your change: ${message(error)}`)
    }
  }, [key, user])

  const changeCondition = useCallback((paint: Paint, condition: PotCondition | null, restock: boolean) => {
    try {
      const next = setCondition(readCollection(key), paint, condition, restock)
      writeCollection(key, next)
      setCollection(next)
      if (user) syncRef.current()
    } catch (error) {
      setNotice(`Could not save your change: ${message(error)}`)
    }
  }, [key, user])

  return { user, isAdmin, changeCondition, refreshCatalogue: () => reloadRef.current(), authReady, collection, catalogue, notice, setNotice, syncState, changeStatus, retrySync: () => syncRef.current() }
}
