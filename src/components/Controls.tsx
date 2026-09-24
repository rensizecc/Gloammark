import { Bold, Code2, Italic, Link2, List, ListOrdered, RemoveFormatting, Strikethrough } from 'lucide-react'
import { useLayoutEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const control = 'w-full rounded-md border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400'

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-2">
    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</span>
    {children}
  </div>
)

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`${control} h-9 ${props.className ?? ''}`} />
export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className={`${control} min-h-20 resize-y py-2.5 ${props.className ?? ''}`} />
export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`${control} h-9 appearance-none ${props.className ?? ''}`} />

export const Button = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`inline-flex h-8 items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-40 ${className}`} />
)

export const Segmented = <T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (value: T) => void }) => (
  <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-lg border border-zinc-800 bg-black p-1">
    {options.map((option) => (
      <button key={option} onClick={() => onChange(option)} className={`rounded-md px-2 py-1.5 text-xs transition ${value === option ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}>
        {option}
      </button>
    ))}
  </div>
)

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const renderInline = (value: string) => {
  let html = escapeHtml(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  return html
}

const markdownToEditorHtml = (value: string) => {
  const lines = value.replace(/\r/g, '').split('\n')
  const output: string[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*+]\s+/.test(lines[index] ?? '')) {
        items.push(`<li>${renderInline((lines[index] ?? '').replace(/^[-*+]\s+/, ''))}</li>`)
        index += 1
      }
      output.push(`<ul>${items.join('')}</ul>`)
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index] ?? '')) {
        items.push(`<li>${renderInline((lines[index] ?? '').replace(/^\d+\.\s+/, ''))}</li>`)
        index += 1
      }
      output.push(`<ol>${items.join('')}</ol>`)
      continue
    }
    output.push(line ? `<div>${renderInline(line)}</div>` : '<div><br></div>')
    index += 1
  }
  return output.join('')
}

const inlineChildrenToMarkdown = (node: Node): string => Array.from(node.childNodes).map((child) => nodeToMarkdown(child)).join('')

const nodeToMarkdown = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof HTMLElement)) return ''
  const tag = node.tagName.toLowerCase()
  const content = inlineChildrenToMarkdown(node)
  if (tag === 'br') return '\n'
  if (tag === 'strong' || tag === 'b') return `**${content}**`
  if (tag === 'em' || tag === 'i') return `*${content}*`
  if (tag === 's' || tag === 'strike' || tag === 'del') return `~~${content}~~`
  if (tag === 'code') return `\`${content.replace(/`/g, '\\`')}\``
  if (tag === 'a') return `[${content}](${node.getAttribute('href') ?? ''})`
  if (tag === 'ul') return Array.from(node.children).map((item) => `- ${inlineChildrenToMarkdown(item)}`).join('\n') + '\n'
  if (tag === 'ol') return Array.from(node.children).map((item, index) => `${index + 1}. ${inlineChildrenToMarkdown(item)}`).join('\n') + '\n'
  if (tag === 'li') return content
  if (tag === 'div' || tag === 'p') return `${content}\n`
  return content
}

const editorToMarkdown = (element: HTMLElement) => Array.from(element.childNodes)
  .map((node) => nodeToMarkdown(node))
  .join('')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/\n$/, '')

const ToolButton = ({ title, children, onClick }: { title: string; children: ReactNode; onClick: () => void }) => (
  <button type="button" title={title} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className="grid size-7 place-items-center rounded text-zinc-500 transition hover:bg-zinc-800 hover:text-white">
    {children}
  </button>
)

export const RichText = ({ value, onChange, placeholder = 'Write text…', lists = false }: { value: string; onChange: (value: string) => void; placeholder?: string; lists?: boolean }) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef(value)

  useLayoutEffect(() => {
    const editor = editorRef.current
    if (!editor || value === lastEmitted.current) return
    editor.innerHTML = markdownToEditorHtml(value)
    lastEmitted.current = value
  }, [value])

  useLayoutEffect(() => {
    const editor = editorRef.current
    if (!editor || editor.innerHTML) return
    editor.innerHTML = markdownToEditorHtml(value)
  }, [])

  const emit = () => {
    const editor = editorRef.current
    if (!editor) return
    const markdown = editorToMarkdown(editor)
    lastEmitted.current = markdown
    onChange(markdown)
  }

  const command = (name: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(name, false, commandValue)
    window.requestAnimationFrame(emit)
  }

  const code = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) return
    const range = selection.getRangeAt(0)
    const selected = range.toString()
    if (!selected) return
    command('insertHTML', `<code>${escapeHtml(selected)}</code>`)
  }

  const link = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) return
    const range = selection.getRangeAt(0).cloneRange()
    const url = window.prompt('Link URL', 'https://')
    if (!url?.trim()) return
    editor.focus()
    selection.removeAllRanges()
    selection.addRange(range)
    command('createLink', url.trim())
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800 bg-black transition focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400">
      <div className="flex min-h-9 flex-wrap items-center gap-0.5 border-b border-zinc-900 bg-zinc-950 px-1.5 py-1">
        <ToolButton title="Bold" onClick={() => command('bold')}><Bold className="size-3.5" /></ToolButton>
        <ToolButton title="Italic" onClick={() => command('italic')}><Italic className="size-3.5" /></ToolButton>
        <ToolButton title="Strikethrough" onClick={() => command('strikeThrough')}><Strikethrough className="size-3.5" /></ToolButton>
        <ToolButton title="Inline code" onClick={code}><Code2 className="size-3.5" /></ToolButton>
        <ToolButton title="Link" onClick={link}><Link2 className="size-3.5" /></ToolButton>
        {lists && <><div className="mx-1 h-4 w-px bg-zinc-800" /><ToolButton title="Bullet list" onClick={() => command('insertUnorderedList')}><List className="size-3.5" /></ToolButton><ToolButton title="Numbered list" onClick={() => command('insertOrderedList')}><ListOrdered className="size-3.5" /></ToolButton></>}
        <div className="mx-1 h-4 w-px bg-zinc-800" />
        <ToolButton title="Clear formatting" onClick={() => command('removeFormat')}><RemoveFormatting className="size-3.5" /></ToolButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={(event) => {
          event.preventDefault()
          document.execCommand('insertText', false, event.clipboardData.getData('text/plain'))
          window.requestAnimationFrame(emit)
        }}
        className="rich-editor min-h-20 px-3 py-2.5 text-sm leading-6 text-white outline-none"
      />
    </div>
  )
}
