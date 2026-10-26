'use client'

export function Field({ label, value, onChange, type = 'text', dir, placeholder, required }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
        {label}
        {required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        dir={dir}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
      />
    </div>
  )
}

export function Area({ label, value, onChange, dir, rows = 3 }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</label>
      <textarea
        rows={rows}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
      />
    </div>
  )
}
