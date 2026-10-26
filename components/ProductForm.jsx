'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Languages,
  X,
} from 'lucide-react'
import { translateEnToAr } from '@/lib/translate'
import {
  createProduct,
  updateProduct,
  getImageUrl,
  getCategories,
  getProductById,
} from '@/lib/api'
import { Field, Area } from '@/components/FormFields'
import FullPageLoader from '@/components/FullPageLoader'
import Toast from '@/components/Toast'
import DashboardShell from '@/components/DashboardShell'

const EMPTY = {
  titleEn: '',
  titleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  price: '',
  category: '',
  categoryAr: '',
  materialsEn: '',
  materialsAr: '',
  dimensionsEn: '',
  dimensionsAr: '',
  isNewArrival: false,
  isFeatured: false,
}

export default function ProductForm({ productId }) {
  const router = useRouter()
  const isEdit = !!productId
  const [form, setForm] = useState({ ...EMPTY })
  const [existingIds, setExistingIds] = useState([])
  const [removeIds, setRemoveIds] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    getProductById(productId)
      .then((product) => {
        setForm({
          titleEn: product.titleEn || '',
          titleAr: product.titleAr || '',
          descriptionEn: product.descriptionEn || '',
          descriptionAr: product.descriptionAr || '',
          price: product.price ?? '',
          category: product.category || '',
          categoryAr: product.categoryAr || '',
          materialsEn: product.materialsEn || '',
          materialsAr: product.materialsAr || '',
          dimensionsEn: product.dimensionsEn || '',
          dimensionsAr: product.dimensionsAr || '',
          isNewArrival: !!product.isNewArrival,
          isFeatured: !!product.isFeatured,
        })
        setExistingIds((product?.imageIds || []).map(String))
      })
      .catch((e) => setError(e.message || 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [productId, isEdit])

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const onFiles = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = 6 - (existingIds.length - removeIds.length) - newFiles.length
    setNewFiles((prev) => [...prev, ...files.slice(0, Math.max(0, remaining))])
    e.target.value = ''
  }

  const removeNewFile = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx))
  const markRemoveExisting = (id) =>
    setRemoveIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  const unmarkRemove = (id) => setRemoveIds((prev) => prev.filter((x) => x !== id))

  const autoTranslate = async () => {
    setTranslating(true)
    setError('')
    try {
      const [titleAr, descriptionAr, materialsAr, dimensionsAr] = await Promise.all([
        translateEnToAr(form.titleEn),
        translateEnToAr(form.descriptionEn),
        translateEnToAr(form.materialsEn),
        translateEnToAr(form.dimensionsEn),
      ])
      let categoryAr = form.categoryAr
      if (!categoryAr.trim()) {
        const cat = categories.find((c) => c.filter === form.category)
        categoryAr = cat?.nameAr || (form.category ? await translateEnToAr(form.category) : '')
      }
      setForm((prev) => ({
        ...prev,
        titleAr: titleAr || prev.titleAr,
        descriptionAr: descriptionAr || prev.descriptionAr,
        materialsAr: materialsAr || prev.materialsAr,
        dimensionsAr: dimensionsAr || prev.dimensionsAr,
        categoryAr: categoryAr || prev.categoryAr,
      }))
    } catch (err) {
      setError(err.message || 'Translation failed')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.titleEn.trim() || !form.category.trim()) {
      setError('Title (English) and category are required')
      return
    }
    if (form.price === '' || Number.isNaN(Number(form.price))) {
      setError('Valid price is required')
      return
    }

    setSaving(true)
    try {
      let titleAr = form.titleAr
      let descriptionAr = form.descriptionAr
      let materialsAr = form.materialsAr
      let dimensionsAr = form.dimensionsAr
      let categoryAr = form.categoryAr
      if (!titleAr.trim() && form.titleEn.trim()) titleAr = await translateEnToAr(form.titleEn)
      if (!descriptionAr.trim() && form.descriptionEn.trim())
        descriptionAr = await translateEnToAr(form.descriptionEn)
      if (!materialsAr.trim() && form.materialsEn.trim())
        materialsAr = await translateEnToAr(form.materialsEn)
      if (!dimensionsAr.trim() && form.dimensionsEn.trim())
        dimensionsAr = await translateEnToAr(form.dimensionsEn)
      if (!categoryAr.trim()) {
        const cat = categories.find((c) => c.filter === form.category)
        categoryAr = cat?.nameAr || form.category
      }
      const payload = {
        ...form,
        titleAr: titleAr || form.titleEn,
        descriptionAr: descriptionAr || form.descriptionEn,
        materialsAr: materialsAr || form.materialsEn,
        dimensionsAr: dimensionsAr || form.dimensionsEn,
        categoryAr: categoryAr || form.category,
      }
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => {
        if (typeof v === 'boolean') fd.append(k, v ? 'true' : 'false')
        else fd.append(k, v ?? '')
      })
      if (isEdit && removeIds.length) {
        fd.append('removeImageIds', JSON.stringify(removeIds))
      }
      newFiles.forEach((file) => fd.append('images', file))

      if (isEdit) {
        await updateProduct(productId, fd)
        setToast({ message: 'Product updated successfully!', type: 'success' })
      } else {
        await createProduct(fd)
        setToast({ message: 'Product created successfully!', type: 'success' })
      }
      setTimeout(() => router.push('/dashboard?tab=products'), 1200)
    } catch (err) {
      setError(err.message || 'Save failed')
      setToast({ message: err.message || 'Save failed', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const visibleExisting = existingIds.filter((id) => !removeIds.includes(id))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  return (
    <DashboardShell
      active="products"
      title={isEdit ? 'Edit product' : 'Create product'}
      subtitle={isEdit ? 'Update the details below' : 'Add a new item to your catalogue'}
    >
      {saving && <FullPageLoader message={isEdit ? 'Updating product…' : 'Creating product…'} />}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5 animate-fade-in-up">
        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-slate-400">
            Fill the English fields and click Auto Translate.
          </p>
          <button
            type="button"
            onClick={autoTranslate}
            disabled={translating}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/20 disabled:opacity-60"
          >
            {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
            {translating ? 'Translating…' : 'Auto Translate'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 bg-slate-900 border border-white/5 rounded-lg px-3 py-2">
          Type in <strong className="text-amber-400">English only</strong>. Arabic fields can be
          generated automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title (English)" value={form.titleEn} onChange={(v) => setField('titleEn', v)} required />
          <Field label="Title (Arabic)" value={form.titleAr} onChange={(v) => setField('titleAr', v)} dir="rtl" required />
          <Field label="Price (SAR)" value={form.price} onChange={(v) => setField('price', v)} type="number" required />
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => {
                const cat = categories.find((c) => c.filter === e.target.value)
                setField('category', e.target.value)
                if (cat) setField('categoryAr', cat.nameAr || '')
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.filter}>
                  {c.nameEn}
                </option>
              ))}
            </select>
            {!categories.length && (
              <input
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-white/10 text-sm mt-1"
                placeholder="Or type category filter string"
              />
            )}
          </div>
          <Field label="Category AR" value={form.categoryAr} onChange={(v) => setField('categoryAr', v)} dir="rtl" />
          <Field label="Materials EN" value={form.materialsEn} onChange={(v) => setField('materialsEn', v)} />
          <Field label="Materials AR" value={form.materialsAr} onChange={(v) => setField('materialsAr', v)} dir="rtl" />
          <Field label="Dimensions EN" value={form.dimensionsEn} onChange={(v) => setField('dimensionsEn', v)} />
          <Field label="Dimensions AR" value={form.dimensionsAr} onChange={(v) => setField('dimensionsAr', v)} dir="rtl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Area label="Description EN" value={form.descriptionEn} onChange={(v) => setField('descriptionEn', v)} />
          <Area label="Description AR" value={form.descriptionAr} onChange={(v) => setField('descriptionAr', v)} dir="rtl" />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => setField('isNewArrival', e.target.checked)}
              className="rounded border-white/20"
            />
            <span className="text-slate-300">New arrival</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setField('isFeatured', e.target.checked)}
              className="rounded border-white/20"
            />
            <span className="text-slate-300">Featured</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Images (max 6 total)
          </label>
          <div className="flex flex-wrap gap-2">
            {visibleExisting.map((id) => (
              <div key={id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                <img src={getImageUrl(id)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => markRemoveExisting(id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
            {removeIds.map((id) => (
              <button
                key={`rm-${id}`}
                type="button"
                onClick={() => unmarkRemove(id)}
                className="w-20 h-20 rounded-lg border border-dashed border-red-500/40 text-[10px] text-red-400 flex items-center justify-center p-1"
              >
                Undo remove
              </button>
            ))}
            {previews.map((src, i) => (
              <div key={src} className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-500/40">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/70"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {visibleExisting.length + newFiles.length < 6 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-white/20 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-amber-400 transition"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[9px]">Upload</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={onFiles}
          />
          {!visibleExisting.length && !newFiles.length && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> No images yet
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.push('/dashboard?tab=products')}
            className="flex-1 h-11 rounded-xl border border-white/15 text-sm hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
          </button>
        </div>
      </form>
    </DashboardShell>
  )
}