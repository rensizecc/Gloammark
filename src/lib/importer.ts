import { createBlock } from './defaults'
import { technologyIndex } from './techCatalog'
import type { AlertKind, ConfigRow, DocumentState, GalleryItem, HeroBadge, PackageManager, ReadmeBlock, RoadmapItem } from '../types/blocks'

const clean = (value: string) => value.replace(/\r/g, '').trim()
const decodeHtml = (value: string) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
const stripHtml = (value: string) => decodeHtml(value.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '')).trim()
const stripInline = (value: string) => value.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/~~([^~]+)~~/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\*([^*]+)\*/g, '$1').trim()
const normalizeHeading = (value: string) => stripInline(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const isUrl = (value: string) => /^https?:\/\//i.test(value)

const customMarkdown = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('markdown')
  if (block.type !== 'markdown') throw new Error('Could not create Markdown block')
  block.heading = heading
  block.markdown = body
  block.showHeading = true
  return block
}

const skillBySlug = new Map<string, string>()
for (const item of Object.values(technologyIndex)) if (item.skill) skillBySlug.set(item.skill.toLowerCase(), item.name)

const parseTable = (body: string) => {
  const lines = body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('|') && line.endsWith('|'))
  if (lines.length < 2) return []
  const split = (line: string) => line.slice(1, -1).split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'))
  const separator = split(lines[1] ?? '')
  if (!separator.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))) return []
  return lines.slice(2).map(split)
}

const detectPackageManager = (body: string): PackageManager => {
  const candidates: PackageManager[] = ['pnpm', 'yarn', 'bun', 'npm', 'pip', 'cargo', 'docker', 'composer', 'gradle', 'maven', 'dotnet', 'go', 'git']
  return candidates.find((item) => new RegExp(`(^|\\s)${item.replace('.', '\\.')}(\\s|$)`, 'im').test(body)) ?? 'npm'
}

const parseBadges = (value: string): HeroBadge[] => {
  const candidates: { alt: string; source: string; href: string }[] = []
  for (const match of value.matchAll(/(?:\[)?!\[([^\]]*)\]\((https?:\/\/[^)]+)\)(?:\]\((https?:\/\/[^)]+)\))?/gi)) candidates.push({ alt: clean(match[1] ?? ''), source: match[2] ?? '', href: match[3] ?? '' })
  for (const match of value.matchAll(/(?:<a[^>]+href=["']([^"']+)["'][^>]*>\s*)?<img([^>]+)>(?:\s*<\/a>)?/gi)) {
    const attrs = match[2] ?? ''
    const source = attrs.match(/src=["']([^"']+)["']/i)?.[1] ?? ''
    const alt = attrs.match(/alt=["']([^"']*)["']/i)?.[1] ?? ''
    candidates.push({ alt: clean(alt), source: decodeHtml(source), href: decodeHtml(match[1] ?? '') })
  }
  const seen = new Set<string>()
  return candidates.filter(({ source }) => /img\.shields\.io/i.test(source) && !seen.has(source) && Boolean(seen.add(source))).map(({ alt, source, href }, index) => {
    let kind: HeroBadge['kind'] = 'custom'
    if (/\/github\/stars\//i.test(source)) kind = 'stars'
    else if (/\/github\/forks\//i.test(source)) kind = 'forks'
    else if (/\/github\/issues\//i.test(source)) kind = 'issues'
    else if (/\/github\/license\//i.test(source)) kind = 'license'
    else if (/\/github\/v\/release\//i.test(source)) kind = 'version'
    else if (/\/github\/actions\/workflow\/status\//i.test(source)) kind = 'build'
    const pathValue = kind === 'build'
      ? source.match(/\/github\/actions\/workflow\/status\/([^?]+)/i)?.[1]
      : source.match(/\/github\/(?:stars|forks|issues|license|v\/release)\/([^?]+)/i)?.[1]
    const customMatch = source.match(/\/badge\/([^?]+)/i)
    const decoded = customMatch ? decodeURIComponent(customMatch[1] ?? '').replace(/--/g, '-') : ''
    const segments = decoded.split('-')
    const label = kind === 'custom' ? ((segments[0] ?? alt) || `badge-${index + 1}`).replace(/_/g, ' ') : alt || kind
    const badgeValue = kind === 'custom' ? segments.slice(1, -1).join('-').replace(/_/g, ' ') : decodeURIComponent(pathValue ?? '')
    const params = new URL(source).searchParams
    return {
      id: crypto.randomUUID(),
      kind,
      label,
      value: badgeValue,
      style: params.get('style') === 'for-the-badge' ? 'for-the-badge' : params.get('style') === 'flat-square' ? 'flat-square' : 'flat',
      color: kind === 'custom' ? segments.at(-1) ?? '' : params.get('color') ?? '',
      labelColor: params.get('labelColor') ?? '',
      logoColor: params.get('logoColor') ?? '',
      link: href
    }
  })
}

const parseHero = (prefix: string) => {
  const block = createBlock('hero')
  if (block.type !== 'hero') return block
  const htmlTitle = prefix.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  const mdTitle = prefix.match(/^#\s+(.+)$/m)?.[1]
  block.title = stripHtml(htmlTitle ?? mdTitle ?? 'Untitled Project')
  block.alignment = /align=["']center["']/i.test(prefix) ? 'center' : 'left'
  const imageMatch = [...prefix.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].find((match) => !/readme-typing-svg|img\.shields\.io/i.test(match[1] ?? ''))
  const mdImageMatch = [...prefix.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/gi)].find((match) => !/readme-typing-svg|img\.shields\.io/i.test(match[2] ?? ''))
  block.imageUrl = imageMatch?.[1] ?? mdImageMatch?.[2] ?? ''
  block.imageAlt = mdImageMatch?.[1] ?? block.title
  block.badges = parseBadges(prefix)
  block.animatedSubtitle = /readme-typing-svg/i.test(prefix)
  const paragraphMatches = [...prefix.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .filter((match) => !/img\.shields\.io|readme-typing-svg/i.test(match[1] ?? ''))
    .map((match) => stripHtml(match[1] ?? ''))
    .filter(Boolean)
  const plain = prefix
    .replace(/<h1[\s\S]*?<\/h1>/gi, '')
    .replace(/<p[\s\S]*?<\/p>/gi, '')
    .replace(/^#\s+.+$/gm, '')
    .replace(/(?:\[)?!\[[^\]]*\]\([^)]*\)(?:\]\([^)]*\))?/g, '')
    .split(/\n{2,}/)
    .map((part) => clean(part))
    .filter((part) => part && !part.startsWith('<') && !part.startsWith('<!--'))
  const texts = [...paragraphMatches, ...plain]
  block.subtitle = texts[0] ?? ''
  block.description = texts.slice(1).join('\n\n')
  return block
}

const parseTech = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('techStack')
  if (block.type !== 'techStack') return block
  block.heading = heading
  const skillUrls = [...body.matchAll(/skillicons\.dev\/icons\?[^)"']*i=([^&)"']+)/gi)]
  const names = skillUrls.flatMap((match) => decodeURIComponent(match[1] ?? '').split(',')).map((slug) => skillBySlug.get(slug.toLowerCase())).filter((name): name is string => Boolean(name))
  const badgeNames = [...body.matchAll(/!\[([^\]]+)\]\(https?:\/\/img\.shields\.io\/badge\//gi)].map((match) => stripInline(match[1] ?? '')).filter((name) => technologyIndex[name])
  const listNames = body.split('\n').map((line) => line.match(/^[-*+]\s+(.+)$/)?.[1]).filter((name): name is string => Boolean(name)).map(stripInline).filter((name) => technologyIndex[name])
  block.technologies = [...new Set([...names, ...badgeNames, ...listNames])]
  if (/skillicons\.dev/i.test(body)) block.mode = 'skillicons'
  else if (/img\.shields\.io/i.test(body)) block.mode = 'shields'
  else block.mode = 'list'
  return block.technologies.length ? block : customMarkdown(heading, body)
}

const parseFeatures = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('features')
  if (block.type !== 'features') return block
  block.heading = heading
  const rows = parseTable(body)
  if (rows.length) {
    block.format = 'table'
    block.items = rows.map((row) => ({ id: crypto.randomUUID(), emoji: '', title: stripInline(row[0] ?? ''), detail: row.slice(1).join(' | ') }))
    return block
  }
  const items = body.split('\n').map((line) => line.match(/^[-*+]\s+(.+)$/)?.[1]).filter((value): value is string => Boolean(value)).map((value) => {
    const bold = value.match(/^(\p{Extended_Pictographic}(?:\uFE0F)?\s*)?\*\*([^*]+)\*\*(?:\s*[—:-]\s*)?(.*)$/u)
    if (bold) return { id: crypto.randomUUID(), emoji: clean(bold[1] ?? ''), title: clean(bold[2] ?? ''), detail: clean(bold[3] ?? '') }
    const plain = stripInline(value)
    return { id: crypto.randomUUID(), emoji: '', title: plain, detail: '' }
  })
  if (!items.length) return customMarkdown(heading, body)
  block.items = items
  return block
}

const parseGallery = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('gallery')
  if (block.type !== 'gallery') return block
  block.heading = heading
  const items: GalleryItem[] = []
  for (const match of body.matchAll(/(?:\[)?!\[([^\]]*)\]\((https?:\/\/[^)]+)\)(?:\]\((https?:\/\/[^)]+)\))?/gi)) {
    items.push({ id: crypto.randomUUID(), alt: match[1] ?? '', url: match[2] ?? '', link: match[3] ?? '', caption: '' })
  }
  for (const match of body.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    const tag = match[0]
    const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] ?? ''
    if (!items.some((item) => item.url === match[1])) items.push({ id: crypto.randomUUID(), alt, url: match[1] ?? '', link: '', caption: '' })
  }
  if (!items.length) return customMarkdown(heading, body)
  block.items = items
  block.columns = items.length >= 3 ? 3 : items.length === 2 ? 2 : 1
  return block
}

const parseQuickStart = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('quickStart')
  if (block.type !== 'quickStart') return block
  block.heading = heading
  block.packageManager = detectPackageManager(body)
  const steps: { id: string; description: string; command: string }[] = []
  const regex = /(?:^|\n)(?:\d+\.\s+|###\s+)([^\n]+)(?:\n+)(?:```(?:bash|sh|shell|console)?\n([\s\S]*?)```)/gi
  for (const match of body.matchAll(regex)) steps.push({ id: crypto.randomUUID(), description: stripInline(match[1] ?? ''), command: clean(match[2] ?? '') })
  if (!steps.length) {
    const fences = [...body.matchAll(/```(?:bash|sh|shell|console)?\n([\s\S]*?)```/gi)]
    fences.forEach((match, index) => steps.push({ id: crypto.randomUUID(), description: `Step ${index + 1}`, command: clean(match[1] ?? '') }))
  }
  if (!steps.length) return customMarkdown(heading, body)
  block.steps = steps
  return block
}

const parseConfig = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('config')
  if (block.type !== 'config') return block
  block.heading = heading
  const rows = parseTable(body)
  if (!rows.length) return customMarkdown(heading, body)
  block.rows = rows.map((row): ConfigRow => ({
    id: crypto.randomUUID(),
    name: stripInline(row[0] ?? '').replace(/^`|`$/g, ''),
    valueType: stripInline(row[1] ?? 'string'),
    defaultValue: stripInline(row[2] ?? '—').replace(/^`|`$/g, ''),
    required: /^(yes|true|required|✓)$/i.test(stripInline(row[3] ?? '')),
    description: stripInline(row[4] ?? row[3] ?? '')
  }))
  return block
}

const parseRequirements = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('requirements')
  if (block.type !== 'requirements') return block
  block.heading = heading
  const rows = parseTable(body)
  if (rows.length) block.items = rows.map((row) => ({ id: crypto.randomUUID(), name: stripInline(row[0] ?? ''), version: stripInline(row[1] ?? ''), note: stripInline(row[2] ?? '') }))
  else block.items = body.split('\n').map((line) => line.match(/^[-*+]\s+(.+)$/)?.[1]).filter((value): value is string => Boolean(value)).map((value) => ({ id: crypto.randomUUID(), name: stripInline(value), version: '', note: '' }))
  return block.items.length ? block : customMarkdown(heading, body)
}

const parseRoadmap = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('roadmap')
  if (block.type !== 'roadmap') return block
  block.heading = heading
  const items: RoadmapItem[] = []
  for (const match of body.matchAll(/^[-*+]\s+\[([ xX])\]\s+(.+)$/gm)) items.push({ id: crypto.randomUUID(), completed: match[1]?.toLowerCase() === 'x', label: match[2] ?? '' })
  if (!items.length) return customMarkdown(heading, body)
  block.items = items
  return block
}

const parseDetails = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('details')
  if (block.type !== 'details') return block
  block.heading = heading
  const items = [...body.matchAll(/<details([^>]*)>[\s\S]*?<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)].map((match) => ({ id: crypto.randomUUID(), summary: stripHtml(match[2] ?? ''), body: clean((match[3] ?? '').replace(/^\s*<p>|<\/p>\s*$/gi, '')), open: /\bopen\b/i.test(match[1] ?? '') }))
  if (!items.length) return customMarkdown(heading, body)
  block.items = items
  return block
}

const parseResources = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('resources')
  if (block.type !== 'resources') return block
  block.heading = heading
  const items = body.split('\n').map((line) => line.match(/^[-*+]\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:\s*[—-]\s*)?(.*)$/)?.slice(1)).filter((value): value is string[] => Boolean(value)).map((parts) => ({ id: crypto.randomUUID(), label: parts[0] ?? '', url: parts[1] ?? '', description: parts[2] ?? '' }))
  if (!items.length) return customMarkdown(heading, body)
  block.items = items
  return block
}

const parseLicense = (heading: string, body: string): ReadmeBlock => {
  const block = createBlock('license')
  if (block.type !== 'license') return block
  block.heading = heading
  const kinds = ['MIT', 'Apache-2.0', 'GPL-3.0', 'LGPL-3.0', 'AGPL-3.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'ISC', 'Unlicense'] as const
  block.license = kinds.find((item) => new RegExp(item.replace(/[.-]/g, '[ .-]?'), 'i').test(body)) ?? 'MIT'
  const author = body.match(/Created by\s+\*\*([^*]+)\*\*/i)?.[1]
  if (author) block.authorName = author
  return block
}

const parseAlert = (body: string) => {
  const match = body.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n([\s\S]*)$/i)
  if (!match) return null
  const block = createBlock('alert')
  if (block.type !== 'alert') return null
  block.kind = (match[1] ?? 'NOTE').toUpperCase() as AlertKind
  block.body = (match[2] ?? '').split('\n').map((line) => line.replace(/^>\s?/, '')).join('\n').trim()
  return block
}

const parseGeneric = (heading: string, body: string): ReadmeBlock => {
  const alert = parseAlert(body)
  if (alert) return alert
  const codeMatch = body.match(/^(.*?)\n*```([^\n]*)\n([\s\S]*?)```\s*$/)
  if (codeMatch) {
    const block = createBlock('code')
    if (block.type === 'code') {
      block.heading = heading
      block.description = clean(codeMatch[1] ?? '')
      block.language = clean(codeMatch[2] ?? '')
      block.code = (codeMatch[3] ?? '').replace(/\n$/, '')
      return block
    }
  }
  if (!/[|<>]|```|^\s*>|^\s*[-*+]\s+\[/m.test(body)) {
    const block = createBlock('text')
    if (block.type === 'text') {
      block.heading = heading
      block.body = clean(body)
      return block
    }
  }
  const block = createBlock('markdown')
  if (block.type === 'markdown') {
    block.heading = heading
    block.markdown = clean(body)
    block.showHeading = true
  }
  return block
}

const parseSection = (heading: string, body: string): ReadmeBlock => {
  const key = normalizeHeading(heading)
  if (/^(table of contents|contents|toc)$/.test(key)) {
    const block = createBlock('toc')
    if (block.type === 'toc') block.heading = heading
    return block
  }
  if (/(tech stack|technology|technologies|tooling|built with)/.test(key)) return parseTech(heading, body)
  if (/(features|key features|highlights)/.test(key)) return parseFeatures(heading, body)
  if (/(screenshots|gallery|preview|demo)/.test(key)) return parseGallery(heading, body)
  if (/(installation|quick start|getting started|setup|usage)/.test(key)) return parseQuickStart(heading, body)
  if (/(configuration|environment|environment variables|config)/.test(key)) return parseConfig(heading, body)
  if (/(requirements|prerequisites)/.test(key)) return parseRequirements(heading, body)
  if (/(roadmap|milestones)/.test(key)) return parseRoadmap(heading, body)
  if (/(faq|frequently asked|details)/.test(key)) return parseDetails(heading, body)
  if (/(resources|links|documentation)/.test(key)) return parseResources(heading, body)
  if (/license/.test(key)) return parseLicense(heading, body)
  return parseGeneric(heading, body)
}

export const importMarkdown = (markdown: string, filename = 'README.md'): DocumentState => {
  const source = markdown.replace(/\r/g, '').trim()
  if (!source) return { title: filename || 'README.md', blocks: [] }
  const headings = [...source.matchAll(/^##\s+(.+)$/gm)]
  const firstIndex = headings[0]?.index ?? source.length
  const prefix = source.slice(0, firstIndex).trim()
  const blocks: ReadmeBlock[] = []
  if (prefix) blocks.push(parseHero(prefix))
  headings.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length
    const end = headings[index + 1]?.index ?? source.length
    const heading = clean(match[1] ?? 'Section')
    const body = source.slice(start, end).trim()
    blocks.push(parseSection(heading, body))
  })
  if (!blocks.length) {
    const raw = createBlock('markdown')
    if (raw.type === 'markdown') {
      raw.heading = filename.replace(/\.(md|markdown)$/i, '') || 'Imported README'
      raw.markdown = source
      raw.showHeading = false
      blocks.push(raw)
    }
  }
  return { title: filename || 'README.md', blocks }
}

export const githubRepositoryFromInput = (input: string) => {
  const value = input.trim().replace(/\.git$/i, '').replace(/\/$/, '')
  const urlMatch = value.match(/github\.com\/([^/]+)\/([^/#?]+)/i)
  if (urlMatch) return { owner: urlMatch[1] ?? '', repo: urlMatch[2] ?? '' }
  const pair = value.match(/^([^/\s]+)\/([^/\s]+)$/)
  return pair ? { owner: pair[1] ?? '', repo: pair[2] ?? '' } : null
}

export const fetchGithubReadme = async (input: string) => {
  const repository = githubRepositoryFromInput(input)
  if (!repository) throw new Error('Enter a GitHub repository URL or owner/repo.')
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/readme`, { headers: { Accept: 'application/vnd.github.raw+json' } })
  if (!response.ok) {
    if (response.status === 404) throw new Error('README.md was not found in this repository.')
    if (response.status === 403) throw new Error('GitHub API rate limit reached. Try again later or import the file directly.')
    throw new Error(`GitHub returned ${response.status}.`)
  }
  return { markdown: await response.text(), filename: 'README.md', repository: `${repository.owner}/${repository.repo}` }
}
