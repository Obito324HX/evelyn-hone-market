export function saveAuth(data) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
}

export function getToken() {
  return localStorage.getItem('token')
}

// Fields every component relies on. If a cached user object is missing
// any of these — e.g. from an old schema, a failed save, or manual
// localStorage tampering — we treat the session as invalid rather than
// handing broken data to components that will crash trying to read it.
const REQUIRED_USER_FIELDS = ['id', 'name']

export function getUser() {
  const raw = localStorage.getItem('user')
  if (!raw) return null

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.warn('Corrupted user data in localStorage — clearing session.', err)
    logout()
    return null
  }

  if (!parsed || typeof parsed !== 'object') {
    logout()
    return null
  }

  const missingField = REQUIRED_USER_FIELDS.some(field => parsed[field] === undefined || parsed[field] === null)
  if (missingField) {
    console.warn('Cached user data is missing required fields — clearing session.')
    logout()
    return null
  }

  return parsed
}

export function getAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
