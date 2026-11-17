import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { guestKey } from './storage'
import { createProject, editProject, mergeProjects, readProjects, writeProjects } from './projects'
import { fetchProjects, saveProjects } from './supabase'
import type { Project } from './types'

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export function useProjects(user: User | null, setNotice: (text: string) => void) {
  const [projects, setProjects] = useState<Project[]>([])
  const syncRef = useRef<() => void>(() => {})
  const key = user ? `user:${user.id}` : guestKey

  useEffect(() => {
    try {
      setProjects(readProjects(key))
    } catch (error) {
      setNotice(`Could not read your projects: ${message(error)}`)
    }
  }, [key, setNotice])

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
      try {
        const remote = await fetchProjects(userId)
        if (!active) return
        const guest = readProjects(guestKey)
        const merged = mergeProjects(mergeProjects(readProjects(userKey), remote), guest)
        writeProjects(userKey, merged)
        setProjects(merged)
        const remoteById = new Map(remote.map(project => [project.id, project]))
        await saveProjects(userId, merged.filter(project => {
          const known = remoteById.get(project.id)
          return !known || known.updatedAt < project.updatedAt
        }))
        if (active && guest.length && JSON.stringify(readProjects(guestKey)) === JSON.stringify(guest)) writeProjects(guestKey, [])
      } catch (error) {
        if (active) setNotice(`Your projects are saved on this device but could not sync: ${message(error)}`)
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
  }, [user, setNotice])

  const update = useCallback((change: (current: Project[]) => Project[]) => {
    try {
      const next = change(readProjects(key))
      writeProjects(key, next)
      setProjects(next)
      if (user) syncRef.current()
    } catch (error) {
      setNotice(`Could not save your change: ${message(error)}`)
    }
  }, [key, user, setNotice])

  const edit = (id: string, changes: Partial<Pick<Project, 'name' | 'paintIds' | 'deleted'>> | ((project: Project) => Partial<Pick<Project, 'name' | 'paintIds' | 'deleted'>>)) =>
    update(current => current.map(project => project.id === id
      ? editProject(project, typeof changes === 'function' ? changes(project) : changes)
      : project))

  return {
    projects: projects.filter(project => !project.deleted),
    addProject(name: string) {
      const project = createProject(name)
      update(current => [...current, project])
      return project.id
    },
    renameProject: (id: string, name: string) => edit(id, { name: name.trim() }),
    deleteProject: (id: string) => edit(id, { deleted: true, paintIds: [] }),
    addPaints: (id: string, ids: string[]) => edit(id, project => ({ paintIds: [...new Set([...project.paintIds, ...ids])] })),
    removePaint: (id: string, paintId: string) => edit(id, project => ({ paintIds: project.paintIds.filter(value => value !== paintId) })),
  }
}
