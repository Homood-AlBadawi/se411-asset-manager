/**
 * Domain vocabulary for the IT asset catalogue.
 *
 * Keeping these lists in one module means the form <select>s, the filter
 * dropdowns, the validation rules and the tests all read from a single source
 * of truth. Adding a new category is a one-line change here.
 */

export const CATEGORIES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Server',
  'Printer',
  'Networking',
  'Mobile Device',
  'Peripheral',
]

export const STATUSES = ['In Use', 'In Storage', 'Under Maintenance', 'Retired']

export const DEPARTMENTS = [
  'Information Technology',
  'Engineering',
  'Finance',
  'Human Resources',
  'Marketing',
  'Operations',
  'Unassigned',
]

/** Colour token used by the status badge. Keeps CSS class names out of JSX. */
export const STATUS_TONE = {
  'In Use': 'success',
  'In Storage': 'neutral',
  'Under Maintenance': 'warning',
  Retired: 'danger',
}

/** Shape of a brand new asset before the user types anything. */
export const EMPTY_ASSET = {
  name: '',
  tag: '',
  category: CATEGORIES[0],
  status: STATUSES[0],
  department: DEPARTMENTS[0],
  assignedTo: '',
  location: '',
  purchaseDate: '',
  purchaseCost: '',
  notes: '',
}
