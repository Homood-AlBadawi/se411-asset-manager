import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import { queryAssets } from '../utils/assetUtils'
import SearchBar from '../components/SearchBar'
import AssetTable from '../components/AssetTable'
import Pagination from '../components/Pagination'
import FindById from '../components/FindById'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'

const DEFAULT_FILTERS = { category: 'All', status: 'All', department: 'All' }
const EMPTY_PAGE = { content: [], number: 0, totalPages: 1, totalElements: 0 }

/**
 * Browse, search, filter, sort, paginate and delete.
 *
 * Two data paths:
 * - No search text and no filters: the server does the work. The page asks
 *   GET /api/v1/assets?page=&size=&sort= and shows exactly the Page it gets back.
 * - Search text or a filter is active: the backend has no text-search endpoint,
 *   so the page fetches every asset once, filters with the Part 1 helpers, and
 *   paginates the matches locally with the same controls.
 */
export default function AssetsPage() {
  const { version, fetchAssetPage, fetchAllAssets, getAsset, deleteAsset } = useAssets()

  const [term, setTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const [result, setResult] = useState(EMPTY_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [found, setFound] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [toast, setToast] = useState('')

  const searching = useMemo(
    () => term.trim() !== '' || Object.values(filters).some((value) => value !== 'All'),
    [term, filters],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const load = searching
      ? fetchAllAssets({ sortKey, sortDirection }).then((all) => {
          const matches = queryAssets(all, { term, filters, sortKey, sortDirection })
          const totalPages = Math.max(1, Math.ceil(matches.length / size))
          const number = Math.min(page, totalPages - 1)
          return {
            content: matches.slice(number * size, number * size + size),
            number,
            totalPages,
            totalElements: matches.length,
          }
        })
      : fetchAssetPage({ page, size, sortKey, sortDirection })

    load
      .then((data) => {
        if (cancelled) return
        // Deleting the last row on the last page leaves an empty page: step back one.
        if (data.content.length === 0 && data.number > 0) {
          setPage(data.number - 1)
          return
        }
        setResult(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setResult(EMPTY_PAGE)
          setError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [searching, term, filters, sortKey, sortDirection, page, size, version, fetchAssetPage, fetchAllAssets])

  function handleTermChange(value) {
    setTerm(value)
    setPage(0)
  }

  function handleFilterChange(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setPage(0)
  }

  function handleReset() {
    setTerm('')
    setFilters(DEFAULT_FILTERS)
    setPage(0)
  }

  function handleSort(key) {
    if (key === sortKey) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
    setPage(0)
  }

  function handleSizeChange(nextSize) {
    setSize(nextSize)
    setPage(0)
  }

  async function handleFind(id) {
    try {
      const asset = await getAsset(id)
      setFound({ id, asset })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    try {
      await deleteAsset(target.id)
      setToast(`Deleted "${target.name}".`)
      if (found?.asset?.id === target.id) setFound(null)
    } catch (err) {
      setToast(err.message)
    }
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

      {error ? <div className="alert">{error}</div> : null}

      <FindById onFind={handleFind} onClear={() => setFound(null)} active={Boolean(found)} />

      {found ? (
        <section className="found" aria-label="Find by ID result">
          {found.asset ? (
            <AssetTable
              assets={[found.asset]}
              sortKey={null}
              sortDirection="asc"
              onSort={() => {}}
              onDelete={setPendingDelete}
            />
          ) : (
            <div className="empty empty--compact">
              <p>No asset with ID {found.id}.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          <SearchBar
            term={term}
            filters={filters}
            onTermChange={handleTermChange}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            resultCount={result.content.length}
            totalCount={result.totalElements}
          />

          <div className={loading ? 'is-loading' : undefined} aria-busy={loading}>
            <AssetTable
              assets={result.content}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              onDelete={setPendingDelete}
            />
          </div>

          <Pagination
            page={result.number}
            totalPages={result.totalPages}
            totalElements={result.totalElements}
            size={size}
            onPageChange={setPage}
            onSizeChange={handleSizeChange}
          />
        </>
      )}

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
