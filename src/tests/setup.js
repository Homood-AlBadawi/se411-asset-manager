import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React Testing Library does not auto-clean when globals are enabled through
// Vite's config rather than a test framework preset, so unmount explicitly.
afterEach(() => {
  cleanup()
})
