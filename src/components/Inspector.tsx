import { ArrowDown, ArrowUp, ChevronDown, Image as ImageIcon, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { badgeKinds, badgeStyles, emojiOptions, licenses, packageManagers, technologies } from '../lib/constants'
import { badgeSource } from '../lib/badges'
import { createId } from '../lib/id'
import { techPresets } from '../lib/techCatalog'
import { useGloammarkStore } from '../store/useGloammarkStore'
import type { AlertBlock, AuthorLinks, CodeBlock, ConfigTableBlock, ContributingBlock, DetailsBlock, FeatureListBlock, GalleryBlock, GalleryColumns, HeroBadge, HeroBlock, LicenseBlock, MarkdownBlock, QuickStartBlock, ReadmeBlock, RequirementsBlock, ResourcesBlock, RoadmapBlock, TechStackBlock, TextBlock, TocBlock } from '../types/blocks'
import { Button, Field, Input, RichText, Segmented, Select, Textarea } from './Controls'

const Accordion = ({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border-b border-zinc-900">
      <button className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpen((value) => !value)}>
        <span className="text-xs font-semibold text-zinc-300">{title}</span>
        <ChevronDown className={`size-3.5 text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden"><div className="space-y-4 px-4 pb-4">{children}</div></div>
      </div>
    </section>
  )
}

const RowShell = ({ children, onRemove }: { children: ReactNode; onRemove: () => void }) => (
  <div className="rounded-lg border border-zinc-900 bg-black p-3">
    <div className="space-y-3">{children}</div>
    <button className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-zinc-700 transition hover:text-white" onClick={onRemove}><Trash2 className="size-3" />Remove</button>
  </div>
)

const pickerColor = (value: string) => {
  const clean = value.trim().replace(/^#/, '')
  return /^[0-9a-f]{6}$/i.test(clean) ? `#${clean}` : '#18181b'
}

const ShieldColorField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) => (
  <Field label={label}>
    <div className="grid grid-cols-[36px_1fr] gap-2">
      <input type="color" value={pickerColor(value)} onChange={(event) => onChange(event.target.value.slice(1))} className="h-9 w-9 cursor-pointer rounded-md border border-zinc-800 bg-black p-1" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="font-mono text-xs" />
    </div>
  </Field>
)

const badgeValueLabel = (badge: HeroBadge) => {
  if (badge.kind === 'custom') return 'Value'
  if (badge.kind === 'build') return 'Repository / workflow'
  if (badge.kind === 'version') return 'Repository / version'
  return 'Repository / value'
}

const HeroInspector = ({ block }: { block: HeroBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<HeroBlock>) => updateBlock(block.id, (current) => current.type === 'hero' ? { ...current, ...patch } : current)
  const updateBadge = (id: string, patch: Partial<HeroBadge>) => update({ badges: block.badges.map((item) => item.id === id ? { ...item, ...patch } : item) })
  const moveBadge = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= block.badges.length) return
    const badges = [...block.badges]
    const current = badges[index]
    const swap = badges[target]
    if (!current || !swap) return
    badges[index] = swap
    badges[target] = current
    update({ badges })
  }
  const setBadgePalette = (mode: 'mono' | 'default') => update({
    badges: block.badges.map((badge) => mode === 'mono'
      ? { ...badge, color: '18181b', labelColor: '27272a', logoColor: 'ffffff' }
      : { ...badge, color: '', labelColor: '', logoColor: '' })
  })
  return (
    <>
      <Accordion title="Content">
        <Field label="Title"><Input value={block.title} onChange={(event) => update({ title: event.target.value })} /></Field>
        <Field label="Subtitle"><RichText value={block.subtitle} onChange={(subtitle) => update({ subtitle })} placeholder="Short project tagline" /></Field>
        <Field label="Description"><RichText value={block.description ?? ''} onChange={(description) => update({ description })} placeholder="A little more context about the project" /></Field>
        <Field label="Alignment"><Segmented value={block.alignment} options={['left', 'center'] as const} onChange={(alignment) => update({ alignment })} /></Field>
        <label className="flex items-center justify-between rounded-md border border-zinc-900 px-3 py-2.5 text-xs text-zinc-400">
          Animated typing SVG
          <input type="checkbox" checked={block.animatedSubtitle} onChange={(event) => update({ animatedSubtitle: event.target.checked })} className="size-4 accent-white" />
        </label>
      </Accordion>
      <Accordion title="Image">
        <Field label="Banner or logo URL"><Input value={block.imageUrl} onChange={(event) => update({ imageUrl: event.target.value })} placeholder="https://..." /></Field>
        <Field label="Alt text"><Input value={block.imageAlt} onChange={(event) => update({ imageAlt: event.target.value })} /></Field>
        <div className="grid h-28 place-items-center overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
          {block.imageUrl ? <img src={block.imageUrl} alt={block.imageAlt} className="max-h-full max-w-full object-contain" /> : <ImageIcon className="size-5 text-zinc-800" />}
        </div>
      </Accordion>
      <Accordion title="Badges">
        <Field label="Spacing"><Segmented value={block.badgeSpacing ?? 'normal'} options={['compact', 'normal', 'wide'] as const} onChange={(badgeSpacing) => update({ badgeSpacing })} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setBadgePalette('mono')}>Monochrome</Button>
          <Button onClick={() => setBadgePalette('default')}>Reset colors</Button>
        </div>
        <div className="space-y-2">
          {block.badges.map((badge, index) => (
            <RowShell key={badge.id} onRemove={() => update({ badges: block.badges.filter((item) => item.id !== badge.id) })}>
              <div className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-zinc-900 bg-zinc-950 px-3 py-2">
                <div className="min-w-0 flex-1 overflow-hidden"><img src={badgeSource(badge)} alt={badge.label || badge.kind} className="max-h-7 max-w-full" /></div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" title="Move badge up" disabled={index === 0} onClick={() => moveBadge(index, -1)} className="grid size-7 place-items-center rounded border border-zinc-800 text-zinc-500 transition hover:text-white disabled:opacity-20"><ArrowUp className="size-3.5" /></button>
                  <button type="button" title="Move badge down" disabled={index === block.badges.length - 1} onClick={() => moveBadge(index, 1)} className="grid size-7 place-items-center rounded border border-zinc-800 text-zinc-500 transition hover:text-white disabled:opacity-20"><ArrowDown className="size-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Type"><Select value={badge.kind} onChange={(event) => updateBadge(badge.id, { kind: event.target.value as typeof badge.kind })}>{badgeKinds.map((kind) => <option key={kind}>{kind}</option>)}</Select></Field>
                <Field label="Style"><Select value={badge.style} onChange={(event) => updateBadge(badge.id, { style: event.target.value as typeof badge.style })}>{badgeStyles.map((style) => <option key={style}>{style}</option>)}</Select></Field>
              </div>
              <Field label="Label"><Input value={badge.label} onChange={(event) => updateBadge(badge.id, { label: event.target.value })} /></Field>
              <Field label={badgeValueLabel(badge)}><Input value={badge.value} onChange={(event) => updateBadge(badge.id, { value: event.target.value })} placeholder={badge.kind === 'custom' ? 'active' : badge.kind === 'build' ? 'owner/repo/workflow.yml' : 'owner/repo or value'} /></Field>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <ShieldColorField label="Value color" value={badge.color ?? ''} onChange={(color) => updateBadge(badge.id, { color })} placeholder="18181b" />
                <ShieldColorField label="Label color" value={badge.labelColor ?? ''} onChange={(labelColor) => updateBadge(badge.id, { labelColor })} placeholder="27272a" />
              </div>
              <ShieldColorField label="Logo color" value={badge.logoColor ?? ''} onChange={(logoColor) => updateBadge(badge.id, { logoColor })} placeholder="ffffff" />
              <Field label="Link"><Input value={badge.link} onChange={(event) => updateBadge(badge.id, { link: event.target.value })} placeholder="https://..." /></Field>
            </RowShell>
          ))}
        </div>
        <Button onClick={() => update({ badges: [...block.badges, { id: createId(), kind: 'custom', label: 'status', value: 'active', style: 'flat', color: '18181b', labelColor: '27272a', logoColor: 'ffffff', link: '' }] })}><Plus className="size-3.5" />Add badge</Button>
      </Accordion>
    </>
  )
}

const TocInspector = ({ block }: { block: TocBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<TocBlock>) => updateBlock(block.id, (current) => current.type === 'toc' ? { ...current, ...patch } : current)
  return <Accordion title="Table of Contents"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="List style"><Segmented value={block.style} options={['bullets', 'numbers'] as const} onChange={(style) => update({ style })} /></Field><p className="text-[11px] leading-5 text-zinc-600">Links are generated automatically from every visible section and stay in sync when blocks move or headings change.</p></Accordion>
}

const TextInspector = ({ block }: { block: TextBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<TextBlock>) => updateBlock(block.id, (current) => current.type === 'text' ? { ...current, ...patch } : current)
  return <Accordion title="Text Section"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="Body"><RichText value={block.body} onChange={(body) => update({ body })} lists placeholder="Write visually formatted content" /></Field></Accordion>
}

const TechInspector = ({ block }: { block: TechStackBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const [query, setQuery] = useState('')
  const [selectedOnly, setSelectedOnly] = useState(false)
  const update = (patch: Partial<TechStackBlock>) => updateBlock(block.id, (current) => current.type === 'techStack' ? { ...current, ...patch } : current)
  const toggle = (name: string) => update({ technologies: block.technologies.includes(name) ? block.technologies.filter((item) => item !== name) : [...block.technologies, name] })
  const totalCatalog = useMemo(() => Object.values(technologies).reduce((total, items) => total + items.length, 0), [])
  const custom = block.customTechnologies ?? []
  const addCustom = () => update({ customTechnologies: [...custom, { id: createId(), name: 'Custom tech', skillIcon: '', shieldLogo: '', color: '18181b' }] })
  const updateCustom = (id: string, patch: Partial<(typeof custom)[number]>) => update({ customTechnologies: custom.map((item) => item.id === id ? { ...item, ...patch } : item) })
  const selectedCount = block.technologies.length + custom.length
  return (
    <>
      <Accordion title="Section">
        <Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field>
        <Field label="Renderer"><Segmented value={block.mode} options={['skillicons', 'shields', 'list'] as const} onChange={(mode) => update({ mode })} /></Field>
        {block.mode === 'skillicons' && <div className="grid grid-cols-2 gap-2"><Field label="Theme"><Segmented value={block.skillTheme ?? 'dark'} options={['dark', 'light'] as const} onChange={(skillTheme) => update({ skillTheme })} /></Field><Field label="Icons / row"><Input type="number" min={1} max={20} value={block.iconsPerLine ?? 12} onChange={(event) => update({ iconsPerLine: Math.max(1, Math.min(20, Number(event.target.value) || 1)) })} /></Field></div>}
        {block.mode !== 'list' && <><Field label="Badge fallback style"><Segmented value={block.badgeStyle ?? 'flat-square'} options={['flat', 'flat-square', 'for-the-badge'] as const} onChange={(badgeStyle) => update({ badgeStyle })} /></Field><div className="grid grid-cols-2 gap-3"><ShieldColorField label="Badge color" value={block.badgeColor ?? ''} onChange={(badgeColor) => update({ badgeColor })} placeholder="18181b" /><ShieldColorField label="Logo color" value={block.badgeLogoColor ?? ''} onChange={(badgeLogoColor) => update({ badgeLogoColor })} placeholder="ffffff" /></div></>}
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-700" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${totalCatalog}+ technologies`} className="pl-9" /></div>
        <div className="flex items-center justify-between text-[11px] text-zinc-600"><span>{selectedCount} selected</span><div className="flex gap-2"><button className={selectedOnly ? 'text-white' : 'hover:text-white'} onClick={() => setSelectedOnly((value) => !value)}>Selected only</button><button className="hover:text-white" onClick={() => update({ technologies: [], customTechnologies: [] })}>Clear</button></div></div>
      </Accordion>
      <Accordion title="Quick presets" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">{Object.entries(techPresets).map(([name, items]) => <button key={name} onClick={() => update({ technologies: Array.from(new Set([...block.technologies, ...items])) })} className="rounded-md border border-zinc-800 bg-black px-2.5 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-600 hover:text-white">{name}</button>)}</div>
      </Accordion>
      {block.technologies.length > 0 && <Accordion title="Selected" defaultOpen={false}><div className="flex flex-wrap gap-1.5">{block.technologies.map((name) => <button key={name} onClick={() => toggle(name)} className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-100 px-2 py-1 text-[11px] text-black">{name}<X className="size-3" /></button>)}</div></Accordion>}
      {Object.entries(technologies).map(([group, items]) => {
        const normalized = query.trim().toLowerCase()
        const filtered = items.filter((name) => (!normalized || name.toLowerCase().includes(normalized)) && (!selectedOnly || block.technologies.includes(name)))
        if (!filtered.length) return null
        return (
          <Accordion key={group} title={`${group} · ${filtered.length}`} defaultOpen={Boolean(query) || group === 'Languages' || group === 'Frontend'}>
            <div className="flex flex-wrap gap-2">
              {filtered.map((name) => {
                const active = block.technologies.includes(name)
                return <button key={name} onClick={() => toggle(name)} className={`rounded-md border px-2.5 py-1.5 text-xs transition ${active ? 'border-zinc-500 bg-zinc-100 text-black' : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-600 hover:text-white'}`}>{name}</button>
              })}
            </div>
          </Accordion>
        )
      })}
      <Accordion title={`Custom technologies · ${custom.length}`} defaultOpen={false}>
        <p className="text-[11px] leading-5 text-zinc-600">Anything missing from the catalog can still be rendered. SkillIcons slug is optional; when omitted Gloammark falls back to a Shields badge.</p>
        <div className="space-y-2">{custom.map((item) => <RowShell key={item.id} onRemove={() => update({ customTechnologies: custom.filter((row) => row.id !== item.id) })}><Field label="Name"><Input value={item.name} onChange={(event) => updateCustom(item.id, { name: event.target.value })} /></Field><div className="grid grid-cols-2 gap-2"><Field label="SkillIcons slug"><Input value={item.skillIcon} onChange={(event) => updateCustom(item.id, { skillIcon: event.target.value })} placeholder="optional" /></Field><Field label="Shields logo"><Input value={item.shieldLogo} onChange={(event) => updateCustom(item.id, { shieldLogo: event.target.value })} placeholder="simple-icons slug" /></Field></div><ShieldColorField label="Badge color" value={item.color} onChange={(color) => updateCustom(item.id, { color })} placeholder="18181b" /></RowShell>)}</div>
        <Button onClick={addCustom}><Plus className="size-3.5" />Add custom technology</Button>
      </Accordion>
    </>
  )
}

const FeaturesInspector = ({ block }: { block: FeatureListBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<FeatureListBlock>) => updateBlock(block.id, (current) => current.type === 'features' ? { ...current, ...patch } : current)
  return <><Accordion title="Section"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="Format"><Segmented value={block.format} options={['list', 'table'] as const} onChange={(format) => update({ format })} /></Field></Accordion><Accordion title="Feature items"><div className="space-y-2">{block.items.map((item) => <RowShell key={item.id} onRemove={() => update({ items: block.items.filter((row) => row.id !== item.id) })}><div className="grid grid-cols-[74px_1fr] gap-2"><Field label="Emoji"><Select value={item.emoji} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, emoji: event.target.value } : row) })}>{emojiOptions.map((emoji) => <option key={emoji}>{emoji}</option>)}</Select></Field><Field label="Title"><Input value={item.title} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, title: event.target.value } : row) })} /></Field></div><Field label="Detail"><RichText value={item.detail} onChange={(detail) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, detail } : row) })} /></Field></RowShell>)}</div><Button onClick={() => update({ items: [...block.items, { id: createId(), emoji: '✨', title: 'New feature', detail: 'Describe what makes it useful.' }] })}><Plus className="size-3.5" />Add feature</Button></Accordion></>
}

const GalleryInspector = ({ block }: { block: GalleryBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<GalleryBlock>) => updateBlock(block.id, (current) => current.type === 'gallery' ? { ...current, ...patch } : current)
  return <><Accordion title="Gallery"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="Columns"><Select value={String(block.columns)} onChange={(event) => update({ columns: Number(event.target.value) as GalleryColumns })}><option value="1">1 column</option><option value="2">2 columns</option><option value="3">3 columns</option></Select></Field></Accordion><Accordion title="Images"><div className="space-y-2">{block.items.map((item) => <RowShell key={item.id} onRemove={() => update({ items: block.items.filter((row) => row.id !== item.id) })}><div className="grid h-24 place-items-center overflow-hidden rounded-md border border-zinc-900 bg-zinc-950">{item.url ? <img src={item.url} alt={item.alt} className="h-full w-full object-cover" /> : <ImageIcon className="size-5 text-zinc-800" />}</div><Field label="Image URL"><Input value={item.url} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, url: event.target.value } : row) })} placeholder="https://..." /></Field><Field label="Alt text"><Input value={item.alt} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, alt: event.target.value } : row) })} /></Field><Field label="Caption"><RichText value={item.caption} onChange={(caption) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, caption } : row) })} /></Field><Field label="Optional link"><Input value={item.link} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, link: event.target.value } : row) })} placeholder="https://..." /></Field></RowShell>)}</div><Button onClick={() => update({ items: [...block.items, { id: createId(), url: '', alt: `Screenshot ${block.items.length + 1}`, caption: '', link: '' }] })}><Plus className="size-3.5" />Add image</Button></Accordion></>
}

const QuickStartInspector = ({ block }: { block: QuickStartBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<QuickStartBlock>) => updateBlock(block.id, (current) => current.type === 'quickStart' ? { ...current, ...patch } : current)
  return <><Accordion title="Section"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="Package manager / runtime"><Select value={block.packageManager} onChange={(event) => update({ packageManager: event.target.value as QuickStartBlock['packageManager'] })}>{packageManagers.map((manager) => <option key={manager}>{manager}</option>)}</Select></Field></Accordion><Accordion title="Steps"><div className="space-y-2">{block.steps.map((step) => <RowShell key={step.id} onRemove={() => update({ steps: block.steps.filter((item) => item.id !== step.id) })}><Field label="Description"><RichText value={step.description} onChange={(description) => update({ steps: block.steps.map((item) => item.id === step.id ? { ...item, description } : item) })} /></Field><Field label="Bash command"><Textarea className="font-mono" value={step.command} onChange={(event) => update({ steps: block.steps.map((item) => item.id === step.id ? { ...item, command: event.target.value } : item) })} /></Field></RowShell>)}</div><Button onClick={() => update({ steps: [...block.steps, { id: createId(), description: 'Next step', command: '' }] })}><Plus className="size-3.5" />Add step</Button></Accordion></>
}

const ConfigInspector = ({ block }: { block: ConfigTableBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<ConfigTableBlock>) => updateBlock(block.id, (current) => current.type === 'config' ? { ...current, ...patch } : current)
  return <><Accordion title="Section"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field></Accordion><Accordion title="Variables"><div className="space-y-2">{block.rows.map((row) => <RowShell key={row.id} onRemove={() => update({ rows: block.rows.filter((item) => item.id !== row.id) })}><div className="grid grid-cols-2 gap-2"><Field label="Variable"><Input className="font-mono" value={row.name} onChange={(event) => update({ rows: block.rows.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item) })} /></Field><Field label="Type"><Input value={row.valueType} onChange={(event) => update({ rows: block.rows.map((item) => item.id === row.id ? { ...item, valueType: event.target.value } : item) })} /></Field></div><Field label="Default"><Input className="font-mono" value={row.defaultValue} onChange={(event) => update({ rows: block.rows.map((item) => item.id === row.id ? { ...item, defaultValue: event.target.value } : item) })} /></Field><Field label="Description"><RichText value={row.description} onChange={(description) => update({ rows: block.rows.map((item) => item.id === row.id ? { ...item, description } : item) })} /></Field><label className="flex items-center gap-2 text-xs text-zinc-500"><input type="checkbox" checked={row.required} onChange={(event) => update({ rows: block.rows.map((item) => item.id === row.id ? { ...item, required: event.target.checked } : item) })} className="size-4 accent-white" />Required</label></RowShell>)}</div><Button onClick={() => update({ rows: [...block.rows, { id: createId(), name: 'VARIABLE', valueType: 'string', defaultValue: '', description: '', required: false }] })}><Plus className="size-3.5" />Add variable</Button></Accordion></>
}

const RequirementsInspector = ({ block }: { block: RequirementsBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<RequirementsBlock>) => updateBlock(block.id, (current) => current.type === 'requirements' ? { ...current, ...patch } : current)
  return <><Accordion title="Requirements"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><div className="space-y-2">{block.items.map((item) => <RowShell key={item.id} onRemove={() => update({ items: block.items.filter((row) => row.id !== item.id) })}><div className="grid grid-cols-2 gap-2"><Field label="Requirement"><Input value={item.name} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, name: event.target.value } : row) })} /></Field><Field label="Version"><Input value={item.version} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, version: event.target.value } : row) })} placeholder="22+" /></Field></div><Field label="Notes"><RichText value={item.note} onChange={(note) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, note } : row) })} /></Field></RowShell>)}</div><Button onClick={() => update({ items: [...block.items, { id: createId(), name: 'Requirement', version: '', note: '' }] })}><Plus className="size-3.5" />Add requirement</Button></Accordion></>
}

const AlertInspector = ({ block }: { block: AlertBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<AlertBlock>) => updateBlock(block.id, (current) => current.type === 'alert' ? { ...current, ...patch } : current)
  return <Accordion title="GitHub Alert"><Field label="Type"><Segmented value={block.kind} options={['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const} onChange={(kind) => update({ kind })} /></Field><Field label="Content"><RichText value={block.body} onChange={(body) => update({ body })} lists /></Field></Accordion>
}

const CodeInspector = ({ block }: { block: CodeBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<CodeBlock>) => updateBlock(block.id, (current) => current.type === 'code' ? { ...current, ...patch } : current)
  return <Accordion title="Code Snippet"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="Description"><RichText value={block.description} onChange={(description) => update({ description })} /></Field><Field label="Language"><Input value={block.language} onChange={(event) => update({ language: event.target.value })} placeholder="ts, js, bash, python..." /></Field><Field label="Code"><Textarea className="min-h-48 font-mono text-xs" value={block.code} onChange={(event) => update({ code: event.target.value })} spellCheck={false} /></Field></Accordion>
}

const ResourcesInspector = ({ block }: { block: ResourcesBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<ResourcesBlock>) => updateBlock(block.id, (current) => current.type === 'resources' ? { ...current, ...patch } : current)
  return <><Accordion title="Resources"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><div className="space-y-2">{block.items.map((item) => <RowShell key={item.id} onRemove={() => update({ items: block.items.filter((row) => row.id !== item.id) })}><Field label="Label"><Input value={item.label} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, label: event.target.value } : row) })} /></Field><Field label="URL"><Input value={item.url} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, url: event.target.value } : row) })} placeholder="https://..." /></Field><Field label="Description"><RichText value={item.description} onChange={(description) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, description } : row) })} /></Field></RowShell>)}</div><Button onClick={() => update({ items: [...block.items, { id: createId(), label: 'Resource', url: '', description: '' }] })}><Plus className="size-3.5" />Add resource</Button></Accordion></>
}

const ContributingInspector = ({ block }: { block: ContributingBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<ContributingBlock>) => updateBlock(block.id, (current) => current.type === 'contributing' ? { ...current, ...patch } : current)
  return <><Accordion title="Contributing"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="Introduction"><RichText value={block.intro} onChange={(intro) => update({ intro })} lists /></Field><Field label="Issues URL"><Input value={block.issueUrl} onChange={(event) => update({ issueUrl: event.target.value })} placeholder="https://github.com/.../issues" /></Field><Field label="Guidelines URL"><Input value={block.guidelinesUrl} onChange={(event) => update({ guidelinesUrl: event.target.value })} placeholder="https://github.com/.../CONTRIBUTING.md" /></Field></Accordion><Accordion title="Contributor steps"><div className="space-y-2">{block.steps.map((step) => <RowShell key={step.id} onRemove={() => update({ steps: block.steps.filter((row) => row.id !== step.id) })}><Field label="Description"><RichText value={step.description} onChange={(description) => update({ steps: block.steps.map((row) => row.id === step.id ? { ...row, description } : row) })} /></Field><Field label="Command"><Textarea className="font-mono" value={step.command} onChange={(event) => update({ steps: block.steps.map((row) => row.id === step.id ? { ...row, command: event.target.value } : row) })} /></Field></RowShell>)}</div><Button onClick={() => update({ steps: [...block.steps, { id: createId(), description: 'Next step', command: '' }] })}><Plus className="size-3.5" />Add step</Button></Accordion></>
}

const RoadmapInspector = ({ block }: { block: RoadmapBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<RoadmapBlock>) => updateBlock(block.id, (current) => current.type === 'roadmap' ? { ...current, ...patch } : current)
  return <><Accordion title="Section"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field></Accordion><Accordion title="Milestones"><div className="space-y-2">{block.items.map((item) => <RowShell key={item.id} onRemove={() => update({ items: block.items.filter((row) => row.id !== item.id) })}><label className="flex items-center gap-2 text-xs text-zinc-500"><input type="checkbox" checked={item.completed} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, completed: event.target.checked } : row) })} className="size-4 accent-white" />Completed</label><Field label="Milestone"><RichText value={item.label} onChange={(label) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, label } : row) })} /></Field></RowShell>)}</div><Button onClick={() => update({ items: [...block.items, { id: createId(), label: 'New milestone', completed: false }] })}><Plus className="size-3.5" />Add milestone</Button></Accordion></>
}

const DetailsInspector = ({ block }: { block: DetailsBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<DetailsBlock>) => updateBlock(block.id, (current) => current.type === 'details' ? { ...current, ...patch } : current)
  return <><Accordion title="Section"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field></Accordion><Accordion title="Details items"><div className="space-y-2">{block.items.map((item) => <RowShell key={item.id} onRemove={() => update({ items: block.items.filter((row) => row.id !== item.id) })}><Field label="Summary"><Input value={item.summary} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, summary: event.target.value } : row) })} /></Field><Field label="Content"><RichText value={item.body} onChange={(body) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, body } : row) })} lists /></Field><label className="flex items-center gap-2 text-xs text-zinc-500"><input type="checkbox" checked={item.open} onChange={(event) => update({ items: block.items.map((row) => row.id === item.id ? { ...row, open: event.target.checked } : row) })} className="size-4 accent-white" />Open by default</label></RowShell>)}</div><Button onClick={() => update({ items: [...block.items, { id: createId(), summary: 'New question', body: 'Write the answer here.', open: false }] })}><Plus className="size-3.5" />Add item</Button></Accordion></>
}

const MarkdownInspector = ({ block }: { block: MarkdownBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<MarkdownBlock>) => updateBlock(block.id, (current) => current.type === 'markdown' ? { ...current, ...patch } : current)
  return <Accordion title="Custom Markdown"><label className="flex items-center justify-between rounded-md border border-zinc-900 px-3 py-2.5 text-xs text-zinc-400">Show section heading<input type="checkbox" checked={block.showHeading} onChange={(event) => update({ showHeading: event.target.checked })} className="size-4 accent-white" /></label>{block.showHeading && <Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field>}<Field label="Markdown"><Textarea className="min-h-64 font-mono text-xs" value={block.markdown} onChange={(event) => update({ markdown: event.target.value })} placeholder="Paste any GFM or GitHub-safe HTML here" spellCheck={false} /></Field></Accordion>
}

const LicenseInspector = ({ block }: { block: LicenseBlock }) => {
  const updateBlock = useGloammarkStore((state) => state.updateBlock)
  const update = (patch: Partial<LicenseBlock>) => updateBlock(block.id, (current) => current.type === 'license' ? { ...current, ...patch } : current)
  const setLink = (key: keyof AuthorLinks, value: string) => update({ links: { ...block.links, [key]: value } })
  return <><Accordion title="License"><Field label="Heading"><Input value={block.heading} onChange={(event) => update({ heading: event.target.value })} /></Field><Field label="License"><Select value={block.license} onChange={(event) => update({ license: event.target.value as LicenseBlock['license'] })}>{licenses.map((license) => <option key={license}>{license}</option>)}</Select></Field><Field label="Author"><Input value={block.authorName} onChange={(event) => update({ authorName: event.target.value })} /></Field></Accordion><Accordion title="Author links">{(Object.keys(block.links) as (keyof AuthorLinks)[]).map((key) => <Field key={key} label={key}><Input value={block.links[key]} onChange={(event) => setLink(key, event.target.value)} placeholder={key === 'website' ? 'example.com' : '@handle or URL'} /></Field>)}</Accordion></>
}

export const Inspector = () => {
  const blocks = useGloammarkStore((state) => state.blocks)
  const selectedBlockId = useGloammarkStore((state) => state.selectedBlockId)
  const block = blocks.find((item) => item.id === selectedBlockId)

  if (!block) return <div className="grid h-full place-items-center px-8 text-center"><div><div className="text-sm font-medium text-zinc-400">No block selected</div><div className="mt-1 text-xs leading-5 text-zinc-700">Add a block or choose one from the canvas to edit its properties.</div></div></div>

  let content: ReactNode
  if (block.type === 'hero') content = <HeroInspector block={block} />
  else if (block.type === 'toc') content = <TocInspector block={block} />
  else if (block.type === 'text') content = <TextInspector block={block} />
  else if (block.type === 'techStack') content = <TechInspector block={block} />
  else if (block.type === 'features') content = <FeaturesInspector block={block} />
  else if (block.type === 'gallery') content = <GalleryInspector block={block} />
  else if (block.type === 'quickStart') content = <QuickStartInspector block={block} />
  else if (block.type === 'config') content = <ConfigInspector block={block} />
  else if (block.type === 'requirements') content = <RequirementsInspector block={block} />
  else if (block.type === 'alert') content = <AlertInspector block={block} />
  else if (block.type === 'code') content = <CodeInspector block={block} />
  else if (block.type === 'resources') content = <ResourcesInspector block={block} />
  else if (block.type === 'contributing') content = <ContributingInspector block={block} />
  else if (block.type === 'roadmap') content = <RoadmapInspector block={block} />
  else if (block.type === 'details') content = <DetailsInspector block={block} />
  else if (block.type === 'markdown') content = <MarkdownInspector block={block} />
  else content = <LicenseInspector block={block} />

  return <div className="h-full min-h-0 overflow-y-auto">{content}</div>
}
