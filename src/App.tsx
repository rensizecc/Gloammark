import { useEffect } from 'react'
import { BlockCanvas } from './components/BlockCanvas'
import { Inspector } from './components/Inspector'
import { PreviewPane } from './components/PreviewPane'
import { TopNav } from './components/TopNav'
import { importMarkdown } from './lib/importer'
import { useGloammarkStore } from './store/useGloammarkStore'
import type { DocumentState } from './types/blocks'

export default function App() {
  const applyDocument = useGloammarkStore((state) => state.applyDocument)

  useEffect(() => window.gloammarkDesktop?.onOpenFile(({ filename, content }) => {
    if (filename.toLowerCase().endsWith('.json') || filename.toLowerCase().endsWith('.gloammark')) {
      try {
        const parsed = JSON.parse(content) as Partial<DocumentState>
        if (typeof parsed.title === 'string' && Array.isArray(parsed.blocks)) applyDocument({ title: parsed.title, blocks: parsed.blocks as DocumentState['blocks'] })
        else window.alert('This JSON is not a valid Gloammark project.')
      } catch {
        window.alert('This JSON is not a valid Gloammark project.')
      }
    } else applyDocument(importMarkdown(content, filename))
  }), [applyDocument])

  return (
    <main className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-black text-zinc-100">
      <TopNav />
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[640px_minmax(0,1fr)]">
        <aside className="grid min-h-0 grid-cols-[236px_minmax(0,1fr)] border-r border-zinc-900 bg-[#09090b]">
          <div className="min-h-0 border-r border-zinc-900"><BlockCanvas /></div>
          <div className="min-h-0"><Inspector /></div>
        </aside>
        <div className="min-h-0"><PreviewPane /></div>
      </div>
    </main>
  )
}
