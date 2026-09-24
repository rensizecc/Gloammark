import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { blockLabels } from '../lib/constants'
import { useGloammarkStore } from '../store/useGloammarkStore'
import type { BlockType } from '../types/blocks'
import { Button } from './Controls'

const blockTypes = Object.keys(blockLabels) as BlockType[]

export const BlockCanvas = () => {
  const { blocks, selectedBlockId, selectBlock, moveBlock, reorderBlock, duplicateBlock, removeBlock, toggleBlock, addBlock, reset } = useGloammarkStore()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
        <div>
          <div className="text-xs font-semibold text-zinc-200">Canvas</div>
          <div className="mt-0.5 text-[11px] text-zinc-600">{blocks.length} blocks · drag to reorder</div>
        </div>
        <Button onClick={reset} title="Reset document"><RotateCcw className="size-3.5" />Reset</Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {blocks.map((block, index) => {
            const selected = selectedBlockId === block.id
            const over = overId === block.id && draggingId !== block.id
            return (
              <div
                key={block.id}
                onDragOver={(event) => {
                  event.preventDefault()
                  if (draggingId && draggingId !== block.id) setOverId(block.id)
                }}
                onDragLeave={() => setOverId((current) => current === block.id ? null : current)}
                onDrop={(event) => {
                  event.preventDefault()
                  const sourceId = event.dataTransfer.getData('text/gloammark-block') || draggingId
                  if (sourceId && sourceId !== block.id) reorderBlock(sourceId, block.id)
                  setDraggingId(null)
                  setOverId(null)
                }}
                className={`group rounded-lg border transition ${over ? 'border-zinc-400 bg-zinc-950' : selected ? 'border-zinc-600 bg-zinc-950' : 'border-zinc-900 bg-black hover:border-zinc-800'} ${draggingId === block.id ? 'opacity-40' : ''}`}
              >
                <div className="flex items-stretch">
                  <div
                    draggable
                    title="Drag to reorder"
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/gloammark-block', block.id)
                      setDraggingId(block.id)
                    }}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setOverId(null)
                    }}
                    className="grid w-8 shrink-0 cursor-grab place-items-center text-zinc-700 hover:text-zinc-300 active:cursor-grabbing"
                  >
                    <GripVertical className="size-3.5" />
                  </div>
                  <button className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-3 text-left" onClick={() => selectBlock(block.id)}>
                    <div className={`size-1.5 rounded-full ${block.visible ? 'bg-white' : 'bg-zinc-700'}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-xs font-medium ${selected ? 'text-white' : 'text-zinc-400'}`}>{blockLabels[block.type]}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-700">{String(index + 1).padStart(2, '0')} · {block.type}</div>
                    </div>
                  </button>
                </div>
                <div className={`grid grid-cols-5 border-t border-zinc-900 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
                  <button className="grid h-8 place-items-center text-zinc-600 hover:text-white disabled:opacity-20" onClick={() => moveBlock(block.id, -1)} disabled={index === 0}><ChevronUp className="size-3.5" /></button>
                  <button className="grid h-8 place-items-center text-zinc-600 hover:text-white disabled:opacity-20" onClick={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1}><ChevronDown className="size-3.5" /></button>
                  <button className="grid h-8 place-items-center text-zinc-600 hover:text-white" onClick={() => toggleBlock(block.id)}>{block.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}</button>
                  <button className="grid h-8 place-items-center text-zinc-600 hover:text-white" onClick={() => duplicateBlock(block.id)}><Copy className="size-3.5" /></button>
                  <button className="grid h-8 place-items-center text-zinc-600 hover:text-white" onClick={() => removeBlock(block.id)}><Trash2 className="size-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 rounded-lg border border-dashed border-zinc-800 p-2">
          <div className="grid gap-1">
            {blockTypes.map((type) => (
              <button key={type} onClick={() => addBlock(type)} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-500 transition hover:bg-zinc-950 hover:text-zinc-200">
                <Plus className="size-3.5" />{blockLabels[type]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
