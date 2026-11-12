/**
 * HTTP client for the Spring Boot backend (Part 2).
 *
 * Every request the frontend makes goes through this module, so the rest of
 * the app never builds a URL or reads a status code itself. The base URL can be
 * overridden with VITE_API_BASE (for example in a .env.local file).
 */

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api/v1/assets'

/** An HTTP failure with the status code kept, so callers can react to 404 / 409 / 400. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const MESSAGES = {
  400: 'The server rejected the data. Check the highlighted fields.',
  404: 'That asset no longer exists.',
  409: 'This asset tag is already in use.',
}

async function request(url, options = {}) {
  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new ApiError(0, 'Cannot reach the backend at localhost:3000. Is the Spring server running?')
  }
  if (!response.ok) {
    throw new ApiError(response.status, MESSAGES[response.status] ?? `Server error (${response.status}).`)
  }
  return response
}

/**
 * Convert a form draft into the JSON the Java record expects:
 * no id, trimmed strings, and empty optional fields sent as null
 * (an empty string is not a valid LocalDate or BigDecimal).
 */
export function toPayload(draft) {
  const text = (value) => (typeof value === 'string' ? value.trim() : value ?? '')
  return {
    name: text(draft.name),
    tag: text(draft.tag),
    category: draft.category,
    status: draft.status,
    department: text(draft.department),
    assignedTo: text(draft.assignedTo),
    location: text(draft.location),
    purchaseDate: draft.purchaseDate ? draft.purchaseDate : null,
    purchaseCost: draft.purchaseCost === '' || draft.purchaseCost === null || draft.purchaseCost === undefined
      ? null
      : Number(draft.purchaseCost),
    notes: text(draft.notes),
  }
}

/** Translate the table's sort state into Spring Data's `sort=field,dir` parameter. */
function sortParam(sortKey, sortDirection) {
  return sortKey ? `&sort=${encodeURIComponent(sortKey)},${sortDirection === 'desc' ? 'desc' : 'asc'}` : ''
}

/** GET /api/v1/assets?page=&size=&sort= — returns Spring's Page JSON. */
export async function fetchAssetPage({ page = 0, size = 10, sortKey = 'name', sortDirection = 'asc' } = {}) {
  const response = await request(`${API_BASE}?page=${page}&size=${size}${sortParam(sortKey, sortDirection)}`)
  return response.json()
}

/** Every asset, for the dashboard totals and for text search across all pages. */
export async function fetchAllAssets({ sortKey = 'name', sortDirection = 'asc' } = {}) {
  const page = await fetchAssetPage({ page: 0, size: 1000, sortKey, sortDirection })
  return page.content
}

/** GET /api/v1/assets/{id} — resolves to null on 404 instead of throwing. */
export async function fetchAsset(id) {
  try {
    const response = await request(`${API_BASE}/${id}`)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** POST /api/v1/assets — resolves to the new id, read from the Location header. */
export async function createAsset(draft) {
  const response = await request(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(draft)),
  })
  const location = response.headers.get('Location')
  return location ? Number(location.split('/').pop()) : null
}

/** PUT /api/v1/assets/{id} */
export async function updateAsset(id, draft) {
  await request(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(draft)),
  })
}

/** DELETE /api/v1/assets/{id} */
export async function deleteAsset(id) {
  await request(`${API_BASE}/${id}`, { method: 'DELETE' })
}
