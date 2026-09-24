import { badgeSource } from './badges'
import { techColors, techLogos, techSlugs } from './constants'
import type { AuthorLinks, CustomTechnology, HeroBadge, ReadmeBlock } from '../types/blocks'

const trimLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()
const escapeCell = (value: string) => trimLine(value).replace(/\|/g, '\\|')
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const encode = (value: string) => encodeURIComponent(value).replace(/-/g, '--')
const cleanColor = (value: string, fallback: string) => value.trim().replace(/^#/, '') || fallback

const stripInlineMarkdown = (value: string) => value
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/~~([^~]+)~~/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/_([^_]+)_/g, '$1')

const inlineMarkdownToHtml = (value: string) => {
  let html = escapeHtml(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  return html.replace(/\n/g, '<br />')
}

const richMarkdownToHtml = (value: string) => {
  const lines = value.replace(/\r/g, '').split('\n')
  const output: string[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*+]\s+/.test(lines[index] ?? '')) {
        items.push(`<li>${inlineMarkdownToHtml((lines[index] ?? '').replace(/^[-*+]\s+/, ''))}</li>`)
        index += 1
      }
      output.push(`<ul>${items.join('')}</ul>`)
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index] ?? '')) {
        items.push(`<li>${inlineMarkdownToHtml((lines[index] ?? '').replace(/^\d+\.\s+/, ''))}</li>`)
        index += 1
      }
      output.push(`<ol>${items.join('')}</ol>`)
      continue
    }
    if (line.trim()) output.push(`<p>${inlineMarkdownToHtml(line)}</p>`)
    index += 1
  }
  return output.join('\n')
}

const markdownTable = (headers: string[], rows: string[][], alignments: ('left' | 'center')[] = []) => {
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => row[index]?.length ?? 0), 3))
  const renderRow = (cells: string[]) => `| ${cells.map((cell, index) => cell.padEnd(widths[index] ?? cell.length)).join(' | ')} |`
  const separator = widths.map((width, index) => {
    const alignment = alignments[index] ?? 'left'
    if (alignment === 'center') return `:${'-'.repeat(Math.max(width - 2, 3))}:`.padEnd(width)
    return `:${'-'.repeat(Math.max(width - 1, 3))}`.padEnd(width)
  })
  return [renderRow(headers), renderRow(separator), ...rows.map(renderRow)].join('\n')
}

const badgeMarkdown = (badge: HeroBadge) => {
  const image = `![${trimLine(badge.label || badge.kind)}](${badgeSource(badge)})`
  return badge.link.trim() ? `[${image}](${badge.link.trim()})` : image
}

const badgeHtml = (badge: HeroBadge) => {
  const image = `<img alt="${escapeHtml(badge.label || badge.kind)}" src="${escapeHtml(badgeSource(badge))}" />`
  return badge.link.trim() ? `<a href="${escapeHtml(badge.link.trim())}">${image}</a>` : image
}

const serializeHero = (block: Extract<ReadmeBlock, { type: 'hero' }>) => {
  const title = trimLine(block.title) || 'Untitled Project'
  const subtitle = block.subtitle?.trim() ?? ''
  const description = block.description?.trim() ?? ''
  const typingText = stripInlineMarkdown(subtitle)
  const typing = `https://readme-typing-svg.demolab.com?font=Inter&weight=500&size=18&pause=1200&color=FFFFFF&center=${block.alignment === 'center' ? 'true' : 'false'}&vCenter=true&width=700&lines=${encodeURIComponent(typingText)}`
  const badgeGap = block.badgeSpacing === 'compact' ? '&nbsp;' : block.badgeSpacing === 'wide' ? '&nbsp;&nbsp;&nbsp;&nbsp;' : '&nbsp;&nbsp;'
  const badges = block.badges.map(block.alignment === 'center' ? badgeHtml : badgeMarkdown).join(badgeGap)
  const image = block.imageUrl.trim()

  if (block.alignment === 'center') {
    const parts = [`<h1 align="center">${escapeHtml(title)}</h1>`]
    if (image) parts.push(`<p align="center"><img src="${escapeHtml(image)}" alt="${escapeHtml(block.imageAlt || title)}" /></p>`)
    if (subtitle) parts.push(block.animatedSubtitle ? `<p align="center"><img src="${typing}" alt="${escapeHtml(typingText)}" /></p>` : `<p align="center">${inlineMarkdownToHtml(subtitle)}</p>`)
    if (description) parts.push(`<p align="center">${inlineMarkdownToHtml(description)}</p>`)
    if (badges) parts.push(`<p align="center">${badges}</p>`)
    return parts.join('\n\n')
  }

  const parts = [`# ${title}`]
  if (image) parts.push(`![${trimLine(block.imageAlt || title)}](${image})`)
  if (subtitle) parts.push(block.animatedSubtitle ? `![${typingText}](${typing})` : subtitle)
  if (description) parts.push(description)
  if (badges) parts.push(badges)
  return parts.join('\n\n')
}

const headingForBlock = (block: ReadmeBlock) => {
  if (block.type === 'hero') return trimLine(block.title)
  if (block.type === 'alert') return ''
  if ('heading' in block) return trimLine(block.heading)
  return ''
}

const githubSlug = (heading: string) => stripInlineMarkdown(heading).toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-')

const serializeToc = (block: Extract<ReadmeBlock, { type: 'toc' }>, blocks: ReadmeBlock[]) => {
  const heading = `## ${trimLine(block.heading) || 'Table of Contents'}`
  const counts = new Map<string, number>()
  const entries = blocks.filter((item) => item.visible && item.type !== 'hero' && item.type !== 'toc').map((item) => {
    const label = headingForBlock(item)
    const base = githubSlug(label)
    if (!label || !base) return null
    const seen = counts.get(base) ?? 0
    counts.set(base, seen + 1)
    return { label, slug: seen ? `${base}-${seen}` : base }
  }).filter((entry): entry is { label: string; slug: string } => Boolean(entry))
  if (!entries.length) return heading
  return `${heading}\n\n${entries.map((entry, index) => `${block.style === 'numbers' ? `${index + 1}.` : '-'} [${entry.label}](#${entry.slug})`).join('\n')}`
}

const serializeText = (block: Extract<ReadmeBlock, { type: 'text' }>) => {
  const heading = `## ${trimLine(block.heading) || 'About'}`
  return block.body.trim() ? `${heading}\n\n${block.body.trim()}` : heading
}

const customTechShield = (tech: CustomTechnology, style: string, fallbackColor: string, logoColor: string) => {
  const color = cleanColor(tech.color, cleanColor(fallbackColor, '18181b'))
  const params = new URLSearchParams({ style, logoColor: cleanColor(logoColor, 'ffffff') })
  if (tech.shieldLogo.trim()) params.set('logo', tech.shieldLogo.trim())
  return `![${trimLine(tech.name)}](https://img.shields.io/badge/${encode(tech.name)}-${color}?${params.toString()})`
}

const builtInTechShield = (name: string, style: string, fallbackColor: string, logoColor: string) => {
  const color = cleanColor(fallbackColor, techColors[name] ?? '18181b')
  const params = new URLSearchParams({ style, logoColor: cleanColor(logoColor, 'ffffff') })
  const logo = techLogos[name]
  if (logo) params.set('logo', logo)
  return `![${name}](https://img.shields.io/badge/${encode(name)}-${color}?${params.toString()})`
}

const serializeTech = (block: Extract<ReadmeBlock, { type: 'techStack' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Tech Stack'}`
  const custom = block.customTechnologies ?? []
  if (!block.technologies.length && !custom.length) return heading

  if (block.mode === 'skillicons') {
    const slugs = block.technologies.map((name) => techSlugs[name]).filter(Boolean)
    const customSlugs = custom.map((item) => item.skillIcon.trim()).filter(Boolean)
    const iconLine = [...slugs, ...customSlugs].length ? `![Tech Stack](https://skillicons.dev/icons?i=${[...slugs, ...customSlugs].join(',')}&theme=${block.skillTheme ?? 'dark'}&perline=${Math.max(1, Math.min(20, block.iconsPerLine ?? 12))})` : ''
    const unsupported = block.technologies.filter((name) => !techSlugs[name]).map((name) => builtInTechShield(name, block.badgeStyle ?? 'flat-square', block.badgeColor ?? '', block.badgeLogoColor ?? 'ffffff'))
    const unsupportedCustom = custom.filter((item) => !item.skillIcon.trim()).map((item) => customTechShield(item, block.badgeStyle ?? 'flat-square', block.badgeColor ?? '', block.badgeLogoColor ?? 'ffffff'))
    return `${heading}\n\n${[iconLine, [...unsupported, ...unsupportedCustom].join(' ')].filter(Boolean).join('\n\n')}`
  }

  if (block.mode === 'shields') {
    const badges = block.technologies.map((name) => builtInTechShield(name, block.badgeStyle ?? 'flat-square', block.badgeColor ?? '', block.badgeLogoColor ?? 'ffffff'))
    const customBadges = custom.map((item) => customTechShield(item, block.badgeStyle ?? 'flat-square', block.badgeColor ?? '', block.badgeLogoColor ?? 'ffffff'))
    return `${heading}\n\n${[...badges, ...customBadges].join(' ')}`
  }

  return `${heading}\n\n${[...block.technologies, ...custom.map((item) => item.name)].map((name) => `- ${name}`).join('\n')}`
}

const serializeFeatures = (block: Extract<ReadmeBlock, { type: 'features' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Features'}`
  if (!block.items.length) return heading
  if (block.format === 'table') {
    const rows = block.items.map((item) => [escapeCell(`${item.emoji} ${item.title}`.trim()), escapeCell(item.detail)])
    return `${heading}\n\n${markdownTable(['Feature', 'Description'], rows)}`
  }
  return `${heading}\n\n${block.items.map((item) => `- ${item.emoji ? `${item.emoji} ` : ''}**${trimLine(item.title)}**${item.detail.trim() ? ` — ${trimLine(item.detail)}` : ''}`).join('\n')}`
}

const serializeGallery = (block: Extract<ReadmeBlock, { type: 'gallery' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Screenshots'}`
  const items = block.items.filter((item) => item.url.trim())
  if (!items.length) return heading
  if (block.columns === 1) {
    const body = items.map((item) => {
      const image = `![${trimLine(item.alt || item.caption || 'Screenshot')}](${item.url.trim()})`
      const linked = item.link.trim() ? `[${image}](${item.link.trim()})` : image
      return item.caption.trim() ? `${linked}\n\n*${trimLine(item.caption)}*` : linked
    }).join('\n\n')
    return `${heading}\n\n${body}`
  }
  const rows: string[] = []
  for (let index = 0; index < items.length; index += block.columns) {
    const cells = items.slice(index, index + block.columns).map((item) => {
      const image = `<img src="${escapeHtml(item.url.trim())}" alt="${escapeHtml(item.alt || item.caption || 'Screenshot')}" />`
      const linked = item.link.trim() ? `<a href="${escapeHtml(item.link.trim())}">${image}</a>` : image
      const caption = item.caption.trim() ? `<br /><sub>${inlineMarkdownToHtml(item.caption.trim())}</sub>` : ''
      return `<td align="center" valign="top">${linked}${caption}</td>`
    }).join('')
    rows.push(`<tr>${cells}</tr>`)
  }
  return `${heading}\n\n<table>\n${rows.join('\n')}\n</table>`
}

const serializeQuickStart = (block: Extract<ReadmeBlock, { type: 'quickStart' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Quick Start'}`
  if (!block.steps.length) return heading
  const body = block.steps.map((step, index) => `${index + 1}. ${trimLine(step.description) || `Step ${index + 1}`}\n\n\`\`\`bash\n${step.command.trim()}\n\`\`\``).join('\n\n')
  return `${heading}\n\n> Package manager: \`${block.packageManager}\`\n\n${body}`
}

const serializeConfig = (block: Extract<ReadmeBlock, { type: 'config' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Configuration'}`
  if (!block.rows.length) return heading
  const rows = block.rows.map((row) => [`\`${escapeCell(row.name)}\``, escapeCell(row.valueType), row.defaultValue.trim() ? `\`${escapeCell(row.defaultValue)}\`` : '—', row.required ? 'Yes' : 'No', escapeCell(row.description)])
  const env = block.rows.map((row) => `${trimLine(row.name)}=${row.defaultValue.trim() && row.defaultValue.trim() !== '—' ? trimLine(row.defaultValue) : ''}`).join('\n')
  return `${heading}\n\n${markdownTable(['Variable', 'Type', 'Default', 'Required', 'Description'], rows, ['left', 'left', 'left', 'center', 'left'])}\n\n### Environment\n\n\`\`\`env\n${env}\n\`\`\``
}

const serializeRequirements = (block: Extract<ReadmeBlock, { type: 'requirements' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Requirements'}`
  if (!block.items.length) return heading
  const rows = block.items.map((item) => [escapeCell(item.name), escapeCell(item.version || '—'), escapeCell(item.note || '—')])
  return `${heading}\n\n${markdownTable(['Requirement', 'Version', 'Notes'], rows)}`
}

const serializeAlert = (block: Extract<ReadmeBlock, { type: 'alert' }>) => {
  const lines = block.body.trim().split('\n').map((line) => `> ${line}`)
  return `> [!${block.kind}]\n${lines.join('\n')}`
}

const serializeCode = (block: Extract<ReadmeBlock, { type: 'code' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Example'}`
  const description = block.description.trim()
  const code = `\`\`\`${trimLine(block.language)}\n${block.code.replace(/\n+$/, '')}\n\`\`\``
  return `${heading}${description ? `\n\n${description}` : ''}\n\n${code}`
}

const serializeResources = (block: Extract<ReadmeBlock, { type: 'resources' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Resources'}`
  if (!block.items.length) return heading
  return `${heading}\n\n${block.items.map((item) => {
    const label = trimLine(item.label) || item.url.trim() || 'Resource'
    const link = item.url.trim() ? `[${label}](${item.url.trim()})` : label
    return `- ${link}${item.description.trim() ? ` — ${trimLine(item.description)}` : ''}`
  }).join('\n')}`
}

const serializeContributing = (block: Extract<ReadmeBlock, { type: 'contributing' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Contributing'}`
  const parts: string[] = [heading]
  if (block.intro.trim()) parts.push(block.intro.trim())
  if (block.steps.length) parts.push(block.steps.map((step, index) => `${index + 1}. ${trimLine(step.description) || `Step ${index + 1}`}\n\n\`\`\`bash\n${step.command.trim()}\n\`\`\``).join('\n\n'))
  const links = [block.issueUrl.trim() ? `[Open an issue](${block.issueUrl.trim()})` : '', block.guidelinesUrl.trim() ? `[Contribution guidelines](${block.guidelinesUrl.trim()})` : ''].filter(Boolean)
  if (links.length) parts.push(links.join(' · '))
  return parts.join('\n\n')
}

const serializeRoadmap = (block: Extract<ReadmeBlock, { type: 'roadmap' }>) => {
  const heading = `## ${trimLine(block.heading) || 'Roadmap'}`
  if (!block.items.length) return heading
  return `${heading}\n\n${block.items.map((item) => `- [${item.completed ? 'x' : ' '}] ${trimLine(item.label)}`).join('\n')}`
}

const serializeDetails = (block: Extract<ReadmeBlock, { type: 'details' }>) => {
  const heading = `## ${trimLine(block.heading) || 'FAQ'}`
  if (!block.items.length) return heading
  const items = block.items.map((item) => `<details${item.open ? ' open' : ''}>\n<summary>${inlineMarkdownToHtml(item.summary.trim() || 'Details')}</summary>\n${richMarkdownToHtml(item.body.trim())}\n</details>`)
  return `${heading}\n\n${items.join('\n\n')}`
}

const serializeMarkdownBlock = (block: Extract<ReadmeBlock, { type: 'markdown' }>) => {
  const body = block.markdown.trim()
  if (!block.showHeading) return body
  const heading = `## ${trimLine(block.heading) || 'Custom'}`
  return body ? `${heading}\n\n${body}` : heading
}

const socialHref = (key: keyof AuthorLinks, value: string) => {
  const raw = value.trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (key === 'github') return `https://github.com/${raw.replace(/^@/, '')}`
  if (key === 'telegram') return `https://t.me/${raw.replace(/^@/, '')}`
  if (key === 'x') return `https://x.com/${raw.replace(/^@/, '')}`
  if (key === 'discord') return /^\d+$/.test(raw) ? `https://discord.com/users/${raw}` : `https://discord.com/${raw.replace(/^\//, '')}`
  return `https://${raw}`
}

const serializeLicense = (block: Extract<ReadmeBlock, { type: 'license' }>) => {
  const heading = `## ${trimLine(block.heading) || 'License'}`
  const lines = [`Released under the **${block.license}** license.`]
  const entries = Object.entries(block.links) as [keyof AuthorLinks, string][]
  const badges = entries.filter(([, value]) => value.trim()).map(([key, value]) => {
    const href = socialHref(key, value)
    const label = key === 'x' ? 'X' : key.charAt(0).toUpperCase() + key.slice(1)
    const logo = key === 'x' ? 'x' : key === 'website' ? 'googlechrome' : key
    const badge = `![${label}](https://img.shields.io/badge/${encode(label)}-000000?style=flat-square&logo=${encodeURIComponent(logo)}&logoColor=white)`
    return `[${badge}](${href})`
  })
  if (block.authorName.trim()) lines.push(`Created by **${trimLine(block.authorName)}**.`)
  if (badges.length) lines.push(badges.join(' '))
  return `${heading}\n\n${lines.join('\n\n')}`
}

export const serializeMarkdown = (blocks: ReadmeBlock[]) => blocks
  .filter((block) => block.visible)
  .map((block) => {
    if (block.type === 'hero') return serializeHero(block)
    if (block.type === 'toc') return serializeToc(block, blocks)
    if (block.type === 'text') return serializeText(block)
    if (block.type === 'techStack') return serializeTech(block)
    if (block.type === 'features') return serializeFeatures(block)
    if (block.type === 'gallery') return serializeGallery(block)
    if (block.type === 'quickStart') return serializeQuickStart(block)
    if (block.type === 'config') return serializeConfig(block)
    if (block.type === 'requirements') return serializeRequirements(block)
    if (block.type === 'alert') return serializeAlert(block)
    if (block.type === 'code') return serializeCode(block)
    if (block.type === 'resources') return serializeResources(block)
    if (block.type === 'contributing') return serializeContributing(block)
    if (block.type === 'roadmap') return serializeRoadmap(block)
    if (block.type === 'details') return serializeDetails(block)
    if (block.type === 'markdown') return serializeMarkdownBlock(block)
    return serializeLicense(block)
  })
  .filter(Boolean)
  .join('\n\n')
  .trim()
  .concat('\n')
