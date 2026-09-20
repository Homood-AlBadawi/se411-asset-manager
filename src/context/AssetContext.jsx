/**
 * Application-wide asset store.
 *
 * Context + useReducer is enough for a collection this size, and it keeps the
 * data layer behind a narrow interface (addAsset / updateAsset / deleteAsset /
 * getAsset). In Part 2 the bodies of those four functions become HTTP calls and
 * no component needs to change.
 */

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import { ACTIONS, assetReducer } from './assetReducer'
import seedAssets from '../data/seedAssets'

const AssetContext = createContext(null)

export function AssetProvider({ children, initialAssets = seedAssets }) {
  const [assets, dispatch] = useReducer(assetReducer, initialAssets)

  const addAsset = useCallback((draft) => {
    dispatch({ type: ACTIONS.ADD, payload: draft })
  }, [])

  const updateAsset = useCallback((id, changes) => {
    dispatch({ type: ACTIONS.UPDATE, payload: { id, changes } })
  }, [])

  const deleteAsset = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE, payload: { id } })
  }, [])

  const resetAssets = useCallback((nextAssets = seedAssets) => {
    dispatch({ type: ACTIONS.RESET, payload: { assets: nextAssets } })
  }, [])

  const getAsset = useCallback((id) => assets.find((asset) => asset.id === id) || null, [assets])

  const value = useMemo(
    () => ({ assets, addAsset, updateAsset, deleteAsset, resetAssets, getAsset }),
    [assets, addAsset, updateAsset, deleteAsset, resetAssets, getAsset],
  )

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}

/** Read the asset store. Throws early if a component is rendered outside the provider. */
export function useAssets() {
  const context = useContext(AssetContext)
  if (!context) {
    throw new Error('useAssets must be used inside an <AssetProvider>.')
  }
  return context
}

export default AssetContext
