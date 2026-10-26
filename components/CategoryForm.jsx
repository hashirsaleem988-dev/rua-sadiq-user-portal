'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, Loader2, Trash2, Languages } from 'lucide-react'
import { createCategory, updateCategory, getImageUrl, getCategories } from '@/lib/api'
import { translateEnToAr } from '@/lib/translate'
import { Field } from '@/components/FormFields'
import FullPageLoader from '@/components/FullPageLoader'
import Toast from '@/components/Toast'
import DashboardShell from '@/components/DashboardShell'

export default function CategoryForm({ categoryId }) {
  const router = useRouter()
  const isEdit = !!categoryId
  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    taglineEn: '',
    taglineAr: '',
    filter: '',
    aspectRatio: 'standard',
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
    getCategories()
      .then((list) => {
        const category = list.find((c) => String(c._id) === String(categoryId))
        if (!category) throw new Error('Category not found')
        setForm({
          nameEn: category.nameEn || '',
          nameAr: category.nameAr || '',
          taglineEn: category.taglineEn || '',
          taglineAr: category.taglineAr || '',
          filter: category.filter || '',
          aspectRatio: category.aspectRatio || 'standard',
        })
        setExistingImageId(category?.imageId ? String(category.imageId) : null)
      })
      .catch((e) => setError(e.message || 'Failed to load category'))
      .finally(() => setLoading(false))
  }, [categoryId, isEdit])

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
    if (!isEdit) setField('filter', v.trim())
  }

  const autoTranslate = async () => {
    setTranslating(true)
    setError('')
    try {
      const [nameAr, taglineAr] = await Promise.all([
        translateEnToAr(form.nameEn),
        translateEnToAr(form.taglineEn),
      ])
      setForm((f) => ({
        ...f,
        nameAr: nameAr || f.nameAr,
        taglineAr: taglineAr || f.taglineAr,
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
    if (!form.nameEn.trim() || !form.filter.trim()) {
      setError('Name and filter key are required')
      return
    }
    setSaving(true)
    try {
      let nameAr = form.nameAr
      let taglineAr = form.taglineAr
      if (!nameAr.trim()) nameAr = await translateEnToAr(form.nameEn)
      if (!taglineAr.trim() && form.taglineEn.trim()) taglineAr = await translateEnToAr(form.taglineEn)
      const fd = new FormData()
      fd.append('nameEn', form.nameEn)
      fd.append('nameAr', nameAr || form.nameEn)
      fd.append('taglineEn', form.taglineEn)
      fd.append('taglineAr', taglineAr || form.taglineEn)
      fd.append('filter', form.filter)
      fd.append('aspectRatio', form.aspectRatio)
      if (newFile) fd.append('image', newFile)
      if (isEdit) {
        await updateCategory(categoryId, fd)
        setToast({ message: 'Category updated successfully!', type: 'success' })
      } else {
        await createCategory(fd)
        setToast({ message: 'Category created successfully!', type: 'success' })
      }
      setTimeout(() => router.push('/dashboard?tab=categories'), 1200)
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
      active="categories"
      title={isEdit ? 'Edit category' : 'Create category'}
      subtitle={isEdit ? 'Update the details below' : 'Add a new catalogue category'}
    >
      {saving && <FullPageLoader message={isEdit ? 'Updating category…' : 'Creating category…'} />}
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
        <Field label="Name (English)" value={form.nameEn} onChange={onNameEn} required />
        <Field label="Tagline (English)" value={form.taglineEn} onChange={(v) => setField('taglineEn', v)} />
        <Field
          label="Filter key (matches product.category)"
          value={form.filter}
          onChange={(v) => setField('filter', v)}
          required
        />
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Aspect ratio
          </label>
          <select
            value={form.aspectRatio}
            onChange={(e) => setField('aspectRatio', e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="standard">Standard</option>
            <option value="large-bed">Large / Bed</option>
          </select>
        </div>
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
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Image</label>
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
            onClick={() => router.push('/dashboard?tab=categories')}
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
