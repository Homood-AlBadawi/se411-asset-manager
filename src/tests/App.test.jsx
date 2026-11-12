import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import renderWithProviders, { testAssets } from './renderWithProviders'

vi.mock('../api/assetApi', () => import('./fakeApi'))

describe('Navigation menu', () => {
  it('shows a link to every feature', async () => {
    renderWithProviders(<App />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    const totalCard = screen.getByText('Total assets').closest('article')
    await waitFor(() => expect(within(totalCard).getByText(String(testAssets.length))).toBeInTheDocument())

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
  it('renders the summary counts from the API', async () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
    const totalCard = screen.getByText('Total assets').closest('article')
    await waitFor(() => expect(within(totalCard).getByText(String(testAssets.length))).toBeInTheDocument())
  })
})

describe('End-to-end CRUD through the UI', () => {
  it('adds an asset from the Add Asset page and shows it in the list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/assets/new' })

    await user.type(screen.getByLabelText(/asset name/i), 'Brother Scanner')
    await user.type(screen.getByLabelText(/asset tag/i), 'PSU-PR-900')
    await user.click(screen.getByRole('button', { name: /add asset/i }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument()
    expect(await screen.findByText('Brother Scanner')).toBeInTheDocument()
  })

  it('shows the server 409 under the tag field when the tag is already taken', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/assets/new' })

    await user.type(screen.getByLabelText(/asset name/i), 'Second MacBook')
    await user.type(screen.getByLabelText(/asset tag/i), 'PSU-LT-001')
    await user.click(screen.getByRole('button', { name: /add asset/i }))

    expect(await screen.findByText(/already in use/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Add asset' })).toBeInTheDocument()
  })

  it('loads an asset by id on the edit route and saves the update', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/assets/1/edit' })

    const nameInput = await screen.findByLabelText(/asset name/i)
    expect(nameInput).toHaveValue('MacBook Pro')

    await user.clear(nameInput)
    await user.type(nameInput, 'MacBook Pro M4 Max')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('MacBook Pro M4 Max')).toBeInTheDocument()
    expect(screen.queryByText('MacBook Pro')).not.toBeInTheDocument()
  })

  it('shows a recoverable message for an unknown asset id', async () => {
    renderWithProviders(<App />, { route: '/assets/999/edit' })
    expect(await screen.findByRole('heading', { name: /asset not found/i })).toBeInTheDocument()
  })

  it('shows a not-found page for an unknown route', () => {
    renderWithProviders(<App />, { route: '/nowhere' })
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
