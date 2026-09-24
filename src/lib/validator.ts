import type { ReadmeBlock } from '../types/blocks'

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  message: string
  blockId?: string
}

const isHttpUrl = (value: string) => {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const heading = (block: ReadmeBlock) => block.type === 'hero' ? block.title : 'heading' in block ? block.heading : ''
const slug = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')

export const validateDocument = (title: string, blocks: ReadmeBlock[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = []
  const visible = blocks.filter((block) => block.visible)
  if (!visible.length) issues.push({ id: 'empty-document', severity: 'error', message: 'The document has no visible blocks.' })
  if (!title.trim()) issues.push({ id: 'empty-title', severity: 'warning', message: 'Document filename is empty.' })
  else if (!/\.(md|markdown)$/i.test(title.trim())) issues.push({ id: 'filename-extension', severity: 'warning', message: 'Document filename should end in .md or .markdown.' })

  const seen = new Map<string, number>()
  for (const block of visible) {
    const value = heading(block).trim()
    if (value && block.type !== 'hero') {
      const key = slug(value)
      const count = seen.get(key) ?? 0
      seen.set(key, count + 1)
      if (count) issues.push({ id: `duplicate-heading-${block.id}`, severity: 'warning', message: `Duplicate heading “${value}” will receive a numbered GitHub anchor.`, blockId: block.id })
    }
    if (block.type === 'hero') {
      if (!block.title.trim()) issues.push({ id: `hero-title-${block.id}`, severity: 'error', message: 'Hero title is empty.', blockId: block.id })
      if (!isHttpUrl(block.imageUrl)) issues.push({ id: `hero-image-${block.id}`, severity: 'warning', message: 'Hero image URL is invalid.', blockId: block.id })
      block.badges.forEach((badge) => {
        if (badge.link && !isHttpUrl(badge.link)) issues.push({ id: `badge-link-${badge.id}`, severity: 'warning', message: `Badge “${badge.label || badge.kind}” has an invalid link.`, blockId: block.id })
        if (badge.kind !== 'custom' && badge.kind !== 'version' && badge.value && !/^[-\w.]+\/[-\w.]+(?:\/[-\w./]+)?$/.test(badge.value)) issues.push({ id: `badge-value-${badge.id}`, severity: 'warning', message: `Badge “${badge.label || badge.kind}” may need an owner/repository value.`, blockId: block.id })
      })
    }
    if (block.type === 'gallery') block.items.forEach((item) => {
      if (!item.url.trim()) issues.push({ id: `gallery-empty-${item.id}`, severity: 'warning', message: 'A gallery item has no image URL.', blockId: block.id })
      else if (!isHttpUrl(item.url)) issues.push({ id: `gallery-url-${item.id}`, severity: 'warning', message: `Gallery image “${item.alt || 'Untitled'}” has an invalid URL.`, blockId: block.id })
      if (item.link && !isHttpUrl(item.link)) issues.push({ id: `gallery-link-${item.id}`, severity: 'warning', message: `Gallery item “${item.alt || 'Untitled'}” has an invalid link.`, blockId: block.id })
    })
    if (block.type === 'resources') block.items.forEach((item) => {
      if (item.url && !isHttpUrl(item.url)) issues.push({ id: `resource-${item.id}`, severity: 'warning', message: `Resource “${item.label || 'Untitled'}” has an invalid URL.`, blockId: block.id })
    })
    if (block.type === 'config') {
      const names = new Set<string>()
      block.rows.forEach((row) => {
        const name = row.name.trim()
        if (!name) issues.push({ id: `config-empty-${row.id}`, severity: 'warning', message: 'A configuration variable has no name.', blockId: block.id })
        else if (names.has(name)) issues.push({ id: `config-duplicate-${row.id}`, severity: 'warning', message: `Configuration variable “${name}” is duplicated.`, blockId: block.id })
        names.add(name)
      })
    }
    if (block.type === 'quickStart' && block.steps.some((step) => !step.command.trim())) issues.push({ id: `quickstart-empty-${block.id}`, severity: 'warning', message: 'Quick Start contains an empty command.', blockId: block.id })
  }
  return issues
}
