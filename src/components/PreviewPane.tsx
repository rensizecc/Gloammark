import { Code2, Eye } from 'lucide-react'
import { useMemo, useState, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { serializeMarkdown } from '../lib/serializer'
import { useGloammarkStore } from '../store/useGloammarkStore'

type PreviewMode = 'preview' | 'raw'

const renderLine = (line: string) => {
  if (line.startsWith('```')) return <><span className="text-zinc-300">{line.slice(0, 3)}</span><span className="text-zinc-500">{line.slice(3)}</span></>
  if (/^#{1,6}\s/.test(line)) return <span className="font-semibold text-white">{line}</span>
  if (/^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line)) return <><span className="text-zinc-400">{line.match(/^\s*(?:[-*+]|\d+\.)/)?.[0]}</span><span>{line.replace(/^\s*(?:[-*+]|\d+\.)\s?/, ' ')}</span></>
  if (/^>\s/.test(line)) return <span className="text-zinc-500">{line}</span>
  if (/^\|/.test(line)) return <span className="text-zinc-300">{line}</span>
  if (/^<\/?[a-z]/i.test(line)) return <span className="text-zinc-400">{line}</span>
  return <>{line}</>
}

const RawView = ({ markdown }: { markdown: string }) => {
  const lines = markdown.replace(/\n$/, '').split('\n')
  return (
    <div className="min-w-max py-4 font-mono text-[12px] leading-6 text-zinc-400">
      {lines.map((line, index) => (
        <div key={`${index}-${line}`} className="grid grid-cols-[52px_1fr] px-4 hover:bg-zinc-950/70">
          <span className="select-none pr-4 text-right text-zinc-800">{index + 1}</span>
          <code className="whitespace-pre pr-8">{renderLine(line)}</code>
        </div>
      ))}
    </div>
  )
}

const nodeText = (children: ReactNode): string => {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(nodeText).join('')
  if (children && typeof children === 'object' && 'props' in children) return nodeText((children as { props?: { children?: ReactNode } }).props?.children)
  return ''
}

const anchor = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')

export const PreviewPane = () => {
  const blocks = useGloammarkStore((state) => state.blocks)
  const [mode, setMode] = useState<PreviewMode>('preview')
  const markdown = useMemo(() => serializeMarkdown(blocks), [blocks])
  const components = useMemo(() => ({
    a: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props} onClick={(event) => {
      if (href?.startsWith('#')) return
      event.preventDefault()
      if (href) window.open(href, '_blank', 'noopener,noreferrer')
    }}>{children}</a>,
    h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h1 id={anchor(nodeText(children))} {...props}>{children}</h1>,
    h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h2 id={anchor(nodeText(children))} {...props}>{children}</h2>,
    h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h3 id={anchor(nodeText(children))} {...props}>{children}</h3>
  }), [])

  return (
    <section className="flex h-full min-h-0 flex-col bg-black">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-900 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">Output</span>
          <span className="rounded border border-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-700">GFM</span>
        </div>
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <button onClick={() => setMode('preview')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition ${mode === 'preview' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-zinc-300'}`}><Eye className="size-3" />Rendered</button>
          <button onClick={() => setMode('raw')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition ${mode === 'raw' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:text-zinc-300'}`}><Code2 className="size-3" />Raw</button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        {mode === 'preview' ? (
          <div className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-12">
            <div className="rounded-xl border border-zinc-900 bg-[#0d1117] p-6 shadow-panel sm:p-9">
              <article className="markdown-body !max-w-none !bg-transparent">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>{markdown}</ReactMarkdown>
              </article>
            </div>
          </div>
        ) : <RawView markdown={markdown} />}
      </div>
    </section>
  )
}
