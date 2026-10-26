'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminLogin, adminMe } from '@/lib/api'

const AdminAuthContext = createContext(null)

function safeGetItem(key) {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore — blocked in iframe / privacy mode
  }
}

function safeRemoveItem(key) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState('')
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setChecking(false)
      return
    }

    const stored = safeGetItem('admin_token')
    const storedUser = safeGetItem('admin_username') || ''

    if (!stored) {
      setChecking(false)
      return
    }

    setToken(stored)
    setUsername(storedUser)

    adminMe()
      .then((data) => {
        const name = data.username || data.name || data.email || ''
        setUsername(name)
        setUser(data)
        safeSetItem('admin_username', name)
      })
      .catch(() => {
        safeRemoveItem('admin_token')
        safeRemoveItem('admin_username')
        setToken(null)
        setUsername('')
        setUser(null)
      })
      .finally(() => setChecking(false))
  }, [])

  const login = useCallback(async (userInput, pass) => {
    const data = await adminLogin(userInput, pass)

    // New API: { token, user: { name, email, role, moduleAccess } }
    // Old API: { token, username }
    const name = data.user?.name || data.user?.email || data.username || userInput
    const fullUser = data.user || { username: name, name }

    safeSetItem('admin_token', data.token)
    safeSetItem('admin_username', name)

    setToken(data.token)
    setUsername(name)
    setUser(fullUser)

    return data
  }, [])

  const logout = useCallback(() => {
    safeRemoveItem('admin_token')
    safeRemoveItem('admin_username')
    setToken(null)
    setUsername('')
    setUser(null)
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        username,
        user,
        isAuthenticated: !!token,
        checking,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
