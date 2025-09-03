import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    expect(result.current).toBe('initial')
    
    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Should still be initial immediately
    expect(result.current).toBe('initial')
    
    // Fast-forward time but not enough
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current).toBe('initial')
    
    // Fast-forward past delay
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current).toBe('updated')
  })

  it('cancels previous timeout when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    // Change value multiple times quickly
    rerender({ value: 'first', delay: 500 })
    rerender({ value: 'second', delay: 500 })
    rerender({ value: 'final', delay: 500 })
    
    // Should still be initial
    expect(result.current).toBe('initial')
    
    // Fast-forward past delay
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Should be the final value, not intermediate ones
    expect(result.current).toBe('final')
  })

  it('handles delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    rerender({ value: 'updated', delay: 200 })
    
    // Fast-forward by shorter delay
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    expect(result.current).toBe('updated')
  })

  it('works with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 100 }
      }
    )
    
    expect(result.current).toBe(0)
    
    rerender({ value: 42, delay: 100 })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current).toBe(42)
  })

  it('works with objects', () => {
    const initialObj = { name: 'John' }
    const updatedObj = { name: 'Jane' }
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 100 }
      }
    )
    
    expect(result.current).toBe(initialObj)
    
    rerender({ value: updatedObj, delay: 100 })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current).toBe(updatedObj)
  })

  it('handles zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    )
    
    rerender({ value: 'updated', delay: 0 })
    
    act(() => {
      vi.advanceTimersByTime(0)
    })
    
    expect(result.current).toBe('updated')
  })
})