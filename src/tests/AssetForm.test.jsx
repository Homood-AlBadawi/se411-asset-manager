import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssetForm from '../components/AssetForm'
import { testAssets } from './renderWithProviders'

const nameField = () => screen.getByLabelText(/asset name/i)
const tagField = () => screen.getByLabelText(/asset tag/i)
const costField = () => screen.getByLabelText(/purchase cost/i)

describe('AssetForm - validation', () => {
  it('blocks submission and reports errors when required fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AssetForm existingAssets={testAssets} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/asset name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/asset tag is required/i)).toBeInTheDocument()
  })

  it('rejects a tag that already exists', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AssetForm existingAssets={testAssets} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(nameField(), 'Another Laptop')
    await user.type(tagField(), 'PSU-LT-001')
    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/already in use/i)).toBeInTheDocument()
  })

  it('rejects a tag containing illegal characters', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AssetForm existingAssets={testAssets} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(nameField(), 'Odd Tag')
    await user.type(tagField(), 'bad tag!')
    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/letters, numbers and dashes/i)).toBeInTheDocument()
  })

  it('rejects a negative purchase cost', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AssetForm existingAssets={testAssets} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(nameField(), 'Cheap Mouse')
    await user.type(tagField(), 'PSU-PE-500')
    await user.type(costField(), '-50')
    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument()
  })

  it('clears a field error once the user corrects it', async () => {
    const user = userEvent.setup()
    render(<AssetForm existingAssets={testAssets} onSubmit={vi.fn()} onCancel={() => {}} />)

    await user.click(screen.getByRole('button', { name: /save asset/i }))
    expect(screen.getByText(/asset name is required/i)).toBeInTheDocument()

    await user.type(nameField(), 'Fixed Name')
    expect(screen.queryByText(/asset name is required/i)).not.toBeInTheDocument()
  })
})

describe('AssetForm - submission', () => {
  it('passes the entered values up when everything is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AssetForm existingAssets={testAssets} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(nameField(), 'New Printer')
    await user.type(tagField(), 'PSU-PR-777')
    await user.selectOptions(screen.getByLabelText(/^category/i), 'Printer')
    await user.type(costField(), '1500')
    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'New Printer',
      tag: 'PSU-PR-777',
      category: 'Printer',
      purchaseCost: '1500',
    })
  })

  it('pre-fills the fields when editing an existing asset', () => {
    render(
      <AssetForm
        initialValues={testAssets[0]}
        existingAssets={testAssets}
        editingId={testAssets[0].id}
        submitLabel="Save changes"
        onSubmit={vi.fn()}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByDisplayValue('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByDisplayValue('PSU-LT-001')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('lets an asset keep its own tag while being edited', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AssetForm
        initialValues={testAssets[0]}
        existingAssets={testAssets}
        editingId={testAssets[0].id}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel without submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<AssetForm existingAssets={testAssets} onSubmit={onSubmit} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows a server 409 under the tag field', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue({ status: 409, message: 'Conflict' })
    render(<AssetForm onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(nameField(), 'Another Laptop')
    await user.type(tagField(), 'PSU-LT-0431')
    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(await screen.findByText(/already in use/i)).toBeInTheDocument()
  })

  it('shows any other server failure as a form-level message', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue({ status: 0, message: 'Cannot reach the backend.' })
    render(<AssetForm onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(nameField(), 'Another Laptop')
    await user.type(tagField(), 'PSU-LT-0999')
    await user.click(screen.getByRole('button', { name: /save asset/i }))

    expect(await screen.findByText('Cannot reach the backend.')).toBeInTheDocument()
  })
})
