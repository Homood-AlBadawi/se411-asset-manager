import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import AssetForm from '../components/AssetForm'

/** The API sends null for empty optional fields; form inputs need strings. */
function toFormValues(asset) {
  const values = {}
  for (const [key, value] of Object.entries(asset)) {
    values[key] = value === null || value === undefined ? '' : value
  }
  return values
}

/**
 * Update. Loads the asset with GET /api/v1/assets/{id}, saves with PUT.
 * A missing or stale id renders a recoverable message, not a crash.
 */
export default function EditAssetPage() {
  const { id } = useParams()
  const { getAsset, updateAsset } = useAssets()
  const navigate = useNavigate()

  const [asset, setAsset] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getAsset(id)
      .then((loaded) => {
        if (cancelled) return
        setAsset(loaded)
        setStatus(loaded ? 'ready' : 'missing')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [id, getAsset])

  if (status === 'loading') {
    return <p className="muted">Loading asset…</p>
  }

  if (status === 'error') {
    return <div className="alert">{error}</div>
  }

  if (status === 'missing') {
    return (
      <section className="empty">
        <h1>Asset not found</h1>
        <p>It may have been deleted, or the link is out of date.</p>
        <Link className="btn btn--primary" to="/assets">Back to assets</Link>
      </section>
    )
  }

  async function handleSubmit(values) {
    await updateAsset(asset.id, values)
    navigate('/assets')
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Edit asset</h1>
          <p className="page-head__sub">
            Updating <strong>{asset.name}</strong> <code className="tag">{asset.tag}</code>
          </p>
        </div>
      </div>

      <div className="card">
        <AssetForm
          initialValues={toFormValues(asset)}
          editingId={asset.id}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/assets')}
        />
      </div>
    </section>
  )
}
