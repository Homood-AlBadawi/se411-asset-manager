/**
 * The single place where the asset collection changes shape.
 *
 * A reducer rather than a pile of useState setters, because every write goes
 * through one switch: that makes the create/update/delete rules readable, keeps
 * them pure, and lets the test suite exercise them without rendering anything.
 */

import { generateId, normalizeAsset } from '../utils/assetUtils'

export const ACTIONS = {
  ADD: 'asset/add',
  UPDATE: 'asset/update',
  DELETE: 'asset/delete',
  RESET: 'asset/reset',
}

/** Coerce a raw form draft into the stored asset shape. */
function toStoredAsset(draft) {
  const clean = normalizeAsset(draft)
  return {
    ...clean,
    purchaseCost: clean.purchaseCost === '' || clean.purchaseCost === null ? '' : Number(clean.purchaseCost),
  }
}

export function assetReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const now = new Date().toISOString()
      const asset = {
        ...toStoredAsset(action.payload),
        id: action.payload.id || generateId(),
        createdAt: now,
        updatedAt: now,
      }
      return [asset, ...state]
    }

    case ACTIONS.UPDATE: {
      const { id, changes } = action.payload
      return state.map((asset) =>
        asset.id === id
          ? { ...asset, ...toStoredAsset(changes), id: asset.id, createdAt: asset.createdAt, updatedAt: new Date().toISOString() }
          : asset,
      )
    }

    case ACTIONS.DELETE:
      return state.filter((asset) => asset.id !== action.payload.id)

    case ACTIONS.RESET:
      return action.payload.assets

    default:
      return state
  }
}
