import type { Collection, Paint, Project } from './types'

const PREFIX = 'paint-keeper:v1:projects:'

export function readProjects(key: string): Project[] {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return []
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('Saved project data is invalid. Your data has not been overwritten.')
  return data as Project[]
}

export function writeProjects(key: string, projects: Project[]) {
  localStorage.setItem(PREFIX + key, JSON.stringify(projects))
}

export function createProject(name: string): Project {
  return { id: crypto.randomUUID(), name: name.trim(), paintIds: [], updatedAt: new Date().toISOString() }
}

export function editProject(project: Project, changes: Partial<Pick<Project, 'name' | 'paintIds' | 'deleted'>>): Project {
  return { ...project, ...changes, updatedAt: new Date().toISOString() }
}

// The most recently edited copy of each project wins; deleted projects stay as tombstones so deletes sync.
export function mergeProjects(base: Project[], incoming: Project[]): Project[] {
  const merged = new Map(base.map(project => [project.id, project]))
  for (const project of incoming) {
    const existing = merged.get(project.id)
    if (!existing || existing.updatedAt < project.updatedAt) merged.set(project.id, project)
  }
  return [...merged.values()]
}

export function projectProgress(project: Project, paintsById: Map<string, Paint>, entries: Collection['entries']) {
  const paints = project.paintIds.flatMap(id => paintsById.get(id) ?? [])
  const owned = paints.filter(paint => entries[paint.id]?.status === 'owned')
  const missing = paints.filter(paint => entries[paint.id]?.status !== 'owned')
  return { paints, owned, missing, unavailable: project.paintIds.length - paints.length }
}
