import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, useCachedValue } from '../useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current[0]).toBe('initial')
  })

  it('returns value from localStorage when available', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current[0]).toBe('stored-value')
  })

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('updated-value')
    })
    
    expect(result.current[0]).toBe('updated-value')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('updated-value')
    )
  })

  it('handles function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })
    
    expect(result.current[0]).toBe(1)
  })

  it('handles JSON parsing errors gracefully', () => {
    localStorageMock.setItem('test-key', 'invalid-json{')
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))
    
    expect(result.current[0]).toBe('fallback')
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('handles localStorage.setItem errors gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('works with complex objects', () => {
    const complexObject = { 
      name: 'John', 
      age: 30, 
      hobbies: ['reading', 'swimming'],
      nested: { value: true }
    }
    
    const { result } = renderHook(() => useLocalStorage('complex-key', complexObject))
    
    const updatedObject = { ...complexObject, age: 31 }
    
    act(() => {
      result.current[1](updatedObject)
    })
    
    expect(result.current[0]).toEqual(updatedObject)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'complex-key',
      JSON.stringify(updatedObject)
    )
  })
})

describe('useCachedValue', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when no cached value exists', () => {
    const { result } = renderHook(() => useCachedValue('cache-key'))
    
    expect(result.current.getCachedValue()).toBeNull()
  })

  it('caches and retrieves values', () => {
    const { result } = renderHook(() => useCachedValue('cache-key'))
    
    act(() => {
      result.current.setCachedValue('cached-data')
    })
    
    expect(result.current.getCachedValue()).toBe('cached-data')
  })

  it('expires cached values after timeout', () => {
    const { result } = renderHook(() => useCachedValue('cache-key', 1)) // 1 minute
    
    act(() => {
      result.current.setCachedValue('cached-data')
    })
    
    expect(result.current.getCachedValue()).toBe('cached-data')
    
    // Fast-forward 2 minutes
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000)
    })
    
    expect(result.current.getCachedValue()).toBeNull()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache-key')
  })

  it('clears cache manually', () => {
    const { result } = renderHook(() => useCachedValue('cache-key'))
    
    act(() => {
      result.current.setCachedValue('cached-data')
    })
    
    expect(result.current.getCachedValue()).toBe('cached-data')
    
    act(() => {
      result.current.clearCache()
    })
    
    expect(result.current.getCachedValue()).toBeNull()
  })

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error')
    })
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useCachedValue('cache-key'))
    
    expect(result.current.getCachedValue()).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('handles invalid cached data format', () => {
    localStorageMock.setItem('cache-key', 'invalid-format')
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useCachedValue('cache-key'))
    
    expect(result.current.getCachedValue()).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('uses custom expiration time', () => {
    const { result } = renderHook(() => useCachedValue('cache-key', 5)) // 5 minutes
    
    act(() => {
      result.current.setCachedValue('cached-data')
    })
    
    // Fast-forward 3 minutes (should still be valid)
    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000)
    })
    
    expect(result.current.getCachedValue()).toBe('cached-data')
    
    // Fast-forward 3 more minutes (should be expired)
    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000)
    })
    
    expect(result.current.getCachedValue()).toBeNull()
  })
})