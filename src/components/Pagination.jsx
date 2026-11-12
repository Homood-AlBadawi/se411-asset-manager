/**
 * Page controls for the asset table. `page` is zero-based, matching Spring's
 * Page.number, but it is shown to the user one-based.
 */
const PAGE_SIZES = [5, 10, 20]

export default function Pagination({ page, totalPages, totalElements, size, onPageChange, onSizeChange }) {
  const pages = Math.max(totalPages, 1)
  const isFirst = page <= 0
  const isLast = page >= pages - 1

  return (
    <nav className="pagination" aria-label="Pagination">
      <div className="pagination__info">
        Page <strong>{page + 1}</strong> of {pages} · {totalElements} assets
      </div>

      <div className="pagination__controls">
        <button type="button" className="btn btn--small" onClick={() => onPageChange(0)} disabled={isFirst}>
          « First
        </button>
        <button type="button" className="btn btn--small" onClick={() => onPageChange(page - 1)} disabled={isFirst}>
          ‹ Previous
        </button>
        <button type="button" className="btn btn--small" onClick={() => onPageChange(page + 1)} disabled={isLast}>
          Next ›
        </button>
        <button type="button" className="btn btn--small" onClick={() => onPageChange(pages - 1)} disabled={isLast}>
          Last »
        </button>
      </div>

      <label className="pagination__size">
        <span>Per page</span>
        <select value={size} onChange={(event) => onSizeChange(Number(event.target.value))} aria-label="Assets per page">
          {PAGE_SIZES.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </nav>
  )
}
