import { Link } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import { formatCurrency, summarize } from '../utils/assetUtils'
import { STATUSES } from '../data/assetOptions'
import StatusBadge from '../components/StatusBadge'

/** Landing page: headline counts plus a breakdown by status and category. */
export default function Dashboard() {
  const { assets } = useAssets()
  const { total, byStatus, byCategory, totalValue } = summarize(assets)
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const largest = categories.length > 0 ? categories[0][1] : 1

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="page-head__sub">An overview of everything currently in the inventory.</p>
        </div>
        <Link className="btn btn--primary" to="/assets/new">Add asset</Link>
      </div>

      <div className="stats">
        <article className="stat">
          <span className="stat__label">Total assets</span>
          <span className="stat__value">{total}</span>
        </article>
        <article className="stat">
          <span className="stat__label">In use</span>
          <span className="stat__value">{byStatus['In Use'] || 0}</span>
        </article>
        <article className="stat">
          <span className="stat__label">Under maintenance</span>
          <span className="stat__value">{byStatus['Under Maintenance'] || 0}</span>
        </article>
        <article className="stat">
          <span className="stat__label">Total purchase value</span>
          <span className="stat__value stat__value--small">{formatCurrency(totalValue)}</span>
        </article>
      </div>

      <div className="panels">
        <section className="panel">
          <h2>By status</h2>
          <ul className="status-list">
            {STATUSES.map((status) => (
              <li key={status}>
                <StatusBadge status={status} />
                <span className="status-list__count">{byStatus[status] || 0}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>By category</h2>
          {categories.length === 0 ? (
            <p className="muted">No assets yet.</p>
          ) : (
            <ul className="bar-list">
              {categories.map(([category, count]) => (
                <li key={category}>
                  <span className="bar-list__label">{category}</span>
                  <span className="bar-list__track">
                    <span className="bar-list__fill" style={{ width: `${(count / largest) * 100}%` }} />
                  </span>
                  <span className="bar-list__count">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
