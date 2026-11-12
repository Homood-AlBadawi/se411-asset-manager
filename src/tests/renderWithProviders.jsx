import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AssetProvider } from '../context/AssetContext'
import { resetFakeApi } from './fakeApi'

/**
 * Render a component inside the router and asset provider, with the fake API
 * seeded from a small deterministic fixture. Test files that use this must
 * also call vi.mock('../api/assetApi', () => import('./fakeApi')).
 */
export const testAssets = [
  { id: 1, name: 'MacBook Pro', tag: 'PSU-LT-001', category: 'Laptop', status: 'In Use', department: 'Engineering', assignedTo: 'Homood', location: 'Lab 3', purchaseCost: 8000, purchaseDate: '2025-01-01', notes: '' },
  { id: 2, name: 'Dell Monitor', tag: 'PSU-MN-002', category: 'Monitor', status: 'In Storage', department: 'Finance', assignedTo: '', location: 'Store', purchaseCost: 2000, purchaseDate: '2024-06-01', notes: 'spare unit' },
  { id: 3, name: 'HP Server', tag: 'PSU-SV-003', category: 'Server', status: 'Under Maintenance', department: 'Information Technology', assignedTo: 'IT Ops', location: 'Rack 2', purchaseCost: 40000, purchaseDate: '2023-03-01', notes: '' },
]

export default function renderWithProviders(ui, { assets = testAssets, route = '/' } = {}) {
  resetFakeApi(assets)
  return render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AssetProvider>{ui}</AssetProvider>
    </MemoryRouter>,
  )
}
