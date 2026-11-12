/**
 * In-memory stand-in for src/api/assetApi.js, used by the component and
 * integration tests via vi.mock. It mimics the Spring backend's behaviour:
 * numeric ids, a Page-shaped list response, null on 404, and a 409 ApiError
 * for a duplicate tag.
 */
import { sortAssets } from '../utils/assetUtils'

let store = []
let nextId = 100

export const API_BASE = 'http://test.local/api/v1/assets'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function resetFakeApi(assets = []) {
  store = assets.map((asset) => ({ ...asset }))
  nextId = 100
}

export function toPayload(draft) {
  return { ...draft }
}

export async function fetchAssetPage({ page = 0, size = 10, sortKey = 'name', sortDirection = 'asc' } = {}) {
  const sorted = sortAssets(store, sortKey, sortDirection)
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  return {
    content: sorted.slice(page * size, page * size + size),
    number: page,
    size,
    totalElements: sorted.length,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  }
}

export async function fetchAllAssets({ sortKey = 'name', sortDirection = 'asc' } = {}) {
  return sortAssets(store, sortKey, sortDirection)
}

export async function fetchAsset(id) {
  return store.find((asset) => asset.id === Number(id)) ?? null
}

function assertTagFree(tag, ownId = null) {
  const taken = store.some((asset) => asset.id !== ownId && asset.tag.toLowerCase() === String(tag).trim().toLowerCase())
  if (taken) throw new ApiError(409, 'This asset tag is already in use.')
}

export async function createAsset(draft) {
  assertTagFree(draft.tag)
  const id = nextId++
  store.push({ ...draft, id, name: draft.name.trim(), tag: draft.tag.trim() })
  return id
}

export async function updateAsset(id, draft) {
  const index = store.findIndex((asset) => asset.id === Number(id))
  if (index === -1) throw new ApiError(404, 'That asset no longer exists.')
  assertTagFree(draft.tag, Number(id))
  store[index] = { ...draft, id: Number(id) }
}

export async function deleteAsset(id) {
  const before = store.length
  store = store.filter((asset) => asset.id !== Number(id))
  if (store.length === before) throw new ApiError(404, 'That asset no longer exists.')
}
