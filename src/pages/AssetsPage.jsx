import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import { queryAssets } from '../utils/assetUtils'
import SearchBar from '../components/SearchBar'
import AssetTable from '../components/AssetTable'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'

const DEFAULT_FILTERS = { category: 'All', status: 'All', department: 'All' }

/** Browse, search, filter, sort and delete. Editing hands off to EditAssetPage. */
export default function AssetsPage() {
  const { assets, deleteAsset } = useAssets()

  const [term, setTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [toast, setToast] = useState('')

  // Recomputed only when an input actually changes, not on every render.
  const visibleAssets = useMemo(
    () => queryAssets(assets, { term, filters, sortKey, sortDirection }),
    [assets, term, filters, sortKey, sortDirection],
  )

  function handleFilterChange(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }

  function handleReset() {
    setTerm('')
    setFilters(DEFAULT_FILTERS)
  }

  function handleSort(key) {
    if (key === sortKey) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    deleteAsset(pendingDelete.id)
    setToast(`Deleted "${pendingDelete.name}".`)
    setPendingDelete(null)
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Assets</h1>
          <p className="page-head__sub">Search, update and remove items in the inventory.</p>
        </div>
        <Link className="btn btn--primary" to="/assets/new">Add asset</Link>
      </div>

      <SearchBar
        term={term}
        filters={filters}
        onTermChange={setTerm}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        resultCount={visibleAssets.length}
        totalCount={assets.length}
      />

      <AssetTable
        assets={visibleAssets}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this asset?"
        message={pendingDelete ? `"${pendingDelete.name}" (${pendingDelete.tag}) will be removed from the inventory. This cannot be undone.` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Toast message={toast} onDismiss={() => setToast('')} />
    </section>
  )
}
