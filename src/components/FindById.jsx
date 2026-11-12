import { useState } from 'react'

/**
 * "Search for an element by id" — requirement 3 of the Part 2 brief.
 * Calls GET /api/v1/assets/{id} through the onFind callback.
 */
export default function FindById({ onFind, onClear, active }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const id = Number(value)
    if (!Number.isInteger(id) || id < 1) {
      setError('Enter a whole number greater than 0.')
      return
    }
    setError('')
    onFind(id)
  }

  function handleClear() {
    setValue('')
    setError('')
    onClear()
  }

  return (
    <form className="find-by-id" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Find by ID</span>
        <input
          type="number"
          min="1"
          step="1"
          value={value}
          placeholder="e.g. 4"
          onChange={(event) => setValue(event.target.value)}
          aria-label="Asset ID"
        />
      </label>
      <button type="submit" className="btn btn--primary">Find</button>
      {active ? (
        <button type="button" className="btn btn--ghost" onClick={handleClear}>Show all</button>
      ) : null}
      {error ? <span className="field__error" role="alert">{error}</span> : null}
    </form>
  )
}
