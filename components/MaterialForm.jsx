'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, Loader2, Trash2, Languages } from 'lucide-react'
import { createMaterial, updateMaterial, getImageUrl, getMaterials } from '@/lib/api'
import { translateEnToAr } from '@/lib/translate'
import { Field } from '@/components/FormFields'
import FullPageLoader from '@/components/FullPageLoader'
import Toast from '@/components/Toast'
import DashboardShell from '@/components/DashboardShell'

const GROUPS = [
  { value: 'sofa', label: 'Sofa fabrics' },
  { value: 'curtain', label: 'Curtain fabrics' },
  { value: 'wood', label: 'Wood' },
  { value: 'foam', label: 'Foam' },
]

export default function MaterialForm({ materialId }) {
  const router = useRouter()
  const isEdit = !!materialId
  const [form, setForm] = useState({
    key: '',
    group: 'sofa',
    nameEn: '',
    nameAr: '',
    specEn: '',
    specAr: '',
    sortOrder: 0,
  })
  const [existingImageId, setExistingImageId] = useState(null)
  const [newFile, setNewFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    getMaterials()
      .then((list) => {
        const material = list.find((m) => String(m._id) === String(materialId))
        if (!material) throw new Error('Material not found')
        setForm({
          key: material.key || '',
          group: material.group || 'sofa',
          nameEn: material.nameEn || '',
          nameAr: material.nameAr || '',
          specEn: material.specEn || '',
          specAr: material.specAr || '',
          sortOrder: material.sortOrder ?? 0,
        })
        setExistingImageId(material?.imageId ? String(material.imageId) : null)
      })
      .catch((e) => setError(e.message || 'Failed to load material'))
      .finally(() => setLoading(false))
  }, [materialId, isEdit])

  useEffect(() => {
    if (!newFile) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(newFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [newFile])

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const onNameEn = (v) => {
    setField('nameEn', v)
    if (!isEdit && !form.key) {
      const slug = v
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .slice(0, 20)
      if (slug) setField('key', `${(form.group || 'm')[0]}_${slug}`)
    }
  }

  const autoTranslate = async () => {
    setTranslating(true)
    setError('')
    try {
      const [nameAr, specAr] = await Promise.all([
        translateEnToAr(form.nameEn),
        translateEnToAr(form.specEn),
      ])
      setForm((f) => ({
        ...f,
        nameAr: nameAr || f.nameAr,
        specAr: specAr || f.specAr,
      }))
    } catch (e) {
      setError(e.message)
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.nameEn.trim() || !form.key.trim() || !form.group) {
      setError('Name, key and group are required')
      return
    }
    setSaving(true)
    try {
      let nameAr = form.nameAr
      let specAr = form.specAr
      if (!nameAr.trim()) nameAr = await translateEnToAr(form.nameEn)
      if (!specAr.trim() && form.specEn.trim()) specAr = await translateEnToAr(form.specEn)
      const fd = new FormData()
      fd.append('key', form.key.trim())
      fd.append('group', form.group)
      fd.append('nameEn', form.nameEn)
      fd.append('nameAr', nameAr || form.nameEn)
      fd.append('specEn', form.specEn)
      fd.append('specAr', specAr || form.specEn)
      fd.append('sortOrder', String(form.sortOrder ?? 0))
      if (newFile) fd.append('image', newFile)
      if (isEdit) {
        await updateMaterial(materialId, fd)
        setToast({ message: 'Material updated successfully!', type: 'success' })
      } else {
        await createMaterial(fd)
        setToast({ message: 'Material created successfully!', type: 'success' })
      }
      setTimeout(() => router.push('/dashboard?tab=materials'), 1200)
    } catch (err) {
      setError(err.message || 'Save failed')
      setToast({ message: err.message || 'Save failed', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  return (
    <DashboardShell
      active="materials"
      title={isEdit ? 'Edit material' : 'Create material'}
      subtitle={isEdit ? 'Update the details below' : 'Add a new fabric, wood or foam option'}
    >
      {saving && <FullPageLoader message={isEdit ? 'Updating material…' : 'Creating material…'} />}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 animate-fade-in-up">
        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <p className="text-[11px] text-slate-400 bg-slate-900 border border-white/5 rounded-lg px-3 py-2">
          Type in <strong className="text-amber-400">English only</strong>. Arabic auto-fills on save.
        </p>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Group *</label>
          <select
            value={form.group}
            onChange={(e) => setField('group', e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Name (English)" value={form.nameEn} onChange={onNameEn} required />
        <Field label="Stable key (e.g. s9)" value={form.key} onChange={(v) => setField('key', v)} required />
        <Field label="Spec (English)" value={form.specEn} onChange={(v) => setField('specEn', v)} />
        <Field
          label="Sort order"
          value={String(form.sortOrder)}
          onChange={(v) => setField('sortOrder', Number(v) || 0)}
          type="number"
        />
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Arabic (auto)
            </span>
            <button
              type="button"
              onClick={autoTranslate}
              disabled={translating || !form.nameEn.trim()}
              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-400 disabled:opacity-50"
            >
              {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
              Translate
            </button>
          </div>
          <p className="text-sm text-slate-300" dir="rtl">
            {form.nameAr || <span className="text-slate-600">— auto on save —</span>}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Swatch image
          </label>
          <div className="flex gap-2">
            {existingImageId && !newFile && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                <img src={getImageUrl(existingImageId)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingImageId(null)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            )}
            {preview && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-500/40">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewFile(null)}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/70"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            )}
            {!newFile && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 hover:text-amber-400"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[9px]">Upload</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setNewFile(e.target.files[0])
              e.target.value = ''
            }}
          />
        </div>
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.push('/dashboard?tab=materials')}
            className="flex-1 h-11 rounded-xl border border-white/15 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </DashboardShell>
  )
}
