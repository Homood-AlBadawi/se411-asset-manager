import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import AssetForm from '../components/AssetForm'

/** Update. A missing or stale id renders a recoverable message, not a crash. */
export default function EditAssetPage() {
  const { id } = useParams()
  const { assets, getAsset, updateAsset } = useAssets()
  const navigate = useNavigate()
  const asset = getAsset(id)

  if (!asset) {
    return (
      <section className="empty">
        <h1>Asset not found</h1>
        <p>It may have been deleted, or the link is out of date.</p>
        <Link className="btn btn--primary" to="/assets">Back to assets</Link>
      </section>
    )
  }

  function handleSubmit(values) {
    updateAsset(asset.id, values)
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
          initialValues={asset}
          existingAssets={assets}
          editingId={asset.id}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/assets')}
        />
      </div>
    </section>
  )
}
