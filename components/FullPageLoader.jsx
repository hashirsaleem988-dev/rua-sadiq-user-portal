'use client'

import { Loader2 } from 'lucide-react'

export default function FullPageLoader({ message = 'Saving…' }) {
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
    </div>
  )
}
