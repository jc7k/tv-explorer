import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'

// Extend expect with axe matchers
expect.extend(toHaveNoViolations)

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_TMDB_API_KEY: 'test_api_key',
    VITE_TMDB_BASE_URL: 'https://api.themoviedb.org/3'
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock requestIdleCallback for axe-core
global.requestIdleCallback = global.requestIdleCallback || function (cb) {
  return setTimeout(cb, 0)
}

global.cancelIdleCallback = global.cancelIdleCallback || function (id) {
  clearTimeout(id)
}