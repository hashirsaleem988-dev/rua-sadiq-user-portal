'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useRouter } from 'next/navigation'

/**
 * Wraps every authenticated page (dashboard + all create/edit forms) with the
 * persistent animated sidebar, so navigating between sections never loses
 * that context.
 *
 * `active`      — which sidebar section to highlight ('products' | 'categories' | 'materials')
 * `counts`      — optional badge counts for each nav item
 * `onNavigate`  — optional, only passed by the dashboard for instant tab switches
 * `title` / `subtitle` — slim topbar heading
 * `topbarRight` — optional node rendered on the right side of the topbar
 */
export default function DashboardShell({
  active,
  counts,
  onNavigate,
  title,
  subtitle,
  topbarRight,
  children,
}) {
  const { username, logout } = useAdminAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen portal-page-bg text-white">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[420px] w-[420px] rounded-full bg-amber-500/[0.06] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[10%] h-[380px] w-[380px] rounded-full bg-fuchsia-500/[0.05] blur-3xl" />
      </div>

      <Sidebar
        active={active}
        counts={counts}
        username={username}
        onLogout={handleLogout}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div
        className={`relative transition-all duration-300 ease-out ${
          collapsed ? 'lg:pl-[84px]' : 'lg:pl-72'
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-white/10 portal-header-bg backdrop-blur-xl">
          <div className="px-4 sm:px-6 h-16 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-white/10 hover:bg-white/5 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold truncate">{title}</h1>
              {subtitle && <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>}
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">{topbarRight}</div>
          </div>
        </header>

        <main className="relative px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  )
}