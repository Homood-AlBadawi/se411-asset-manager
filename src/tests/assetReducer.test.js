import { describe, expect, it } from 'vitest'
import { ACTIONS, assetReducer } from '../context/assetReducer'

const initial = [
  { id: '1', name: 'MacBook Pro', tag: 'PSU-LT-001', category: 'Laptop', status: 'In Use', purchaseCost: 8000, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', name: 'Dell Monitor', tag: 'PSU-MN-002', category: 'Monitor', status: 'In Storage', purchaseCost: 2000, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
]

describe('assetReducer - ADD', () => {
  it('prepends the new asset and gives it an id and timestamps', () => {
    const next = assetReducer(initial, {
      type: ACTIONS.ADD,
      payload: { name: 'New Printer', tag: 'PSU-PR-010', category: 'Printer', status: 'In Use', purchaseCost: '1500' },
    })

    expect(next).toHaveLength(3)
    expect(next[0].name).toBe('New Printer')
    expect(next[0].id).toBeTruthy()
    expect(next[0].createdAt).toBeTruthy()
    expect(next[0].updatedAt).toBe(next[0].createdAt)
  })

  it('converts the cost from a form string to a number', () => {
    const next = assetReducer(initial, {
      type: ACTIONS.ADD,
      payload: { name: 'X', tag: 'T-1', category: 'Laptop', status: 'In Use', purchaseCost: '1500' },
    })
    expect(next[0].purchaseCost).toBe(1500)
  })

  it('trims whitespace off text fields', () => {
    const next = assetReducer(initial, {
      type: ACTIONS.ADD,
      payload: { name: '  Padded  ', tag: ' T-2 ', category: 'Laptop', status: 'In Use', purchaseCost: '' },
    })
    expect(next[0].name).toBe('Padded')
    expect(next[0].tag).toBe('T-2')
  })

  it('does not mutate the previous state', () => {
    assetReducer(initial, { type: ACTIONS.ADD, payload: { name: 'Y', tag: 'T-3', category: 'Laptop', status: 'In Use' } })
    expect(initial).toHaveLength(2)
  })
})

describe('assetReducer - UPDATE', () => {
  it('changes only the targeted asset', () => {
    const next = assetReducer(initial, {
      type: ACTIONS.UPDATE,
      payload: { id: '1', changes: { name: 'MacBook Pro M4', status: 'Under Maintenance' } },
    })

    expect(next[0].name).toBe('MacBook Pro M4')
    expect(next[0].status).toBe('Under Maintenance')
    expect(next[1]).toEqual(initial[1])
  })

  it('preserves id and createdAt but refreshes updatedAt', () => {
    const next = assetReducer(initial, {
      type: ACTIONS.UPDATE,
      payload: { id: '1', changes: { id: 'hacked', createdAt: '1999-01-01T00:00:00.000Z', name: 'Renamed' } },
    })

    expect(next[0].id).toBe('1')
    expect(next[0].createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(next[0].updatedAt).not.toBe('2024-01-01T00:00:00.000Z')
  })

  it('is a no-op for an unknown id', () => {
    const next = assetReducer(initial, { type: ACTIONS.UPDATE, payload: { id: 'nope', changes: { name: 'X' } } })
    expect(next).toEqual(initial)
  })
})

describe('assetReducer - DELETE', () => {
  it('removes the matching asset', () => {
    const next = assetReducer(initial, { type: ACTIONS.DELETE, payload: { id: '1' } })
    expect(next).toHaveLength(1)
    expect(next[0].id).toBe('2')
  })

  it('leaves the collection alone for an unknown id', () => {
    expect(assetReducer(initial, { type: ACTIONS.DELETE, payload: { id: 'nope' } })).toHaveLength(2)
  })
})

describe('assetReducer - RESET and unknown actions', () => {
  it('replaces the whole collection on RESET', () => {
    const next = assetReducer(initial, { type: ACTIONS.RESET, payload: { assets: [] } })
    expect(next).toEqual([])
  })

  it('returns the same state for an unrecognised action', () => {
    expect(assetReducer(initial, { type: 'nonsense' })).toBe(initial)
  })
})
