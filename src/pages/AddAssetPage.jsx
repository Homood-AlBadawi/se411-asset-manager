import { useNavigate } from 'react-router-dom'
import { useAssets } from '../context/AssetContext'
import AssetForm from '../components/AssetForm'

/**
 * Create. Sends POST /api/v1/assets; on success the user lands back on the list.
 * Tag uniqueness is enforced by the database — a duplicate comes back as 409 and
 * AssetForm shows it under the tag field.
 */
export default function AddAssetPage() {
  const { addAsset } = useAssets()
  const navigate = useNavigate()

  async function handleSubmit(values) {
    await addAsset(values)
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
          submitLabel="Add asset"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/assets')}
        />
      </div>
    </section>
  )
}
