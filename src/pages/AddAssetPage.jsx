import { useNavigate } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import AssetForm from '../components/AssetForm'

/** Create. On success the user lands back on the asset list. */
export default function AddAssetPage() {
  const { assets, addAsset } = useAssets()
  const navigate = useNavigate()

  function handleSubmit(values) {
    addAsset(values)
    navigate('/assets')
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Add asset</h1>
          <p className="page-head__sub">Register a new item in the inventory.</p>
        </div>
      </div>

      <div className="card">
        <AssetForm
          existingAssets={assets}
          submitLabel="Add asset"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/assets')}
        />
      </div>
    </section>
  )
}
