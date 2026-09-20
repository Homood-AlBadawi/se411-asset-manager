import { STATUS_TONE } from '../data/assetOptions'

/** Small coloured pill that renders an asset status. */
export default function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || 'neutral'
  return <span className={`badge badge--${tone}`}>{status}</span>
}
