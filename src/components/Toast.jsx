import { useEffect } from 'react'

/** Transient confirmation message ("Asset added", "Asset deleted"). */
export default function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, onDismiss, duration])

  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
      <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss message">×</button>
    </div>
  )
}
