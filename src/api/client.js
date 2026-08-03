const BASE_URL = '/api'
const TOKEN_KEY = 'caixa_auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Login is a public endpoint. A stale or invalid leftover token must never
// be sent with it - Spring Security rejects an invalid bearer token with 401
// during authentication, before it even checks that the endpoint is
// permitAll, which would otherwise block login outright.
const PUBLIC_PATHS = new Set(['/v1/auth/login'])

async function request(path, options = {}) {
  const token = PUBLIC_PATHS.has(path) ? null : getToken()
  // Let the browser set the multipart Content-Type (with boundary) itself
  // when sending FormData - overriding it here would break the upload.
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    clearToken()
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, path))
  }

  if (response.status === 204) return null
  return response.json()
}

async function extractErrorMessage(response, path) {
  const text = await response.text().catch(() => '')
  try {
    const body = JSON.parse(text)
    return body.message || body.error || `Erro ${response.status} ao aceder a ${path}`
  } catch {
    return text || `Erro ${response.status} ao aceder a ${path}`
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path) => request(path, { method: 'PATCH' }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
}
