import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBlock, createDefaultState } from '../lib/defaults'
import { createId } from '../lib/id'
import type { BlockType, DocumentState, ReadmeBlock, TechStackBlock } from '../types/blocks'

interface HistorySnapshot extends DocumentState {
  selectedBlockId: string | null
}

interface GloammarkStore extends DocumentState {
  selectedBlockId: string | null
  past: HistorySnapshot[]
  future: HistorySnapshot[]
  setTitle: (title: string) => void
  selectBlock: (id: string | null) => void
  addBlock: (type: BlockType) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  moveBlock: (id: string, direction: -1 | 1) => void
  reorderBlock: (sourceId: string, targetId: string) => void
  toggleBlock: (id: string) => void
  updateBlock: (id: string, updater: (block: ReadmeBlock) => ReadmeBlock) => void
  clearCanvas: () => void
  reset: () => void
  applyDocument: (document: DocumentState) => void
  undo: () => void
  redo: () => void
}

const snapshot = (state: GloammarkStore): HistorySnapshot => ({
  title: state.title,
  blocks: structuredClone(state.blocks),
  selectedBlockId: state.selectedBlockId
})

const history = (state: GloammarkStore) => [...state.past.slice(-79), snapshot(state)]

const normalizeTech = (block: TechStackBlock): TechStackBlock => ({
  ...block,
  customTechnologies: block.customTechnologies ?? [],
  skillTheme: block.skillTheme ?? 'dark',
  iconsPerLine: block.iconsPerLine ?? 12,
  badgeStyle: block.badgeStyle ?? 'flat-square',
  badgeColor: block.badgeColor ?? '18181b',
  badgeLogoColor: block.badgeLogoColor ?? 'ffffff'
})

const normalizeBlocks = (blocks: ReadmeBlock[]) => blocks.map((block) => {
  if (block.type === 'hero') {
    return {
      ...block,
      description: block.description ?? '',
      badgeSpacing: block.badgeSpacing ?? 'normal',
      badges: (block.badges ?? []).map((badge) => ({
        ...badge,
        color: badge.color ?? '',
        labelColor: badge.labelColor ?? '',
        logoColor: badge.logoColor ?? ''
      }))
    }
  }
  if (block.type === 'techStack') return normalizeTech(block)
  return block
}) as ReadmeBlock[]

const defaults = createDefaultState()

export const useGloammarkStore = create<GloammarkStore>()(
  persist(
    (set) => ({
      ...defaults,
      selectedBlockId: defaults.blocks[0]?.id ?? null,
      past: [],
      future: [],
      setTitle: (title) => set((state) => ({ title, past: history(state), future: [] })),
      selectBlock: (id) => set({ selectedBlockId: id }),
      addBlock: (type) => set((state) => {
        const block = createBlock(type)
        return { blocks: [...state.blocks, block], selectedBlockId: block.id, past: history(state), future: [] }
      }),
      removeBlock: (id) => set((state) => {
        const index = state.blocks.findIndex((block) => block.id === id)
        if (index < 0) return state
        const next = state.blocks.filter((block) => block.id !== id)
        const fallback = next[Math.min(index, Math.max(next.length - 1, 0))]?.id ?? null
        return { blocks: next, selectedBlockId: state.selectedBlockId === id ? fallback : state.selectedBlockId, past: history(state), future: [] }
      }),
      duplicateBlock: (id) => set((state) => {
        const index = state.blocks.findIndex((block) => block.id === id)
        if (index < 0) return state
        const source = state.blocks[index]
        if (!source) return state
        const copy = structuredClone(source) as ReadmeBlock
        copy.id = createId()
        const next = [...state.blocks]
        next.splice(index + 1, 0, copy)
        return { blocks: next, selectedBlockId: copy.id, past: history(state), future: [] }
      }),
      moveBlock: (id, direction) => set((state) => {
        const index = state.blocks.findIndex((block) => block.id === id)
        const target = index + direction
        if (index < 0 || target < 0 || target >= state.blocks.length) return state
        const next = [...state.blocks]
        const current = next[index]
        const swap = next[target]
        if (!current || !swap) return state
        next[index] = swap
        next[target] = current
        return { blocks: next, past: history(state), future: [] }
      }),
      reorderBlock: (sourceId, targetId) => set((state) => {
        const sourceIndex = state.blocks.findIndex((block) => block.id === sourceId)
        const targetIndex = state.blocks.findIndex((block) => block.id === targetId)
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return state
        const next = [...state.blocks]
        const [moved] = next.splice(sourceIndex, 1)
        if (!moved) return state
        next.splice(targetIndex, 0, moved)
        return { blocks: next, past: history(state), future: [] }
      }),
      toggleBlock: (id) => set((state) => ({
        blocks: state.blocks.map((block) => block.id === id ? { ...block, visible: !block.visible } as ReadmeBlock : block),
        past: history(state),
        future: []
      })),
      updateBlock: (id, updater) => set((state) => ({
        blocks: state.blocks.map((block) => block.id === id ? updater(block) : block),
        past: history(state),
        future: []
      })),
      clearCanvas: () => set((state) => ({ blocks: [], selectedBlockId: null, past: history(state), future: [] })),
      reset: () => set((state) => {
        const next = createDefaultState()
        return { ...next, selectedBlockId: next.blocks[0]?.id ?? null, past: history(state), future: [] }
      }),
      applyDocument: (document) => set((state) => {
        const blocks = normalizeBlocks(document.blocks)
        return { ...document, blocks, selectedBlockId: blocks[0]?.id ?? null, past: history(state), future: [] }
      }),
      undo: () => set((state) => {
        const previous = state.past[state.past.length - 1]
        if (!previous) return state
        return {
          title: previous.title,
          blocks: structuredClone(previous.blocks),
          selectedBlockId: previous.selectedBlockId,
          past: state.past.slice(0, -1),
          future: [snapshot(state), ...state.future].slice(0, 80)
        }
      }),
      redo: () => set((state) => {
        const next = state.future[0]
        if (!next) return state
        return {
          title: next.title,
          blocks: structuredClone(next.blocks),
          selectedBlockId: next.selectedBlockId,
          past: [...state.past, snapshot(state)].slice(-80),
          future: state.future.slice(1)
        }
      })
    }),
    {
      name: 'gloammark-document-v1',
      version: 4,
      migrate: (persisted) => {
        const state = persisted as Partial<GloammarkStore> | undefined
        const blocks = Array.isArray(state?.blocks) ? normalizeBlocks(state.blocks) : defaults.blocks
        const selected = state?.selectedBlockId && blocks.some((block) => block.id === state.selectedBlockId) ? state.selectedBlockId : blocks[0]?.id ?? null
        return { title: state?.title ?? 'README.md', blocks, selectedBlockId: selected }
      },
      partialize: (state) => ({ title: state.title, blocks: state.blocks, selectedBlockId: state.selectedBlockId })
    }
  )
)
