import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssetsPage from '../pages/AssetsPage'
import renderWithProviders, { testAssets } from './renderWithProviders'

function rowNames() {
  const rows = screen.getAllByRole('row').slice(1) // skip the header row
  return rows.map((row) => within(row).getAllByRole('cell')[1].textContent)
}

describe('AssetsPage - display', () => {
  it('lists every asset from the store', () => {
    renderWithProviders(<AssetsPage />)
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('Dell Monitor')).toBeInTheDocument()
    expect(screen.getByText('HP Server')).toBeInTheDocument()
  })

  it('reports how many assets are visible', () => {
    renderWithProviders(<AssetsPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 3 assets')
  })
})

describe('AssetsPage - search', () => {
  it('narrows the table as the user types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.type(screen.getByRole('searchbox', { name: /search assets/i }), 'server')

    expect(screen.getByText('HP Server')).toBeInTheDocument()
    expect(screen.queryByText('MacBook Pro')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 3 assets')
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.type(screen.getByRole('searchbox', { name: /search assets/i }), 'qqqq')

    expect(screen.getByText(/no assets match your search/i)).toBeInTheDocument()
  })

  it('is cleared by the Clear button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    const box = screen.getByRole('searchbox', { name: /search assets/i })
    await user.type(box, 'server')
    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(box).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 3 assets')
  })
})

describe('AssetsPage - filters', () => {
  it('filters by status', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.selectOptions(screen.getByRole('combobox', { name: /filter by status/i }), 'In Use')

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.queryByText('HP Server')).not.toBeInTheDocument()
  })

  it('combines a category filter with a search term', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.selectOptions(screen.getByRole('combobox', { name: /filter by category/i }), 'Laptop')
    await user.type(screen.getByRole('searchbox', { name: /search assets/i }), 'dell')

    expect(screen.getByText(/no assets match your search/i)).toBeInTheDocument()
  })
})

describe('AssetsPage - sorting', () => {
  it('sorts by name and reverses on a second click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    expect(rowNames()[0]).toContain('Dell Monitor')

    await user.click(screen.getByRole('button', { name: /asset/i }))
    expect(rowNames()[0]).toContain('MacBook Pro')
  })

  it('sorts numerically by cost', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.click(screen.getByRole('button', { name: /cost/i }))
    expect(rowNames()[0]).toContain('Dell Monitor')
  })
})

describe('AssetsPage - delete', () => {
  it('asks for confirmation before removing anything', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.click(screen.getByRole('button', { name: /delete macbook pro/i }))

    expect(screen.getByText(/delete this asset\?/i)).toBeInTheDocument()
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
  })

  it('keeps the asset when the user cancels', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.click(screen.getByRole('button', { name: /delete macbook pro/i }))
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 3 assets')
  })

  it('removes the asset when the user confirms', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AssetsPage />)

    await user.click(screen.getByRole('button', { name: /delete macbook pro/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText('MacBook Pro')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(testAssets.length) // header + 2 remaining
  })
})
