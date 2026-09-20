import { useEffect, useRef } from 'react'

/**
 * Confirmation step in front of every delete.
 *
 * Uses the native <dialog> element so focus trapping and Escape-to-close are
 * handled by the browser rather than by hand-rolled key listeners.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      // jsdom implements showModal only in newer versions; fall back to show().
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  if (!open) return null

  return (
    <dialog className="dialog" ref={dialogRef} onCancel={onCancel} aria-labelledby="confirm-title">
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="dialog__actions">
        <button type="button" className="btn btn--danger" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
      </div>
    </dialog>
  )
}
