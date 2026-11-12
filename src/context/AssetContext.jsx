/**
 * Application-wide access to the asset API.
 *
 * Part 1 kept the assets themselves here, in a useReducer seeded from a local
 * array. In Part 2 the data lives in the Spring backend, so this context now
 * exposes the API operations instead, plus a `version` number that increases
 * after every successful write. Pages that show lists include `version` in
 * their effect dependencies, so they refetch automatically after an add,
 * update or delete.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../api/assetApi'

const AssetContext = createContext(null)

export function AssetProvider({ children }) {
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const addAsset = useCallback(async (draft) => {
    const id = await api.createAsset(draft)
    bump()
    return id
  }, [bump])

  const updateAsset = useCallback(async (id, draft) => {
    await api.updateAsset(id, draft)
    bump()
  }, [bump])

  const deleteAsset = useCallback(async (id) => {
    await api.deleteAsset(id)
    bump()
  }, [bump])

  const value = useMemo(
    () => ({
      version,
      fetchAssetPage: api.fetchAssetPage,
      fetchAllAssets: api.fetchAllAssets,
      getAsset: api.fetchAsset,
      addAsset,
      updateAsset,
      deleteAsset,
    }),
    [version, addAsset, updateAsset, deleteAsset],
  )

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}

/** Read the asset API. Throws early if a component is rendered outside the provider. */
export function useAssets() {
  const context = useContext(AssetContext)
  if (!context) {
    throw new Error('useAssets must be used inside an <AssetProvider>.')
  }
  return context
}

export default AssetContext
