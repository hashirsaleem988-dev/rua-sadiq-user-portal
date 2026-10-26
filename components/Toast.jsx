'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  if (!message) return null

  const isSuccess = type === 'success'
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
          isSuccess
            ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100'
            : 'bg-red-950/95 border-red-500/40 text-red-100'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
        )}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
          <X className="h-4 w-4 opacity-70" />
        </button>
      </div>
    </div>
  )
}
