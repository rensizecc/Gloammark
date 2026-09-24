import { Sparkles } from 'lucide-react'
import gloammarkLogo from '../assets/gloammark.png'

export const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="grid size-8 place-items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
      <img src={gloammarkLogo} alt="" className="size-6 object-contain" />
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold tracking-[-0.02em] text-white">Gloammark</span>
      <Sparkles className="size-3 text-zinc-600" />
    </div>
  </div>
)
