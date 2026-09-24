import type { DocumentState } from '../types/blocks'

const key = 'gloammark-projects-v1'

export interface SavedProject {
  id: string
  name: string
  updatedAt: number
  document: DocumentState
}

export const listProjects = (): SavedProject[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as SavedProject[]
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string' && item.document && Array.isArray(item.document.blocks)).sort((a, b) => b.updatedAt - a.updatedAt) : []
  } catch {
    return []
  }
}

export const saveProject = (document: DocumentState, projectId?: string) => {
  const projects = listProjects()
  const id = projectId ?? crypto.randomUUID()
  const name = document.title.replace(/\.(md|markdown)$/i, '').trim() || 'Untitled'
  const next: SavedProject = { id, name, updatedAt: Date.now(), document: structuredClone(document) }
  const index = projects.findIndex((item) => item.id === id)
  if (index >= 0) projects[index] = next
  else projects.unshift(next)
  localStorage.setItem(key, JSON.stringify(projects.slice(0, 50)))
  return next
}

export const deleteProject = (id: string) => localStorage.setItem(key, JSON.stringify(listProjects().filter((item) => item.id !== id)))
