'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  FolderOpen,
  Layers,
  LogOut,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  X as CloseIcon,
  Lock,
  Palette,
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useBranding } from '@/context/BrandingContext'

const ALL_NAV = [
  { id: 'products', label: 'Products', icon: Package, moduleKey: 'product' },
  { id: 'categories', label: 'Categories', icon: FolderOpen, moduleKey: 'categories' },
  { id: 'materials', label: 'Materials', icon: Layers, moduleKey: 'material' },
]

/**
 * Shared sidebar used across the dashboard and every form page.
 * Module access is controlled by user.moduleAccess from AdminAuthContext.
 * Branding (logo, name, colors) comes from BrandingContext.
 */
export default function Sidebar({
  active,
  counts = {},
  username,
  onLogout,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) {
  const { user } = useAdminAuth()
  const { brandName, logoUrl } = useBranding()
  const itemRefs = useRef({})
  const [indicator, setIndicator] = useState({ top: 0, height: 0, ready: false })

  const access = useMemo(() => {
    const ma = user?.moduleAccess
    if (!ma) {
      return { product: true, categories: true, material: true }
    }
    return {
      product: ma.product !== false,
      categories: ma.categories !== false,
      material: ma.material !== false,
    }
  }, [user])

  const NAV = useMemo(
    () => ALL_NAV.filter((item) => access[item.moduleKey]),
    [access]
  )

  useEffect(() => {
    const el = itemRefs.current[active]
    if (el) {
      setIndicator({ top: el.offsetTop, height: el.offsetHeight, ready: true })
    } else {
      setIndicator((s) => ({ ...s, ready: false }))
    }
  }, [active, collapsed, mobileOpen, NAV])

  const displayName = brandName || 'Rua Sadiq'
  const initials = (username || 'A')
    .trim()
    .split(/\\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleClick = (id, e) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(id)
    }
    onCloseMobile?.()
  }

  const isBrandingActive = active === 'branding'

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-screen shrink-0 flex flex-col
          portal-sidebar-bg border-r border-white/10 backdrop-blur-xl
          transition-all duration-300 ease-out
          ${collapsed ? 'lg:w-[84px]' : 'lg:w-72'}
          w-72
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full portal-glow-primary bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 -right-16 h-48 w-48 rounded-full portal-glow-accent bg-fuchsia-500/10 blur-3xl" />

        {/* Brand row */}
        <div className="relative flex items-center gap-3 px-5 h-16 shrink-0">
          {logoUrl ? (
            <div className="relative shrink-0 h-10 w-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
              <img src={logoUrl} alt={displayName} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="relative shrink-0 h-10 w-10 rounded-xl portal-brand-mark bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="h-5 w-5 text-slate-950 portal-brand-icon" />
              <span className="absolute inset-0 rounded-xl bg-amber-400/40 blur-md -z-10 animate-pulse-slow" />
            </div>
          )}
          <div
            className={`min-w-0 transition-all duration-300 ${
              collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'
            }`}
          >
            <p className="text-sm font-bold leading-tight truncate">{displayName}</p>
            <p className="text-[10px] tracking-wider uppercase text-slate-500 truncate">Portal</p>
          </div>
          <button
            onClick={onCloseMobile}
            className="ml-auto lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
            aria-label="Close menu"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
          {/* sliding indicator — only for module tabs */}
          <div
            className="absolute left-3 right-3 rounded-xl portal-nav-indicator bg-amber-500/10 border border-amber-500/20 transition-all duration-300 ease-out pointer-events-none"
            style={{
              top: indicator.top,
              height: indicator.height,
              opacity: indicator.ready && !isBrandingActive ? 1 : 0,
            }}
          />

          {NAV.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-slate-500">
              <Lock className="h-5 w-5 mx-auto mb-2 opacity-50" />
              No modules granted
            </div>
          )}

          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            const count = counts[id]
            return (
              <Link
                key={id}
                href={`/dashboard?tab=${id}`}
                ref={(el) => (itemRefs.current[id] = el)}
                onClick={(e) => handleClick(id, e)}
                className={`relative z-10 group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors duration-200
                  ${isActive ? 'text-amber-300 portal-nav-active' : 'text-slate-400 hover:text-white'}
                `}
              >
                <span
                  className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300
                    ${isActive ? 'bg-amber-500/20 scale-105 portal-nav-active-icon' : 'bg-white/5 group-hover:bg-white/10'}
                  `}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                </span>
                <span
                  className={`flex-1 min-w-0 truncate transition-all duration-300 ${
                    collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'
                  }`}
                >
                  {label}
                </span>
                {typeof count === 'number' && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-amber-400 text-slate-950 portal-nav-count-active' : 'bg-white/10 text-slate-400'
                    } ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden lg:px-0' : ''}`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Change Branding — always available */}
          <div className="pt-3 mt-2 border-t border-white/5">
            <Link
              href="/branding"
              onClick={() => onCloseMobile?.()}
              className={`relative z-10 group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors duration-200
                ${isBrandingActive ? 'text-amber-300 portal-nav-active bg-amber-500/10 border border-amber-500/20' : 'text-slate-400 hover:text-white'}
              `}
            >
              <span
                className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300
                  ${isBrandingActive ? 'bg-amber-500/20 scale-105 portal-nav-active-icon' : 'bg-white/5 group-hover:bg-white/10'}
                `}
              >
                <Palette className={`h-4 w-4 ${isBrandingActive ? 'scale-110' : ''}`} />
              </span>
              <span
                className={`flex-1 min-w-0 truncate transition-all duration-300 ${
                  collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'
                }`}
              >
                Change Branding
              </span>
            </Link>
          </div>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center gap-2 mx-3 mb-2 h-9 rounded-lg border border-white/10 text-slate-500 portal-text-accent-hover portal-border-accent hover:text-amber-300 hover:border-amber-500/30 transition-colors"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span className="text-xs font-semibold">Collapse</span>
            </>
          )}
        </button>

        {/* User / logout */}
        <div className="relative border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-amber-300 portal-text-accent">
              {initials}
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-300 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
              <p className="text-xs font-semibold truncate">{username || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.role === 'user' ? 'User' : 'Administrator'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className={`shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? 'lg:hidden' : ''}`}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          {collapsed && (
            <button
              onClick={onLogout}
              className="hidden lg:flex w-full items-center justify-center mt-1 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
