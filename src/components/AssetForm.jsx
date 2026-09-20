import { useState } from 'react'
import { CATEGORIES, DEPARTMENTS, EMPTY_ASSET, STATUSES } from '../data/assetOptions'
import { validateAsset } from '../utils/assetUtils'

/**
 * One form serves both "add" and "edit".
 *
 * It validates on submit (and clears a field's error as soon as the user fixes
 * it) so the user is never blocked mid-typing. Validation itself lives in
 * assetUtils, not here - this component only decides when to run it.
 */
export default function AssetForm({ initialValues = EMPTY_ASSET, existingAssets = [], editingId = null, submitLabel = 'Save asset', onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY_ASSET, ...initialValues })
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    if (errors[name]) {
      setErrors((previous) => {
        const next = { ...previous }
        delete next[name]
        return next
      })
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateAsset(values, existingAssets, editingId)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    onSubmit(values)
  }

  const errorFor = (field) =>
    errors[field] ? (
      <span className="field__error" role="alert">{errors[field]}</span>
    ) : null

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form__grid">
        <label className="field">
          <span className="field__label">Asset name *</span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="e.g. MacBook Pro 14&quot; M3"
            aria-invalid={Boolean(errors.name)}
          />
          {errorFor('name')}
        </label>

        <label className="field">
          <span className="field__label">Asset tag *</span>
          <input
            name="tag"
            value={values.tag}
            onChange={handleChange}
            placeholder="e.g. PSU-LT-0431"
            aria-invalid={Boolean(errors.tag)}
          />
          {errorFor('tag')}
        </label>

        <label className="field">
          <span className="field__label">Category *</span>
          <select name="category" value={values.category} onChange={handleChange}>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errorFor('category')}
        </label>

        <label className="field">
          <span className="field__label">Status *</span>
          <select name="status" value={values.status} onChange={handleChange}>
            {STATUSES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errorFor('status')}
        </label>

        <label className="field">
          <span className="field__label">Department</span>
          <select name="department" value={values.department} onChange={handleChange}>
            {DEPARTMENTS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Assigned to</span>
          <input name="assignedTo" value={values.assignedTo} onChange={handleChange} placeholder="Employee or team" />
        </label>

        <label className="field">
          <span className="field__label">Location</span>
          <input name="location" value={values.location} onChange={handleChange} placeholder="Building / room" />
        </label>

        <label className="field">
          <span className="field__label">Purchase date</span>
          <input
            type="date"
            name="purchaseDate"
            value={values.purchaseDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.purchaseDate)}
          />
          {errorFor('purchaseDate')}
        </label>

        <label className="field">
          <span className="field__label">Purchase cost (SAR)</span>
          <input
            type="number"
            name="purchaseCost"
            min="0"
            step="1"
            value={values.purchaseCost}
            onChange={handleChange}
            aria-invalid={Boolean(errors.purchaseCost)}
          />
          {errorFor('purchaseCost')}
        </label>

        <label className="field field--full">
          <span className="field__label">Notes</span>
          <textarea name="notes" rows="3" value={values.notes} onChange={handleChange} placeholder="Warranty, condition, anything worth recording" />
          {errorFor('notes')}
        </label>
      </div>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
