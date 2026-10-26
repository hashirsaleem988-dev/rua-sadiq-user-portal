
'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Layers,
  FolderOpen,
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import {
  getProducts,
  deleteProduct,
  getImageUrl,
  getCategories,
  deleteCategory,
  getMaterials,
  deleteMaterial,
} from '@/lib/api'
import Toast from '@/components/Toast'
import FullPageLoader from '@/components/FullPageLoader'
import DashboardShell from '@/components/DashboardShell'

const TAB_TITLES = {
  products: ['Products', 'Manage your product catalogue'],
  categories: ['Categories', 'Organize products into categories'],
  materials: ['Materials', 'Manage fabric, wood and foam options'],
}

const MATERIAL_GROUPS = [
  { value: 'all', label: 'All groups' },
  { value: 'sofa', label: 'Sofa fabrics' },
  { value: 'curtain', label: 'Curtain fabrics' },
  { value: 'wood', label: 'Wood' },
  { value: 'foam', label: 'Foam' },
]

function DashboardInner() {
  const { isAuthenticated, checking, user } = useAdminAuth()
  const router = useRouter()
  const [productCategory, setProductCategory] = useState('all')
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'products'
  const [tab, setTab] = useState(initialTab)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productSearch, setProductSearch] = useState('')
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categorySearch, setCategorySearch] = useState('')
  const [materials, setMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialGroup, setMaterialGroup] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Module access — legacy admin (no moduleAccess) gets full access
  const canProduct = user?.moduleAccess ? user.moduleAccess.product !== false : true
  const canCategories = user?.moduleAccess ? user.moduleAccess.categories !== false : true
  const canMaterial = user?.moduleAccess ? user.moduleAccess.material !== false : true
  const allowedTabs = [
    canProduct && 'products',
    canCategories && 'categories',
    canMaterial && 'materials',
  ].filter(Boolean)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && allowedTabs.includes(t)) {
      setTab(t)
    } else if (allowedTabs.length > 0 && !allowedTabs.includes(tab)) {
      setTab(allowedTabs[0])
      router.replace(`/dashboard?tab=${allowedTabs[0]}`)
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!checking && !isAuthenticated) router.replace('/login')
  }, [checking, isAuthenticated, router])

  const loadProducts = useCallback(() => {
    setLoadingProducts(true)
    setError('')
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingProducts(false))
  }, [])

  const loadCategories = useCallback(() => {
    setLoadingCategories(true)
    setError('')
    getCategories()
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingCategories(false))
  }, [])

  const loadMaterials = useCallback(() => {
    setLoadingMaterials(true)
    setError('')
    getMaterials()
      .then(setMaterials)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMaterials(false))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    loadProducts()
    loadCategories()
    loadMaterials()
  }, [isAuthenticated, loadProducts, loadCategories, loadMaterials])

  const filteredProducts = products.filter((p) => {
    if (productCategory !== 'all' && p.category !== productCategory) return false
    if (!productSearch.trim()) return true

    const q = productSearch.toLowerCase()

    return (
      (p.titleEn || '').toLowerCase().includes(q) ||
      (p.titleAr || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    )
  })

  const filteredCategories = categories.filter((c) => {
    if (!categorySearch.trim()) return true

    const q = categorySearch.toLowerCase()

    return (
      (c.nameEn || '').toLowerCase().includes(q) ||
      (c.nameAr || '').toLowerCase().includes(q) ||
      (c.filter || '').toLowerCase().includes(q)
    )
  })

  const filteredMaterials = materials.filter((m) => {
    if (materialGroup !== 'all' && m.group !== materialGroup) return false
    if (!materialSearch.trim()) return true

    const q = materialSearch.toLowerCase()

    return (
      (m.nameEn || '').toLowerCase().includes(q) ||
      (m.nameAr || '').toLowerCase().includes(q) ||
      (m.key || '').toLowerCase().includes(q)
    )
  })

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return

    setDeletingId(id)
    setActionLoading(true)

    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      setToast({
        message: 'Product deleted successfully.',
        type: 'success',
      })
    } catch (e) {
      setToast({
        message: e.message || 'Delete failed',
        type: 'error',
      })
    } finally {
      setDeletingId(null)
      setActionLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category permanently?')) return

    setDeletingId(id)
    setActionLoading(true)

    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c._id !== id))
      setToast({
        message: 'Category deleted successfully.',
        type: 'success',
      })
    } catch (e) {
      setToast({
        message: e.message || 'Delete failed',
        type: 'error',
      })
    } finally {
      setDeletingId(null)
      setActionLoading(false)
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material permanently?')) return

    setDeletingId(id)
    setActionLoading(true)

    try {
      await deleteMaterial(id)
      setMaterials((prev) => prev.filter((m) => m._id !== id))
      setToast({
        message: 'Material deleted successfully.',
        type: 'success',
      })
    } catch (e) {
      setToast({
        message: e.message || 'Delete failed',
        type: 'error',
      })
    } finally {
      setDeletingId(null)
      setActionLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const spin = (
    <div className="py-20 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
    </div>
  )

  const empty = (t) => (
    <div className="py-16 text-center text-slate-500 text-base border border-dashed border-white/10 rounded-2xl">
      {t}
    </div>
  )

  const [pageTitle, pageSubtitle] =
    TAB_TITLES[tab] || TAB_TITLES.products

  return (
    <DashboardShell
      active={tab}
      counts={{
        products: products.length,
        categories: categories.length,
        materials: materials.length,
      }}
      onNavigate={(id) => {
        setTab(id)
        router.replace(`/dashboard?tab=${id}`)
      }}
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      {actionLoading && <FullPageLoader message="Processing…" />}

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="space-y-5">
        {error && (
          <div className="text-base text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {tab === 'products' && (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-900 border border-white/10 text-base focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full sm:w-auto h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-base focus:outline-none focus:border-amber-500 shrink-0"
                >
                  <option value="all">All categories</option>

                  {categories.map((c) => (
                    <option key={c._id} value={c.filter}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/products/new"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-base hover:bg-amber-400 transition w-full sm:w-auto sm:self-end"
              >
                <Plus className="h-4 w-4" />
                New product
              </Link>
            </div>

            <div className="text-sm text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10">
                {filteredProducts.length} products
              </span>
            </div>

            {loadingProducts ? (
              spin
            ) : filteredProducts.length === 0 ? (
              empty('No products found.')
            ) : (
              <div className="grid gap-3">
                {filteredProducts.map((p, idx) => {
                  const thumb = p.imageIds?.[0]
                    ? getImageUrl(p.imageIds[0])
                    : null

                  return (
                    <div
                      key={p._id}
                      style={{
                        animationDelay: `${Math.min(idx, 12) * 40}ms`,
                      }}
                      className="flex gap-3 items-start bg-slate-900 border border-white/10 rounded-xl p-3 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all animate-fade-in-up"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center mt-0.5">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold break-words leading-snug">
                          {p.titleEn}
                        </h3>

                        <p className="text-sm text-slate-500 break-words leading-snug mt-0.5">
                          {p.titleAr}
                        </p>

                        <div className="flex flex-wrap gap-1.5 text-xs text-slate-400 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800">
                            {p.category}
                          </span>

                          <span className="font-bold text-amber-400/90">
                            SAR {Number(p.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0 pt-0.5">
                        <Link
                          href={`/products/${p._id}/edit`}
                          className="p-2 rounded-lg border border-white/10 hover:border-amber-500/50"
                        >
                          <Pencil className="h-4 w-4 text-amber-400" />
                        </Link>

                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          disabled={deletingId === p._id}
                          className="p-2 rounded-lg border border-white/10 hover:border-red-500/40 disabled:opacity-50"
                        >
                          {deletingId === p._id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'categories' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories…"
                  className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-900 border border-white/10 text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <Link
                href="/categories/new"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-base hover:bg-amber-400 transition shrink-0"
              >
                <Plus className="h-4 w-4" />
                New category
              </Link>
            </div>

            <div className="text-sm text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10">
                {filteredCategories.length} categories
              </span>
            </div>

            {loadingCategories ? (
              spin
            ) : filteredCategories.length === 0 ? (
              empty('No categories found.')
            ) : (
              <div className="grid gap-3">
                {filteredCategories.map((c, idx) => {
                  const thumb = c.imageId ? getImageUrl(c.imageId) : null

                  return (
                    <div
                      key={c._id}
                      style={{
                        animationDelay: `${Math.min(idx, 12) * 40}ms`,
                      }}
                      className="flex gap-3 items-center bg-slate-900 border border-white/10 rounded-xl p-3 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all animate-fade-in-up"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <FolderOpen className="h-6 w-6 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold truncate">
                          {c.nameEn}
                        </h3>

                        <p
                          className="text-sm text-slate-500 truncate"
                          dir="rtl"
                        >
                          {c.nameAr}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                            {c.filter}
                          </span>

                          <span className="px-1.5 py-0.5 rounded bg-slate-800">
                            {c.aspectRatio || 'standard'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <Link
                          href={`/categories/${c._id}/edit`}
                          className="p-2 rounded-lg border border-white/10 hover:border-amber-500/50"
                        >
                          <Pencil className="h-4 w-4 text-amber-400" />
                        </Link>

                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          disabled={deletingId === c._id}
                          className="p-2 rounded-lg border border-white/10 hover:border-red-500/40 disabled:opacity-50"
                        >
                          {deletingId === c._id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'materials' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                  <input
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    placeholder="Search materials…"
                    className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-900 border border-white/10 text-base focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={materialGroup}
                  onChange={(e) => setMaterialGroup(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-base focus:outline-none focus:border-amber-500"
                >
                  {MATERIAL_GROUPS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/materials/new"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-base hover:bg-amber-400 transition shrink-0"
              >
                <Plus className="h-4 w-4" />
                New material
              </Link>
            </div>

            <div className="text-sm text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10">
                {filteredMaterials.length} materials
              </span>
            </div>

            {loadingMaterials ? (
              spin
            ) : filteredMaterials.length === 0 ? (
              empty('No materials found.')
            ) : (
              <div className="grid gap-3">
                {filteredMaterials.map((m, idx) => {
                  const thumb = m.imageId ? getImageUrl(m.imageId) : null

                  return (
                    <div
                      key={m._id}
                      style={{
                        animationDelay: `${Math.min(idx, 12) * 40}ms`,
                      }}
                      className="flex gap-3 items-center bg-slate-900 border border-white/10 rounded-xl p-3 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all animate-fade-in-up"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Layers className="h-6 w-6 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold truncate">
                          {m.nameEn}
                        </h3>

                        <p
                          className="text-sm text-slate-500 truncate"
                          dir="rtl"
                        >
                          {m.nameAr}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono">
                            {m.key}
                          </span>

                          <span className="px-1.5 py-0.5 rounded bg-slate-800 capitalize">
                            {m.group}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <Link
                          href={`/materials/${m._id}/edit`}
                          className="p-2 rounded-lg border border-white/10 hover:border-amber-500/50"
                        >
                          <Pencil className="h-4 w-4 text-amber-400" />
                        </Link>

                        <button
                          onClick={() => handleDeleteMaterial(m._id)}
                          disabled={deletingId === m._id}
                          className="p-2 rounded-lg border border-white/10 hover:border-red-500/40 disabled:opacity-50"
                        >
                          {deletingId === m._id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  )
}
