'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Lock, User, Loader2, ArrowLeft, Sparkles, Mail } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { requestPasswordReset } from '@/lib/api'

const SNAPSHOTS = [
  {
    label: 'Living Room',
    accent: 'from-amber-400 to-orange-500',
    price: 'SAR 4,250',
    tag: 'Featured',
  },
  {
    label: 'Curtain Fabrics',
    accent: 'from-fuchsia-400 to-violet-500',
    price: 'SAR 180',
    tag: 'New arrival',
  },
  {
    label: 'Bedroom Set',
    accent: 'from-sky-400 to-blue-500',
    price: 'SAR 6,900',
    tag: 'Trending',
  },
]

export default function PortalLogin() {
  const { login, isAuthenticated, checking } = useAdminAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [snapIndex, setSnapIndex] = useState(0)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState(null)

  useEffect(() => {
    if (!checking && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [checking, isAuthenticated, router])

  useEffect(() => {
    const t = setInterval(() => setSnapIndex((i) => (i + 1) % SNAPSHOTS.length), 3200)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    setResetMessage(null)
    const email = resetEmail.trim()
    if (!email) {
      setResetMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }
    setResetLoading(true)
    try {
      const res = await requestPasswordReset(email)
      setResetMessage({
        type: 'success',
        text:
          res?.message ||
          'If an account with that email exists, the admin has been notified to reset your password.',
      })
      setResetEmail('')
    } catch (err) {
      setResetMessage({ type: 'error', text: err.message || 'Request failed' })
    } finally {
      setResetLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  const active = SNAPSHOTS[snapIndex]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] h-[420px] w-[420px] rounded-full bg-amber-500/[0.08] blur-3xl animate-blob" />
        <div className="absolute bottom-[-15%] right-[10%] h-[380px] w-[380px] rounded-full bg-fuchsia-500/[0.06] blur-3xl animate-blob-slow" />
      </div>

      {/* LEFT: form */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>

          <div className="mb-8 space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30">
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to manage your catalogue</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-sm"
          >
            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => {
                  setShowReset(true)
                  setResetMessage(null)
                  setResetEmail(username.includes('@') ? username : '')
                }}
                className="text-xs text-amber-400/90 hover:text-amber-300 transition"
              >
                Forgot password? Reset request
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:shadow-lg hover:shadow-amber-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {showReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Reset password</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Enter the email linked to your account. The admin will be notified and can set a new password for you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Close
                  </button>
                </div>

                {resetMessage && (
                  <div
                    className={`text-sm rounded-lg px-3 py-2 border ${
                      resetMessage.type === 'success'
                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-red-300 bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {resetMessage.text}
                  </div>
                )}

                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {resetLoading ? 'Sending…' : 'Notify admin'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <p className="text-center mt-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-amber-400 transition">
              ← Portal home
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT: animated content-morph visual (desktop only) */}
      <div className="relative hidden lg:flex flex-1 items-center justify-center overflow-hidden border-l border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        {/* animated grid backdrop */}
        <div
          className="absolute inset-0 opacity-[0.07] animate-grid-pan"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-16 right-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl animate-blob" />
        <div className="absolute bottom-16 left-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl animate-blob-slow" />

        <div className="relative w-full max-w-md px-8">
          <div className="text-center mb-8 space-y-2 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Live catalogue preview
            </div>
            <h2 className="text-xl font-bold text-white/90">
              Every edit, reflected instantly
            </h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Update a product here and watch the storefront update in real time.
            </p>
          </div>

          {/* mock browser frame */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-sm animate-float">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-[10px] text-slate-500 font-mono truncate">
                ruasadiq.com/shop
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* morphing hero card */}
              <div
                key={snapIndex}
                className={`relative h-32 rounded-xl bg-gradient-to-br ${active.accent} overflow-hidden animate-fade-in`}
              >
                <div className="absolute inset-0 bg-black/10" />
                <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider bg-black/30 text-white px-2 py-0.5 rounded-full">
                  {active.tag}
                </span>
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                  <p className="text-sm font-bold text-white drop-shadow">{active.label}</p>
                  <p className="text-xs font-bold text-white/90">{active.price}</p>
                </div>
                <span className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 animate-pulse-slow" />
              </div>

              {/* skeleton grid rows that shimmer, representing content updating */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-3/4 rounded-full bg-white/10" />
                <div className="h-2.5 w-1/2 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          {/* progress dots for the cycling snapshots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {SNAPSHOTS.map((s, i) => (
              <span
                key={s.label}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === snapIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
