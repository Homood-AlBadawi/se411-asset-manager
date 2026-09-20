import { describe, expect, it } from 'vitest'
import {
  filterAssets,
  formatDate,
  generateId,
  normalizeAsset,
  queryAssets,
  searchAssets,
  sortAssets,
  summarize,
  validateAsset,
} from '../utils/assetUtils'

const sample = [
  { id: '1', name: 'MacBook Pro', tag: 'PSU-LT-001', category: 'Laptop', status: 'In Use', department: 'Engineering', assignedTo: 'Homood', location: 'Lab 3', purchaseCost: 8000, purchaseDate: '2025-01-01', notes: '' },
  { id: '2', name: 'Dell Monitor', tag: 'PSU-MN-002', category: 'Monitor', status: 'In Storage', department: 'Finance', assignedTo: '', location: 'Store', purchaseCost: 2000, purchaseDate: '2024-06-01', notes: 'spare' },
  { id: '3', name: 'HP Server', tag: 'PSU-SV-003', category: 'Server', status: 'In Use', department: 'Engineering', assignedTo: 'IT Ops', location: 'Rack 2', purchaseCost: 40000, purchaseDate: '2023-03-01', notes: '' },
]

describe('generateId', () => {
  it('returns a non-empty unique string each call', () => {
    const a = generateId()
    const b = generateId()
    expect(a).toBeTruthy()
    expect(typeof a).toBe('string')
    expect(a).not.toBe(b)
  })
})

describe('normalizeAsset', () => {
  it('trims string fields and leaves other types untouched', () => {
    const result = normalizeAsset({ name: '  Laptop  ', purchaseCost: 500, tag: ' T-1 ' })
    expect(result.name).toBe('Laptop')
    expect(result.tag).toBe('T-1')
    expect(result.purchaseCost).toBe(500)
  })
})

describe('validateAsset', () => {
  const valid = { name: 'New Laptop', tag: 'PSU-LT-999', category: 'Laptop', status: 'In Use', purchaseCost: '4500', purchaseDate: '2025-01-10', notes: '' }

  it('accepts a well-formed asset', () => {
    expect(validateAsset(valid, sample)).toEqual({})
  })

  it('requires a name', () => {
    expect(validateAsset({ ...valid, name: '   ' }, sample).name).toBeTruthy()
  })

  it('requires a tag and rejects illegal characters', () => {
    expect(validateAsset({ ...valid, tag: '' }, sample).tag).toBeTruthy()
    expect(validateAsset({ ...valid, tag: 'has space' }, sample).tag).toBeTruthy()
    expect(validateAsset({ ...valid, tag: 'ab' }, sample).tag).toBeTruthy()
  })

  it('rejects a duplicate tag, case-insensitively', () => {
    expect(validateAsset({ ...valid, tag: 'psu-lt-001' }, sample).tag).toMatch(/already in use/i)
  })

  it('allows an asset to keep its own tag while being edited', () => {
    expect(validateAsset({ ...valid, tag: 'PSU-LT-001' }, sample, '1').tag).toBeUndefined()
  })

  it('rejects a negative or non-numeric cost', () => {
    expect(validateAsset({ ...valid, purchaseCost: '-5' }, sample).purchaseCost).toBeTruthy()
    expect(validateAsset({ ...valid, purchaseCost: 'abc' }, sample).purchaseCost).toBeTruthy()
  })

  it('accepts an empty cost as "not recorded"', () => {
    expect(validateAsset({ ...valid, purchaseCost: '' }, sample).purchaseCost).toBeUndefined()
  })

  it('rejects a purchase date in the future', () => {
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(validateAsset({ ...valid, purchaseDate: nextYear }, sample).purchaseDate).toBeTruthy()
  })

  it('rejects notes longer than 500 characters', () => {
    expect(validateAsset({ ...valid, notes: 'x'.repeat(501) }, sample).notes).toBeTruthy()
  })
})

describe('searchAssets', () => {
  it('returns everything for an empty term', () => {
    expect(searchAssets(sample, '')).toHaveLength(3)
    expect(searchAssets(sample, '   ')).toHaveLength(3)
  })

  it('matches on name, ignoring case', () => {
    expect(searchAssets(sample, 'macbook').map((a) => a.id)).toEqual(['1'])
  })

  it('matches on tag, holder and notes', () => {
    expect(searchAssets(sample, 'PSU-SV').map((a) => a.id)).toEqual(['3'])
    expect(searchAssets(sample, 'homood').map((a) => a.id)).toEqual(['1'])
    expect(searchAssets(sample, 'spare').map((a) => a.id)).toEqual(['2'])
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchAssets(sample, 'zzzz')).toEqual([])
  })
})

describe('filterAssets', () => {
  it('treats "All" as no filter', () => {
    expect(filterAssets(sample, { category: 'All', status: 'All', department: 'All' })).toHaveLength(3)
  })

  it('filters by a single dimension', () => {
    expect(filterAssets(sample, { status: 'In Use' }).map((a) => a.id)).toEqual(['1', '3'])
  })

  it('combines filters with AND', () => {
    expect(filterAssets(sample, { status: 'In Use', category: 'Server' }).map((a) => a.id)).toEqual(['3'])
  })
})

describe('sortAssets', () => {
  it('sorts strings ascending and descending without mutating the input', () => {
    const originalOrder = sample.map((a) => a.id)
    expect(sortAssets(sample, 'name', 'asc').map((a) => a.name)).toEqual(['Dell Monitor', 'HP Server', 'MacBook Pro'])
    expect(sortAssets(sample, 'name', 'desc').map((a) => a.name)).toEqual(['MacBook Pro', 'HP Server', 'Dell Monitor'])
    expect(sample.map((a) => a.id)).toEqual(originalOrder)
  })

  it('sorts numbers numerically, not lexically', () => {
    expect(sortAssets(sample, 'purchaseCost', 'asc').map((a) => a.purchaseCost)).toEqual([2000, 8000, 40000])
  })

  it('pushes blank values to the end', () => {
    const sorted = sortAssets(sample, 'assignedTo', 'asc')
    expect(sorted[sorted.length - 1].assignedTo).toBe('')
  })
})

describe('queryAssets', () => {
  it('applies search, then filter, then sort', () => {
    const result = queryAssets(sample, {
      term: 'psu',
      filters: { status: 'In Use' },
      sortKey: 'purchaseCost',
      sortDirection: 'desc',
    })
    expect(result.map((a) => a.id)).toEqual(['3', '1'])
  })
})

describe('summarize', () => {
  it('counts totals, groups and sums cost', () => {
    const result = summarize(sample)
    expect(result.total).toBe(3)
    expect(result.byStatus['In Use']).toBe(2)
    expect(result.byCategory.Laptop).toBe(1)
    expect(result.totalValue).toBe(50000)
  })

  it('handles an empty collection', () => {
    expect(summarize([])).toEqual({ total: 0, byStatus: {}, byCategory: {}, totalValue: 0 })
  })
})

describe('formatDate', () => {
  it('renders an em dash for empty or invalid input', () => {
    expect(formatDate('')).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('formats a valid ISO date', () => {
    expect(formatDate('2025-02-11')).toMatch(/2025/)
  })
})
