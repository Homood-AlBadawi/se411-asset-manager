import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import renderWithProviders, { testAssets } from './renderWithProviders'

describe('Navigation menu', () => {
  it('shows a link to every feature', () => {
    renderWithProviders(<App />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })

    expect(within(nav).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Assets' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Add Asset' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'About' })).toBeInTheDocument()
  })

  it('opens the About page from the menu, with both team members', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    await user.click(within(nav).getByRole('link', { name: 'About' }))

    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('Homood AlBadawi')).toBeInTheDocument()
    expect(screen.getByText(/221110514/)).toBeInTheDocument()
    expect(screen.getByText('Malik Tariq')).toBeInTheDocument()
    expect(screen.getByText(/221110513/)).toBeInTheDocument()
  })
})

describe('Dashboard route', () => {
  it('renders the summary counts from the store', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
    const totalCard = screen.getByText('Total assets').closest('article')
    expect(within(totalCard).getByText(String(testAssets.length))).toBeInTheDocument()
  })
})

describe('End-to-end CRUD through the UI', () => {
  it('adds an asset from the Add Asset page and shows it in the list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/assets/new' })

    await user.type(screen.getByLabelText(/asset name/i), 'Brother Scanner')
    await user.type(screen.getByLabelText(/asset tag/i), 'PSU-PR-900')
    await user.click(screen.getByRole('button', { name: /add asset/i }))

    // Navigated to /assets; the new row is present and the count grew.
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument()
    expect(screen.getByText('Brother Scanner')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`Showing ${testAssets.length + 1} of ${testAssets.length + 1} assets`)
  })

  it('updates an asset through the edit route', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/assets/1/edit' })

    const nameInput = screen.getByLabelText(/asset name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'MacBook Pro M4 Max')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(screen.getByText('MacBook Pro M4 Max')).toBeInTheDocument()
    expect(screen.queryByText('MacBook Pro')).not.toBeInTheDocument()
  })

  it('shows a recoverable message for an unknown asset id', () => {
    renderWithProviders(<App />, { route: '/assets/does-not-exist/edit' })
    expect(screen.getByRole('heading', { name: /asset not found/i })).toBeInTheDocument()
  })

  it('shows a not-found page for an unknown route', () => {
    renderWithProviders(<App />, { route: '/nowhere' })
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
