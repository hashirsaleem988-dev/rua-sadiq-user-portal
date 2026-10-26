'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getMyBranding, updateMyBranding, resetMyBranding } from '@/lib/api'
import { useAdminAuth } from '@/context/AdminAuthContext'

export const DEFAULT_BRANDING = {
  brandName: 'Rua Sadiq',
  logoUrl: null,
  primaryColor: '#f59e0b',
  secondaryColor: '#0f172a',
  accentColor: '#fbbf24',
  backgroundColor: '#020617',
}

const BrandingContext = createContext({
  ...DEFAULT_BRANDING,
  loading: true,
  refresh: async () => {},
  save: async () => {},
  reset: async () => {},
})

const STYLE_ID = 'portal-user-theme'

/** Ensure #rrggbb (or #rgb expanded). Reject invalid. */
function normalizeHex(input, fallback) {
  if (!input || typeof input !== 'string') return fallback
  let h = input.trim()
  if (!h.startsWith('#')) h = `#${h}`
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return fallback
  return h.toLowerCase()
}

function withAlpha(hex, alphaHex) {
  const h = normalizeHex(hex, '#000000')
  return `${h}${alphaHex}`
}

function applyTheme(b) {
  if (typeof document === 'undefined') return

  const primary = normalizeHex(b.primaryColor, DEFAULT_BRANDING.primaryColor)
  const secondary = normalizeHex(b.secondaryColor, DEFAULT_BRANDING.secondaryColor)
  const accent = normalizeHex(b.accentColor, DEFAULT_BRANDING.accentColor)
  const background = normalizeHex(b.backgroundColor, DEFAULT_BRANDING.backgroundColor)

  // Direct inline styles so nothing can override the page background
  document.documentElement.style.setProperty('--brand-primary', primary)
  document.documentElement.style.setProperty('--brand-secondary', secondary)
  document.documentElement.style.setProperty('--brand-accent', accent)
  document.documentElement.style.setProperty('--brand-bg', background)
  document.documentElement.style.backgroundColor = background
  document.body.style.backgroundColor = background
  document.body.style.background = background

  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }

  el.textContent = `
html, body {
  background: ${background} !important;
  background-color: ${background} !important;
}
.portal-page-bg,
.portal-page-bg.bg-slate-950,
div.portal-page-bg {
  background: ${background} !important;
  background-color: ${background} !important;
}
.portal-header-bg {
  background-color: ${withAlpha(background, 'e6')} !important;
}
.portal-sidebar-bg,
aside.portal-sidebar-bg {
  background-color: ${withAlpha(secondary, 'f5')} !important;
}
/* Sidebar brand mark gradient */
.portal-brand-mark {
  background: linear-gradient(to bottom right, ${accent}, ${primary}) !important;
  box-shadow: 0 10px 15px -3px ${withAlpha(primary, '33')} !important;
}
.portal-brand-mark .portal-brand-icon {
  color: ${secondary} !important;
}
.portal-nav-indicator {
  background-color: ${withAlpha(primary, '1a')} !important;
  border-color: ${withAlpha(primary, '33')} !important;
}
.portal-nav-active {
  color: ${accent} !important;
}
.portal-nav-active-icon {
  background-color: ${withAlpha(primary, '33')} !important;
}
.portal-nav-count-active {
  background-color: ${accent} !important;
  color: ${secondary} !important;
}
.portal-glow-primary {
  background-color: ${withAlpha(primary, '14')} !important;
}
.portal-glow-accent {
  background-color: ${withAlpha(accent, '12')} !important;
}
.portal-btn-primary {
  background-color: ${primary} !important;
  color: ${secondary} !important;
}
.portal-btn-primary:hover {
  filter: brightness(1.08);
}
.portal-text-accent {
  color: ${accent} !important;
}
.portal-border-accent:hover {
  border-color: ${withAlpha(primary, '4d')} !important;
}
.portal-text-accent-hover:hover {
  color: ${accent} !important;
}
`

  document.documentElement.dataset.brandName = b.brandName || DEFAULT_BRANDING.brandName
}

function normalize(data) {
  return {
    brandName: data?.brandName || DEFAULT_BRANDING.brandName,
    logoUrl: data?.logoUrl || null,
    primaryColor: normalizeHex(data?.primaryColor, DEFAULT_BRANDING.primaryColor),
    secondaryColor: normalizeHex(data?.secondaryColor, DEFAULT_BRANDING.secondaryColor),
    accentColor: normalizeHex(data?.accentColor, DEFAULT_BRANDING.accentColor),
    backgroundColor: normalizeHex(data?.backgroundColor, DEFAULT_BRANDING.backgroundColor),
  }
}

export function BrandingProvider({ children }) {
  const { isAuthenticated, token } = useAdminAuth()
  const [branding, setBranding] = useState({ ...DEFAULT_BRANDING })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!token) {
      setBranding({ ...DEFAULT_BRANDING })
      applyTheme(DEFAULT_BRANDING)
      setLoading(false)
      return
    }
    try {
      const data = await getMyBranding()
      const next = normalize(data)
      setBranding(next)
      applyTheme(next)
    } catch {
      setBranding({ ...DEFAULT_BRANDING })
      applyTheme(DEFAULT_BRANDING)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated) {
      setBranding({ ...DEFAULT_BRANDING })
      applyTheme(DEFAULT_BRANDING)
      setLoading(false)
      return
    }
    setLoading(true)
    refresh()
  }, [isAuthenticated, refresh])

  const save = useCallback(async (payload) => {
    const saved = await updateMyBranding(payload)
    const next = normalize(saved)
    setBranding(next)
    applyTheme(next)
    return next
  }, [])

  const reset = useCallback(async () => {
    const saved = await resetMyBranding()
    const next = normalize(saved)
    setBranding(next)
    applyTheme(next)
    return next
  }, [])

  return (
    <BrandingContext.Provider value={{ ...branding, loading, refresh, save, reset, applyTheme }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  return useContext(BrandingContext)
}
