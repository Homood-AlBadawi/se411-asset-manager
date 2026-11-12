import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  API_BASE,
  ApiError,
  createAsset,
  deleteAsset,
  fetchAsset,
  fetchAssetPage,
  toPayload,
  updateAsset,
} from '../api/assetApi'

function respond(status, { body = null, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name] ?? null },
    json: async () => body,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toPayload', () => {
  it('drops the id, trims text and sends empty optionals as null', () => {
    const payload = toPayload({
      id: 7,
      name: '  Laptop ',
      tag: ' PSU-LT-9 ',
      category: 'Laptop',
      status: 'In Use',
      department: 'Engineering',
      assignedTo: '',
      location: '',
      purchaseDate: '',
      purchaseCost: '',
      notes: '',
    })
    expect(payload).not.toHaveProperty('id')
    expect(payload.name).toBe('Laptop')
    expect(payload.tag).toBe('PSU-LT-9')
    expect(payload.purchaseDate).toBeNull()
    expect(payload.purchaseCost).toBeNull()
  })

  it('converts the cost string from the form into a number', () => {
    expect(toPayload({ name: 'x', tag: 'y', purchaseCost: '1450' }).purchaseCost).toBe(1450)
  })
})

describe('fetchAssetPage', () => {
  it('requests the page, size and Spring sort parameter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(200, { body: { content: [], totalElements: 0 } }))
    vi.stubGlobal('fetch', fetchMock)

    await fetchAssetPage({ page: 2, size: 5, sortKey: 'purchaseCost', sortDirection: 'desc' })

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}?page=2&size=5&sort=purchaseCost,desc`, {})
  })

  it('turns a network failure into a readable ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(fetchAssetPage()).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/backend/i) })
  })
})

describe('fetchAsset', () => {
  it('returns the asset on 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(200, { body: { id: 4, name: 'Server' } })))
    expect(await fetchAsset(4)).toEqual({ id: 4, name: 'Server' })
  })

  it('returns null on 404 instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(404)))
    expect(await fetchAsset(99)).toBeNull()
  })
})

describe('createAsset', () => {
  it('POSTs JSON and returns the new id from the Location header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(201, { headers: { Location: 'http://localhost:3000/api/v1/assets/11' } }))
    vi.stubGlobal('fetch', fetchMock)

    const id = await createAsset({ name: 'Printer', tag: 'PSU-PR-1', category: 'Printer', status: 'In Use' })

    expect(id).toBe(11)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(API_BASE)
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(options.body)).toMatchObject({ name: 'Printer', tag: 'PSU-PR-1' })
  })

  it('rejects with status 409 for a duplicate tag', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(409)))

    const error = await createAsset({ name: 'x', tag: 'PSU-LT-0431' }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
  })
})

describe('updateAsset and deleteAsset', () => {
  it('PUTs to /{id}', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(204))
    vi.stubGlobal('fetch', fetchMock)

    await updateAsset(3, { name: 'x', tag: 'y' })

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE}/3`)
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT')
  })

  it('DELETEs /{id} and surfaces a 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(404)))
    await expect(deleteAsset(42)).rejects.toMatchObject({ status: 404 })
  })
})
