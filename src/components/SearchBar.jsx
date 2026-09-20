import { CATEGORIES, DEPARTMENTS, STATUSES } from '../data/assetOptions'

/**
 * Search box plus the three filter dropdowns.
 *
 * Fully controlled: it owns no state of its own, it only reports changes
 * upward. That keeps the filtering logic in one place (AssetsPage) and makes
 * this component trivial to test.
 */
export default function SearchBar({ term, filters, onTermChange, onFilterChange, onReset, resultCount, totalCount }) {
  return (
    <section className="toolbar" aria-label="Search and filter assets">
      <div className="toolbar__search">
        <label className="field">
          <span className="field__label">Search</span>
          <input
            type="search"
            value={term}
            placeholder="Search by name, tag, holder, location…"
            onChange={(event) => onTermChange(event.target.value)}
            aria-label="Search assets"
          />
        </label>
      </div>

      <div className="toolbar__filters">
        <label className="field">
          <span className="field__label">Category</span>
          <select
            value={filters.category}
            onChange={(event) => onFilterChange('category', event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Status</span>
          <select
            value={filters.status}
            onChange={(event) => onFilterChange('status', event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Department</span>
          <select
            value={filters.department}
            onChange={(event) => onFilterChange('department', event.target.value)}
            aria-label="Filter by department"
          >
            <option value="All">All departments</option>
            {DEPARTMENTS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="toolbar__meta">
        <p className="toolbar__count" role="status">
          Showing <strong>{resultCount}</strong> of {totalCount} assets
        </p>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Clear
        </button>
      </div>
    </section>
  )
}
