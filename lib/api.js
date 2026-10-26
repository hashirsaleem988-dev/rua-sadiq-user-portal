const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function safeGetItem(key) {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function authHeaders() {
  const token = safeGetItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...authHeaders(),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export function getCategories() {
  return request('/api/categories')
}

export function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/api/products${query ? `?${query}` : ''}`)
}

export function getProductById(id) {
  return request(`/api/products/${id}`)
}

export function getMaterials(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/api/materials${query ? `?${query}` : ''}`)
}

export function adminLogin(usernameOrEmail, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: usernameOrEmail,
      password,
    }),
  })
}

export function adminMe() {
  return request('/api/auth/me')
}

export function createProduct(formData) {
  return request('/api/products', {
    method: 'POST',
    body: formData,
  })
}

export function updateProduct(id, formData) {
  return request(`/api/products/${id}`, {
    method: 'PUT',
    body: formData,
  })
}

export function deleteProduct(id) {
  return request(`/api/products/${id}`, { method: 'DELETE' })
}

export function createCategory(formData) {
  return request('/api/categories', { method: 'POST', body: formData })
}

export function updateCategory(id, formData) {
  return request(`/api/categories/${id}`, { method: 'PUT', body: formData })
}

export function deleteCategory(id) {
  return request(`/api/categories/${id}`, { method: 'DELETE' })
}

export function createMaterial(formData) {
  return request('/api/materials', { method: 'POST', body: formData })
}

export function updateMaterial(id, formData) {
  return request(`/api/materials/${id}`, { method: 'PUT', body: formData })
}

export function deleteMaterial(id) {
  return request(`/api/materials/${id}`, { method: 'DELETE' })
}

export function getImageUrl(imageId) {
  if (!imageId) return null
  const id =
    typeof imageId === 'object' && imageId !== null
      ? imageId.$oid || imageId.toString?.() || String(imageId)
      : String(imageId)
  return `${API_URL}/api/images/${id}`
}

export { API_URL }

export function getMyBranding() {
  return request('/api/branding/me')
}

export function updateMyBranding(payload) {
  return request('/api/branding/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function resetMyBranding() {
  return request('/api/branding/me/reset', { method: 'POST' })
}


export function requestPasswordReset(email) {
  return request('/api/auth/password-reset-request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
