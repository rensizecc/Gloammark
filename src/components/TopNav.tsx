import { AlertTriangle, Check, CheckCircle2, Clipboard, Download, Eraser, FilePlus2, FolderOpen, Github, Import, Redo2, Save, ShieldCheck, Trash2, Undo2, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { APP_VERSION } from '../lib/constants'
import { createBlock, createDefaultState, presets } from '../lib/defaults'
import { fetchGithubReadme, importMarkdown } from '../lib/importer'
import { deleteProject, listProjects, saveProject, type SavedProject } from '../lib/projects'
import { serializeMarkdown } from '../lib/serializer'
import { validateDocument } from '../lib/validator'
import { useGloammarkStore } from '../store/useGloammarkStore'
import type { DocumentState } from '../types/blocks'
import { Brand } from './Brand'
import { Button, Input, Select } from './Controls'

const currentProjectKey = 'gloammark-current-project-id'

const downloadBlob = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const Dialog = ({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-zinc-900 px-5 py-4">
        <div><h2 className="text-sm font-semibold text-white">{title}</h2>{subtitle && <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>}</div>
        <button onClick={onClose} className="grid size-8 place-items-center rounded-md text-zinc-600 transition hover:bg-zinc-900 hover:text-white"><X className="size-4" /></button>
      </header>
      <div className="max-h-[68vh] overflow-y-auto p-5">{children}</div>
    </section>
  </div>
)

const formatDate = (value: number) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(value)

export const TopNav = () => {
  const { title, blocks, past, future, setTitle, clearCanvas, applyDocument, selectBlock, undo, redo } = useGloammarkStore()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(true)
  const [dialog, setDialog] = useState<'projects' | 'import' | 'issues' | null>(null)
  const [githubInput, setGithubInput] = useState('')
  const [importMode, setImportMode] = useState<'structured' | 'exact'>('structured')
  const [githubBusy, setGithubBusy] = useState(false)
  const [githubError, setGithubError] = useState('')
  const [projects, setProjects] = useState<SavedProject[]>(() => listProjects())
  const [currentProjectId, setCurrentProjectId] = useState(() => localStorage.getItem(currentProjectKey) ?? '')
  const importRef = useRef<HTMLInputElement>(null)
  const markdown = useMemo(() => serializeMarkdown(blocks), [blocks])
  const issues = useMemo(() => validateDocument(title, blocks), [title, blocks])
  const errors = issues.filter((issue) => issue.severity === 'error').length

  useEffect(() => {
    setSaved(false)
    const timer = window.setTimeout(() => setSaved(true), 350)
    return () => window.clearTimeout(timer)
  }, [title, blocks])

  useEffect(() => {
    if (!currentProjectId) return
    const timer = window.setTimeout(() => {
      saveProject({ title, blocks }, currentProjectId)
      setProjects(listProjects())
    }, 700)
    return () => window.clearTimeout(timer)
  }, [title, blocks, currentProjectId])

  const refreshProjects = () => setProjects(listProjects())

  const saveToLibrary = () => {
    const project = saveProject({ title, blocks }, currentProjectId || undefined)
    setCurrentProjectId(project.id)
    localStorage.setItem(currentProjectKey, project.id)
    refreshProjects()
    setSaved(true)
  }

  const newDocument = () => {
    if (!window.confirm('Create a new document? Your current canvas is already auto-saved locally.')) return
    const next = createDefaultState()
    applyDocument(next)
    setCurrentProjectId('')
    localStorage.removeItem(currentProjectKey)
  }

  const openProject = (project: SavedProject) => {
    applyDocument(project.document)
    setCurrentProjectId(project.id)
    localStorage.setItem(currentProjectKey, project.id)
    setDialog(null)
  }

  const removeSavedProject = (project: SavedProject) => {
    if (!window.confirm(`Delete saved project “${project.name}”?`)) return
    deleteProject(project.id)
    if (currentProjectId === project.id) {
      setCurrentProjectId('')
      localStorage.removeItem(currentProjectKey)
    }
    refreshProjects()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      const key = event.key.toLowerCase()
      const target = event.target as HTMLElement | null
      const editing = target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (key === 's') {
        event.preventDefault()
        if (event.shiftKey) downloadBlob(markdown, title.trim().endsWith('.md') ? title.trim() : 'README.md', 'text/markdown;charset=utf-8')
        else saveToLibrary()
        return
      }
      if (key === 'o') {
        event.preventDefault()
        setDialog('projects')
        return
      }
      if (key === 'n') {
        event.preventDefault()
        newDocument()
        return
      }
      if (editing) return
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [blocks, currentProjectId, markdown, title, undo, redo])

  const copy = async () => {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(markdown)
    else {
      const textarea = document.createElement('textarea')
      textarea.value = markdown
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const exportMarkdown = () => downloadBlob(markdown, title.trim().endsWith('.md') ? title.trim() : 'README.md', 'text/markdown;charset=utf-8')
  const exportProject = () => downloadBlob(JSON.stringify({ title, blocks }, null, 2), `${title.replace(/\.(md|markdown)$/i, '').trim() || 'README'}.gloammark`, 'application/json;charset=utf-8')

  const markdownDocument = (text: string, filename: string): DocumentState => {
    if (importMode === 'structured') return importMarkdown(text, filename)
    const block = createBlock('markdown')
    if (block.type !== 'markdown') return importMarkdown(text, filename)
    block.heading = filename.replace(/\.(md|markdown)$/i, '') || 'Imported README'
    block.markdown = text.replace(/\r/g, '').trim()
    block.showHeading = false
    return { title: filename || 'README.md', blocks: [block] }
  }

  const importFile = async (file: File) => {
    const text = await file.text()
    if (file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.gloammark')) {
      try {
        const parsed = JSON.parse(text) as Partial<DocumentState>
        if (typeof parsed.title !== 'string' || !Array.isArray(parsed.blocks)) throw new Error('Invalid project')
        applyDocument({ title: parsed.title, blocks: parsed.blocks as DocumentState['blocks'] })
      } catch {
        window.alert('This JSON is not a valid Gloammark project.')
        return
      }
    } else applyDocument(markdownDocument(text, file.name || 'README.md'))
    setCurrentProjectId('')
    localStorage.removeItem(currentProjectKey)
    setDialog(null)
  }

  const importGithub = async () => {
    setGithubBusy(true)
    setGithubError('')
    try {
      const result = await fetchGithubReadme(githubInput)
      applyDocument(markdownDocument(result.markdown, result.filename))
      setCurrentProjectId('')
      localStorage.removeItem(currentProjectKey)
      setDialog(null)
      setGithubInput('')
    } catch (error) {
      setGithubError(error instanceof Error ? error.message : 'Could not import this repository.')
    } finally {
      setGithubBusy(false)
    }
  }

  const clear = () => {
    if (window.confirm('Clear every block from the canvas?')) clearCanvas()
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-900 bg-black px-4">
        <div className="shrink-0" title={`Gloammark ${APP_VERSION}`}><Brand /></div>
        <div className="h-5 w-px bg-zinc-900" />
        <div className="w-36 lg:w-48"><Input value={title} onChange={(event) => setTitle(event.target.value)} className="!border-transparent !bg-transparent px-2 text-xs font-medium hover:!border-zinc-800 focus:!border-zinc-700" /></div>
        <div className="hidden w-28 md:block">
          <Select defaultValue="" onChange={(event) => {
            const name = event.target.value as keyof typeof presets
            if (name) {
              applyDocument(presets[name]())
              setCurrentProjectId('')
              localStorage.removeItem(currentProjectKey)
            }
            event.currentTarget.value = ''
          }} className="text-xs">
            <option value="" disabled>Preset</option>
            {Object.keys(presets).map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          <button onClick={undo} disabled={!past.length} title="Undo · Ctrl+Z" className="grid size-8 place-items-center rounded-md text-zinc-600 transition hover:bg-zinc-900 hover:text-white disabled:pointer-events-none disabled:opacity-25"><Undo2 className="size-3.5" /></button>
          <button onClick={redo} disabled={!future.length} title="Redo · Ctrl+Y" className="grid size-8 place-items-center rounded-md text-zinc-600 transition hover:bg-zinc-900 hover:text-white disabled:pointer-events-none disabled:opacity-25"><Redo2 className="size-3.5" /></button>
          <div className="ml-1 flex items-center gap-1.5 text-[10px] text-zinc-700"><CheckCircle2 className="size-3" />{saved ? 'Auto-saved' : 'Saving…'}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input ref={importRef} type="file" accept=".md,.markdown,.json,.gloammark" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.currentTarget.value = '' }} />
          <Button onClick={newDocument} className="hidden 2xl:inline-flex" title="New · Ctrl+N"><FilePlus2 className="size-3.5" />New</Button>
          <Button onClick={() => { refreshProjects(); setDialog('projects') }} className="hidden xl:inline-flex" title="Open saved project · Ctrl+O"><FolderOpen className="size-3.5" />Open</Button>
          <Button onClick={() => setDialog('import')} className="hidden xl:inline-flex"><Import className="size-3.5" />Import</Button>
          <Button onClick={saveToLibrary} className="hidden 2xl:inline-flex" title="Save project · Ctrl+S"><Save className="size-3.5" />Save</Button>
          <Button onClick={() => setDialog('issues')} title="Validate README" className={errors ? 'border-zinc-500 text-white' : ''}>{issues.length ? <AlertTriangle className="size-3.5" /> : <ShieldCheck className="size-3.5" />}{issues.length ? issues.length : 'Ready'}</Button>
          <Button onClick={clear} className="hidden min-[1800px]:inline-flex"><Eraser className="size-3.5" />Clear</Button>
          <Button onClick={copy}>{copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}{copied ? 'Copied' : 'Copy Markdown'}</Button>
          <Button onClick={exportMarkdown} className="border-zinc-200 bg-white text-black hover:border-white hover:bg-zinc-200 hover:text-black" title="Export Markdown · Ctrl+Shift+S"><Download className="size-3.5" />Export .md</Button>
        </div>
      </header>

      {dialog === 'projects' && <Dialog title="Projects" subtitle="Local project library · Ctrl+S saves the current document here" onClose={() => setDialog(null)}>
        <div className="mb-4 flex gap-2">
          <Button onClick={saveToLibrary}><Save className="size-3.5" />Save current</Button>
          <Button onClick={exportProject}><Download className="size-3.5" />Export project file</Button>
        </div>
        <div className="space-y-2">
          {!projects.length && <div className="rounded-lg border border-dashed border-zinc-800 px-4 py-10 text-center text-xs text-zinc-600">No saved projects yet.</div>}
          {projects.map((project) => <div key={project.id} className={`flex items-center gap-3 rounded-lg border p-3 ${project.id === currentProjectId ? 'border-zinc-600 bg-zinc-950' : 'border-zinc-900 bg-black'}`}>
            <button onClick={() => openProject(project)} className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-medium text-zinc-200">{project.name}</div>
              <div className="mt-1 text-[11px] text-zinc-600">{project.document.blocks.length} blocks · {formatDate(project.updatedAt)}</div>
            </button>
            <button onClick={() => removeSavedProject(project)} title="Delete saved project" className="grid size-8 place-items-center rounded-md text-zinc-700 transition hover:bg-zinc-900 hover:text-white"><Trash2 className="size-3.5" /></button>
          </div>)}
        </div>
      </Dialog>}

      {dialog === 'import' && <Dialog title="Import README" subtitle="Existing Markdown is converted into editable Gloammark blocks where possible" onClose={() => setDialog(null)}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800 bg-black p-1">
            <button onClick={() => setImportMode('structured')} className={`rounded-md px-3 py-2 text-xs transition ${importMode === 'structured' ? 'bg-white text-black' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>Editable blocks</button>
            <button onClick={() => setImportMode('exact')} className={`rounded-md px-3 py-2 text-xs transition ${importMode === 'exact' ? 'bg-white text-black' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>Preserve exactly</button>
          </div>
          <p className="-mt-3 text-[11px] leading-5 text-zinc-700">{importMode === 'structured' ? 'Recognized sections become editable blocks. Ambiguous sections remain Custom Markdown.' : 'Keeps the original Markdown as one Custom Markdown block with no structural conversion.'}</p>
          <section className="rounded-lg border border-zinc-900 bg-black p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><Upload className="size-4" />Local file</div>
            <p className="mt-1 text-xs leading-5 text-zinc-600">Open README.md, Markdown, or a .gloammark project.</p>
            <Button onClick={() => importRef.current?.click()} className="mt-3">Choose file</Button>
          </section>
          <section className="rounded-lg border border-zinc-900 bg-black p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><Github className="size-4" />GitHub repository</div>
            <p className="mt-1 text-xs leading-5 text-zinc-600">Paste a public repository URL or owner/repo. Gloammark fetches its default README.</p>
            <div className="mt-3 flex gap-2"><Input value={githubInput} onChange={(event) => setGithubInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void importGithub() }} placeholder="owner/repository" /><Button onClick={() => void importGithub()} disabled={!githubInput.trim() || githubBusy}>{githubBusy ? 'Importing…' : 'Import'}</Button></div>
            {githubError && <p className="mt-2 text-xs text-zinc-400">{githubError}</p>}
          </section>
          <p className="text-[11px] leading-5 text-zinc-700">Unsupported or ambiguous Markdown is preserved as Custom Markdown instead of being discarded.</p>
        </div>
      </Dialog>}

      {dialog === 'issues' && <Dialog title="README validation" subtitle={issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'} found` : 'No structural issues detected'} onClose={() => setDialog(null)}>
        {!issues.length ? <div className="rounded-lg border border-zinc-900 bg-black px-4 py-10 text-center"><ShieldCheck className="mx-auto size-6 text-zinc-400" /><div className="mt-3 text-sm font-medium text-white">Ready to export</div><p className="mt-1 text-xs text-zinc-600">Gloammark did not find common README problems.</p></div> : <div className="space-y-2">{issues.map((issue) => <button key={issue.id} onClick={() => { if (issue.blockId) selectBlock(issue.blockId); setDialog(null) }} className="flex w-full items-start gap-3 rounded-lg border border-zinc-900 bg-black p-3 text-left transition hover:border-zinc-700"><span className={`mt-1 size-1.5 shrink-0 rounded-full ${issue.severity === 'error' ? 'bg-white' : 'bg-zinc-600'}`} /><div><div className="text-xs font-medium text-zinc-300">{issue.message}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">{issue.severity}</div></div></button>)}</div>}
      </Dialog>}
    </>
  )
}
