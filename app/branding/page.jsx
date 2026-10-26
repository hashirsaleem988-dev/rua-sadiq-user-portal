'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Upload, RotateCcw, Save, Loader2 } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useBranding, DEFAULT_BRANDING } from '@/context/BrandingContext'
import FullPageLoader from '@/components/FullPageLoader'

const BG_PRESETS = [
  { label: 'Midnight', value: '#020617' },
  { label: 'Deep navy', value: '#0a1628' },
  { label: 'Charcoal', value: '#111827' },
  { label: 'Forest', value: '#052e1c' },
  { label: 'Wine', value: '#1a0a12' },
  { label: 'Indigo', value: '#1e1b4b' },
  { label: 'Slate', value: '#0f172a' },
  { label: 'Soft dark', value: '#1c1917' },
]

export default function BrandingPage() {
  const { isAuthenticated, checking } = useAdminAuth()
  const {
    brandName, logoUrl, primaryColor, secondaryColor, accentColor, backgroundColor,
    loading, save, reset,
  } = useBranding()
  const router = useRouter()

  const [form, setForm] = useState({
    brandName: DEFAULT_BRANDING.brandName,
    logoUrl: null,
    primaryColor: DEFAULT_BRANDING.primaryColor,
    secondaryColor: DEFAULT_BRANDING.secondaryColor,
    accentColor: DEFAULT_BRANDING.accentColor,
    backgroundColor: DEFAULT_BRANDING.backgroundColor,
  })
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!checking && !isAuthenticated) router.replace('/login')
  }, [checking, isAuthenticated, router])

  useEffect(() => {
    if (!loading) {
      setForm({
        brandName: brandName || DEFAULT_BRANDING.brandName,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || DEFAULT_BRANDING.primaryColor,
        secondaryColor: secondaryColor || DEFAULT_BRANDING.secondaryColor,
        accentColor: accentColor || DEFAULT_BRANDING.accentColor,
        backgroundColor: backgroundColor || DEFAULT_BRANDING.backgroundColor,
      })
    }
  }, [loading, brandName, logoUrl, primaryColor, secondaryColor, accentColor, backgroundColor])


  // Live-apply form colors so BG/theme change is visible before Save
  useEffect(() => {
    if (typeof document === 'undefined') return
    const bg = form.backgroundColor || DEFAULT_BRANDING.backgroundColor
    const primary = form.primaryColor || DEFAULT_BRANDING.primaryColor
    const secondary = form.secondaryColor || DEFAULT_BRANDING.secondaryColor
    const accent = form.accentColor || DEFAULT_BRANDING.accentColor
    document.documentElement.style.setProperty('--brand-bg', bg)
    document.documentElement.style.backgroundColor = bg
    document.body.style.backgroundColor = bg
    document.body.style.background = bg
    // Update injected stylesheet page-bg rules if present
    const styleEl = document.getElementById('portal-user-theme')
    if (styleEl && styleEl.textContent) {
      // Re-apply full theme via CSS variables already set; also patch classes
      document.querySelectorAll('.portal-page-bg').forEach((n) => {
        n.style.backgroundColor = bg
        n.style.background = bg
      })
      document.querySelectorAll('.portal-header-bg').forEach((n) => {
        n.style.backgroundColor = bg + 'e6'
      })
      document.querySelectorAll('.portal-sidebar-bg').forEach((n) => {
        n.style.backgroundColor = secondary + 'f5'
      })
    }
  }, [form.backgroundColor, form.primaryColor, form.secondaryColor, form.accentColor])

  const showMsg = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return showMsg('error', 'Select an image file')
    if (file.size > 2 * 1024 * 1024) return showMsg('error', 'Max logo size is 2MB')
    const reader = new FileReader()
    reader.onload = () => setForm((p) => ({ ...p, logoUrl: reader.result }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.brandName.trim()) return showMsg('error', 'Brand name is required')
    setSaving(true)
    try {
      await save({
        brandName: form.brandName.trim(),
        logoUrl: form.logoUrl,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
      })
      showMsg('success', 'Branding saved. Your portal theme is updated.')
    } catch (err) {
      showMsg('error', err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset branding to defaults?')) return
    setResetting(true)
    try {
      const next = await reset()
      setForm({
        brandName: next.brandName,
        logoUrl: next.logoUrl,
        primaryColor: next.primaryColor,
        secondaryColor: next.secondaryColor,
        accentColor: next.accentColor,
        backgroundColor: next.backgroundColor,
      })
      showMsg('success', 'Reset to default theme.')
    } catch (err) {
      showMsg('error', err.message || 'Reset failed')
    } finally {
      setResetting(false)
    }
  }

  if (checking || !isAuthenticated) return <FullPageLoader />

  return (
    <DashboardShell
      active="branding"
      title="Change Branding"
      subtitle="Customize logo, brand name, colors and background for your portal"
    >
      {message && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up">
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Brand Name
              </label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center bg-slate-950/50 overflow-hidden shrink-0">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-500">No logo</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    Upload logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                  {form.logoUrl && (
                    <button
                      type="button"
                      className="text-sm text-red-400 text-left hover:text-red-300"
                      onClick={() => setForm((p) => ({ ...p, logoUrl: null }))}
                    >
                      Remove logo
                    </button>
                  )}
                  <p className="text-[11px] text-slate-500">PNG, JPG or SVG · max 2MB</p>
                </div>
              </div>
            </div>

            {/* Background theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Background theme
              </label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={form.backgroundColor}
                  onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={form.backgroundColor}
                  onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BG_PRESETS.map((p) => {
                  const active = form.backgroundColor.toLowerCase() === p.value.toLowerCase()
                  return (
                    <button
                      key={p.value}
                      type="button"
                      title={p.label}
                      onClick={() => setForm({ ...form, backgroundColor: p.value })}
                      className={`group relative h-10 rounded-lg border-2 transition-all ${
                        active ? 'border-amber-400 scale-105 ring-2 ring-amber-400/30' : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: p.value }}
                    >
                      <span className="sr-only">{p.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Applies to the main portal background. Pick a preset or a custom color.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['primaryColor', 'Primary'],
                ['secondaryColor', 'Secondary'],
                ['accentColor', 'Accent'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold portal-btn-primary bg-amber-500 text-slate-950 hover:brightness-110 disabled:opacity-60 transition"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save branding'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-60 transition"
              >
                {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {resetting ? 'Resetting...' : 'Reset to default'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-amber-400" />
              <h3 className="font-semibold text-sm">Live preview</h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <div
                className="px-4 py-3 flex items-center gap-3 text-white"
                style={{ backgroundColor: form.secondaryColor }}
              >
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="" className="w-9 h-9 rounded-lg object-contain bg-white/10" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: `linear-gradient(to bottom right, ${form.accentColor}, ${form.primaryColor})`,
                      color: form.secondaryColor,
                    }}
                  >
                    {(form.brandName || 'R').charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold leading-tight">{form.brandName}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-60">Portal</p>
                </div>
              </div>
              <div className="p-4 space-y-2" style={{ backgroundColor: form.backgroundColor }}>
                <div
                  className="px-3 py-2 rounded-lg text-xs font-semibold border"
                  style={{
                    color: form.accentColor,
                    backgroundColor: `${form.primaryColor}1a`,
                    borderColor: `${form.primaryColor}33`,
                  }}
                >
                  Active nav item
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: form.primaryColor, color: form.secondaryColor }}
                >
                  Primary action
                </button>
                <p className="text-[10px] text-white/40 pt-1">Page background preview</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Theme is stored for your account and applied every time you log in.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
