import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssetsPage from '../pages/AssetsPage'
import renderWithProviders, { testAssets } from './renderWithProviders'

vi.mock('../api/assetApi', () => import('./fakeApi'))

function rowNames() {
  const rows = screen.getAllByRole('row').slice(1) // skip the header row
  return rows.map((row) => within(row).getAllByRole('cell')[1].querySelector('.table__name').textContent)
}

function countText() {
  return screen.getByText(/^Showing/).closest('p')
}

/** Twelve assets, enough to need a second page at the default size of 10. */
const manyAssets = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Asset ${String(i + 1).padStart(2, '0')}`,
  tag: `PSU-XX-${String(i + 1).padStart(3, '0')}`,
  category: 'Laptop',
  status: 'In Use',
  department: 'Engineering',
  assignedTo: '',
  location: '',
  purchaseCost: 1000 + i,
  purchaseDate: '2025-01-01',
  notes: '',
}))

describe('AssetsPage - display', () => {
  it('lists every asset returned by the API', async () => {
    renderWithProviders(<AssetsPage />)
    expect(await screen.findByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('Dell Monitor')).toBeInTheDocument()
    expect(screen.getByText('HP Server')).toBeInTheDocument()
  })

  it('reports how many assets are visible', async () => {
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')
    expect(countText()).toHaveTextContent('Showing 3 of 3 assets')
  })
})

describe('AssetsPage - pagination', () => {
  it('shows the first page of 10 and moves to page 2 with Next', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />, { assets: manyAssets })

    await screen.findByText('Asset 01')
    expect(rowNames()).toHaveLength(10)
    expect(screen.getByText(/Page/).closest('div')).toHaveTextContent('Page 1 of 2 · 12 assets')

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(await screen.findByText('Asset 11')).toBeInTheDocument()
    expect(rowNames()).toEqual(['Asset 11', 'Asset 12'])
    expect(screen.queryByText('Asset 01')).not.toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />, { assets: manyAssets })
    await screen.findByText('Asset 01')

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /last/i }))
    await screen.findByText('Asset 12')
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('changes the page size', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />, { assets: manyAssets })
    await screen.findByText('Asset 01')

    await user.selectOptions(screen.getByRole('combobox', { name: /assets per page/i }), '5')

    await waitFor(() => expect(rowNames()).toHaveLength(5))
    expect(screen.getByText(/Page/).closest('div')).toHaveTextContent('Page 1 of 3')
  })
})

describe('AssetsPage - find by id', () => {
  it('shows the matching asset for a known id', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.type(screen.getByRole('spinbutton', { name: /asset id/i }), '3')
    await user.click(screen.getByRole('button', { name: /^find$/i }))

    const result = await screen.findByRole('region', { name: /find by id result/i })
    expect(within(result).getByText('HP Server')).toBeInTheDocument()
    expect(within(result).queryByText('MacBook Pro')).not.toBeInTheDocument()
  })

  it('says so when no asset has that id', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.type(screen.getByRole('spinbutton', { name: /asset id/i }), '99')
    await user.click(screen.getByRole('button', { name: /^find$/i }))

    expect(await screen.findByText('No asset with ID 99.')).toBeInTheDocument()
  })

  it('returns to the full list with Show all', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.type(screen.getByRole('spinbutton', { name: /asset id/i }), '3')
    await user.click(screen.getByRole('button', { name: /^find$/i }))
    await screen.findByRole('region', { name: /find by id result/i })
    await user.click(screen.getByRole('button', { name: /show all/i }))

    expect(await screen.findByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('Dell Monitor')).toBeInTheDocument()
  })
})

describe('AssetsPage - search and filters', () => {
  it('narrows the table as the user types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.type(screen.getByRole('searchbox', { name: /search assets/i }), 'server')

    await waitFor(() => expect(screen.queryByText('MacBook Pro')).not.toBeInTheDocument())
    expect(screen.getByText('HP Server')).toBeInTheDocument()
    expect(countText()).toHaveTextContent('Showing 1 of 1 assets')
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.type(screen.getByRole('searchbox', { name: /search assets/i }), 'qqqq')

    expect(await screen.findByText(/no assets match your search/i)).toBeInTheDocument()
  })

  it('searches across every page, not just the current one', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />, { assets: manyAssets })
    await screen.findByText('Asset 01')

    await user.type(screen.getByRole('searchbox', { name: /search assets/i }), 'Asset 12')

    expect(await screen.findByText('Asset 12')).toBeInTheDocument()
    await waitFor(() => expect(rowNames()).toEqual(['Asset 12']))
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.selectOptions(screen.getByRole('combobox', { name: /filter by status/i }), 'In Use')

    await waitFor(() => expect(screen.queryByText('HP Server')).not.toBeInTheDocument())
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
  })

  it('is cleared by the Clear button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    const box = screen.getByRole('searchbox', { name: /search assets/i })
    await user.type(box, 'server')
    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(box).toHaveValue('')
    await waitFor(() => expect(countText()).toHaveTextContent('Showing 3 of 3 assets'))
  })
})

describe('AssetsPage - sorting', () => {
  it('sorts by name and reverses on a second click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    expect(rowNames()[0]).toContain('Dell Monitor')

    await user.click(screen.getByRole('button', { name: /^asset/i }))
    await waitFor(() => expect(rowNames()[0]).toContain('MacBook Pro'))
  })

  it('sorts numerically by cost', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.click(screen.getByRole('button', { name: /cost/i }))
    await waitFor(() => expect(rowNames()).toEqual(['Dell Monitor', 'MacBook Pro', 'HP Server']))
  })
})

describe('AssetsPage - delete', () => {
  it('asks for confirmation before removing anything', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.click(screen.getByRole('button', { name: /delete macbook pro/i }))

    expect(screen.getByText(/delete this asset\?/i)).toBeInTheDocument()
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
  })

  it('keeps the asset when the user cancels', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.click(screen.getByRole('button', { name: /delete macbook pro/i }))
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(countText()).toHaveTextContent('Showing 3 of 3 assets')
  })

  it('removes the asset when the user confirms, and refetches the list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)
    await screen.findByText('MacBook Pro')

    await user.click(screen.getByRole('button', { name: /delete macbook pro/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(screen.queryByText('MacBook Pro')).not.toBeInTheDocument())
    expect(screen.getAllByRole('row')).toHaveLength(testAssets.length) // header + 2 remaining
    expect(screen.getByText('Deleted "MacBook Pro".')).toBeInTheDocument()
  })
})
