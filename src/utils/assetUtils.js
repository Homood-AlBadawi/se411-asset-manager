/**
 * Pure helpers for the asset collection.
 *
 * Nothing in this module touches React, the DOM or any global state. That is
 * deliberate: every rule the application enforces (validation, searching,
 * sorting, aggregation) can be unit tested in isolation, and the components
 * stay thin.
 */

/** Generate a RFC4122-ish unique id, falling back when crypto is unavailable. */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Trim every string field so " PSU-LT-01 " and "PSU-LT-01" are the same tag. */
export function normalizeAsset(input) {
  const trimmed = {}
  for (const [key, value] of Object.entries(input)) {
    trimmed[key] = typeof value === 'string' ? value.trim() : value
  }
  return trimmed
}

/**
 * Validate a draft asset.
 *
 * @returns {Object} field name -> error message. An empty object means valid.
 */
export function validateAsset(draft, existingAssets = [], editingId = null) {
  const errors = {}
  const asset = normalizeAsset(draft)

  if (!asset.name) {
    errors.name = 'Asset name is required.'
  } else if (asset.name.length < 2) {
    errors.name = 'Asset name must be at least 2 characters.'
  } else if (asset.name.length > 80) {
    errors.name = 'Asset name must be 80 characters or fewer.'
  }

  if (!asset.tag) {
    errors.tag = 'Asset tag is required.'
  } else if (!/^[A-Za-z0-9-]{3,20}$/.test(asset.tag)) {
    errors.tag = 'Tag may only contain letters, numbers and dashes (3-20 characters).'
  } else {
    const duplicate = existingAssets.some(
      (item) => item.id !== editingId && item.tag.toLowerCase() === asset.tag.toLowerCase(),
    )
    if (duplicate) errors.tag = 'This asset tag is already in use.'
  }

  if (!asset.category) errors.category = 'Category is required.'
  if (!asset.status) errors.status = 'Status is required.'

  if (asset.purchaseDate) {
    const parsed = new Date(asset.purchaseDate)
    if (Number.isNaN(parsed.getTime())) {
      errors.purchaseDate = 'Purchase date is not a valid date.'
    } else if (parsed.getTime() > Date.now()) {
      errors.purchaseDate = 'Purchase date cannot be in the future.'
    }
  }

  if (asset.purchaseCost !== '' && asset.purchaseCost !== null && asset.purchaseCost !== undefined) {
    const cost = Number(asset.purchaseCost)
    if (Number.isNaN(cost)) {
      errors.purchaseCost = 'Purchase cost must be a number.'
    } else if (cost < 0) {
      errors.purchaseCost = 'Purchase cost cannot be negative.'
    } else if (cost > 10_000_000) {
      errors.purchaseCost = 'Purchase cost looks unrealistically high.'
    }
  }

  if (asset.notes && asset.notes.length > 500) {
    errors.notes = 'Notes must be 500 characters or fewer.'
  }

  return errors
}

/**
 * Free-text search across the fields a user would realistically type into.
 * Case-insensitive and whitespace tolerant.
 */
export function searchAssets(assets, term) {
  const query = (term || '').trim().toLowerCase()
  if (!query) return assets

  return assets.filter((asset) =>
    [asset.name, asset.tag, asset.assignedTo, asset.location, asset.department, asset.category, asset.notes]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query)),
  )
}

/** Apply the dropdown filters. 'All' (or an empty value) means "do not filter". */
export function filterAssets(assets, { category = 'All', status = 'All', department = 'All' } = {}) {
  return assets.filter((asset) => {
    if (category && category !== 'All' && asset.category !== category) return false
    if (status && status !== 'All' && asset.status !== status) return false
    if (department && department !== 'All' && asset.department !== department) return false
    return true
  })
}

/** Sort without mutating the input array. */
export function sortAssets(assets, key = 'name', direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1

  return [...assets].sort((a, b) => {
    const left = a[key]
    const right = b[key]

    if (left === right) return 0
    if (left === '' || left === null || left === undefined) return 1
    if (right === '' || right === null || right === undefined) return -1

    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * factor
    }
    return String(left).localeCompare(String(right), undefined, { sensitivity: 'base' }) * factor
  })
}

/** Search, then filter, then sort - the exact pipeline the assets page uses. */
export function queryAssets(assets, { term = '', filters = {}, sortKey = 'name', sortDirection = 'asc' } = {}) {
  return sortAssets(filterAssets(searchAssets(assets, term), filters), sortKey, sortDirection)
}

/** Headline numbers for the dashboard. */
export function summarize(assets) {
  const total = assets.length
  const byStatus = {}
  const byCategory = {}
  let totalValue = 0

  for (const asset of assets) {
    byStatus[asset.status] = (byStatus[asset.status] || 0) + 1
    byCategory[asset.category] = (byCategory[asset.category] || 0) + 1
    totalValue += Number(asset.purchaseCost) || 0
  }

  return { total, byStatus, byCategory, totalValue }
}

/** Format a number as Saudi Riyals; blank input renders as an em dash. */
export function formatCurrency(value) {
  if (value === '' || value === null || value === undefined) return '—'
  const number = Number(value)
  if (Number.isNaN(number)) return '—'
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(number)
}

/** Format an ISO date as e.g. "11 Feb 2025". */
export function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
