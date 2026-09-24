import type { HeroBadge } from '../types/blocks'

const encode = (value: string) => encodeURIComponent(value).replace(/-/g, '--')
const cleanColor = (value: string) => value.trim().replace(/^#/, '')

const query = (badge: HeroBadge, dynamic = false) => {
  const values = new URLSearchParams({ style: badge.style })
  if (dynamic && badge.label.trim()) values.set('label', badge.label.trim())
  const color = cleanColor(badge.color)
  const labelColor = cleanColor(badge.labelColor)
  const logoColor = cleanColor(badge.logoColor)
  if (color) values.set('color', color)
  if (labelColor) values.set('labelColor', labelColor)
  if (logoColor) values.set('logoColor', logoColor)
  return values.toString()
}

export const badgeSource = (badge: HeroBadge) => {
  const repo = badge.value.trim()
  const params = query(badge, true)
  if (badge.kind === 'stars' && repo.includes('/')) return `https://img.shields.io/github/stars/${repo}?${params}`
  if (badge.kind === 'forks' && repo.includes('/')) return `https://img.shields.io/github/forks/${repo}?${params}`
  if (badge.kind === 'issues' && repo.includes('/')) return `https://img.shields.io/github/issues/${repo}?${params}`
  if (badge.kind === 'license' && repo.includes('/')) return `https://img.shields.io/github/license/${repo}?${params}`
  if (badge.kind === 'version' && repo.includes('/')) return `https://img.shields.io/github/v/release/${repo}?${params}`
  if (badge.kind === 'build' && repo.includes('/')) {
    const values = new URLSearchParams(params)
    if (!badge.label.trim()) values.set('label', 'build')
    return `https://img.shields.io/github/actions/workflow/status/${repo}?${values.toString()}`
  }
  const color = cleanColor(badge.color) || '18181b'
  const values = new URLSearchParams({ style: badge.style })
  const labelColor = cleanColor(badge.labelColor)
  const logoColor = cleanColor(badge.logoColor)
  if (labelColor) values.set('labelColor', labelColor)
  if (logoColor) values.set('logoColor', logoColor)
  return `https://img.shields.io/badge/${encode(badge.label || badge.kind)}-${encode(badge.value || 'unknown')}-${encodeURIComponent(color)}?${values.toString()}`
}
