import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '../utils/assetUtils'

const COLUMNS = [
  { key: 'tag', label: 'Tag' },
  { key: 'name', label: 'Asset' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'department', label: 'Department' },
  { key: 'assignedTo', label: 'Assigned to' },
  { key: 'purchaseCost', label: 'Cost' },
  { key: 'purchaseDate', label: 'Purchased' },
]

/**
 * The display half of the CRUD requirement: a sortable table of assets with
 * per-row edit and delete actions.
 */
export default function AssetTable({ assets, sortKey, sortDirection, onSort, onDelete }) {
  if (assets.length === 0) {
    return (
      <div className="empty">
        <h3>No assets match your search</h3>
        <p>Try clearing the filters, or add a new asset to the inventory.</p>
        <Link className="btn btn--primary" to="/assets/new">Add asset</Link>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">List of managed IT assets</caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const isSorted = sortKey === column.key
              return (
                <th key={column.key} scope="col" aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="table__sort" onClick={() => onSort(column.key)}>
                    {column.label}
                    <span aria-hidden="true" className="table__arrow">
                      {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              )
            })}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td><code className="tag">{asset.tag}</code></td>
              <td>
                <span className="table__name">{asset.name}</span>
                {asset.location ? <span className="table__sub">{asset.location}</span> : null}
              </td>
              <td>{asset.category}</td>
              <td><StatusBadge status={asset.status} /></td>
              <td>{asset.department}</td>
              <td>{asset.assignedTo || <span className="muted">Unassigned</span>}</td>
              <td className="numeric">{formatCurrency(asset.purchaseCost)}</td>
              <td>{formatDate(asset.purchaseDate)}</td>
              <td>
                <div className="row-actions">
                  <Link className="btn btn--small" to={`/assets/${asset.id}/edit`}>Edit</Link>
                  <button
                    type="button"
                    className="btn btn--small btn--danger"
                    onClick={() => onDelete(asset)}
                    aria-label={`Delete ${asset.name}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
