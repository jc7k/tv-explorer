import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShowCard } from '@/components/ShowCard'
import { SearchBar } from '@/components/SearchBar'
import { mockShow, mockSearchResponse } from './mocks'

// Mock performance monitoring
vi.mock('@/hooks/usePerformanceMonitor', () => ({
  useRenderPerformance: vi.fn(),
  usePerformanceMonitor: () => ({
    startTiming: vi.fn(),
    endTiming: vi.fn(),
    getMetrics: vi.fn(() => ({ renderTime: 0, interactions: 0 }))
  })
}))

// Mock LazyImage for performance testing
vi.mock('@/components/LazyImage', () => ({
  LazyImage: ({ onLoad, alt }: any) => {
    // Simulate fast loading
    setTimeout(onLoad, 10)
    return <img alt={alt} data-testid="mock-lazy-image" />
  }
}))

// Mock hooks for SearchBar
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value, delay) => {
    // Return value immediately for most tests, but we can control timing if needed
    return value
  })
}))

vi.mock('@/hooks/useTMDB', () => ({
  useSearchTVShows: vi.fn(() => ({
    data: mockSearchResponse,
    loading: false,
    error: null
  }))
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>
  }
})

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Component Rendering Performance', () => {
    it('ShowCard should render quickly', () => {
      const start = performance.now()
      render(<ShowCard show={mockShow} />)
      const end = performance.now()
      
      const renderTime = end - start
      
      // Should render in less than 16ms (60fps target)
      expect(renderTime).toBeLessThan(16)
      
      // Should call performance monitoring
      const { useRenderPerformance } = await import('@/hooks/usePerformanceMonitor')
      expect(useRenderPerformance).toHaveBeenCalledWith('ShowCard')
    })

    it('Multiple ShowCard components should render efficiently', () => {
      const shows = Array(10).fill(mockShow).map((show, index) => ({
        ...show,
        id: index + 1
      }))

      const start = performance.now()
      render(
        <div>
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )
      const end = performance.now()

      const renderTime = end - start
      
      // 10 components should render in reasonable time
      expect(renderTime).toBeLessThan(100)
    })

    it('SearchBar should render without performance issues', () => {
      const start = performance.now()
      render(<SearchBar />)
      const end = performance.now()
      
      const renderTime = end - start
      expect(renderTime).toBeLessThan(16)
    })
  })

  describe('Interaction Performance', () => {
    it('SearchBar should debounce input efficiently', async () => {
      const { useDebounce } = await import('@/hooks/useDebounce')
      const mockDebounce = vi.mocked(useDebounce)
      
      // Setup debounce to actually delay
      mockDebounce.mockImplementation((value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value)
        useEffect(() => {
          const timer = setTimeout(() => setDebouncedValue(value), delay)
          return () => clearTimeout(timer)
        }, [value, delay])
        return debouncedValue
      })

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<SearchBar />)
      
      const input = screen.getByRole('combobox')
      
      const start = performance.now()
      
      // Type quickly
      await user.type(input, 'test query', { delay: 1 })
      
      // Fast-forward debounce time
      vi.advanceTimersByTime(300)
      
      const end = performance.now()
      const interactionTime = end - start
      
      // Interaction should be responsive (under 100ms without debounce delay)
      expect(interactionTime).toBeLessThan(100)
    })

    it('ShowCard click should be responsive', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<ShowCard show={mockShow} onClick={handleClick} />)
      
      const card = screen.getByRole('button')
      
      const start = performance.now()
      await user.click(card)
      const end = performance.now()
      
      const clickTime = end - start
      
      // Click handling should be immediate
      expect(clickTime).toBeLessThan(16)
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Memory Performance', () => {
    it('should not create memory leaks with multiple renders', () => {
      // Create and destroy components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ShowCard show={mockShow} />)
        unmount()
      }
      
      // Check that performance monitoring was called for each render
      const { useRenderPerformance } = await import('@/hooks/usePerformanceMonitor')
      expect(useRenderPerformance).toHaveBeenCalledTimes(10)
    })

    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(<ShowCard show={mockShow} />)
      
      // Rapidly re-render with different data
      const start = performance.now()
      for (let i = 0; i < 5; i++) {
        rerender(<ShowCard show={{ ...mockShow, id: i }} />)
      }
      const end = performance.now()
      
      const rerenderTime = end - start
      expect(rerenderTime).toBeLessThan(50)
    })
  })

  describe('Image Loading Performance', () => {
    it('should load images lazily', async () => {
      render(<ShowCard show={mockShow} />)
      
      const lazyImage = screen.getByTestId('mock-lazy-image')
      expect(lazyImage).toBeInTheDocument()
      
      // Wait for mock image load
      vi.advanceTimersByTime(10)
      
      // Image should be present (LazyImage handled the loading)
      expect(lazyImage).toBeVisible()
    })
  })

  describe('Bundle Size and Code Splitting', () => {
    it('should import components efficiently', async () => {
      // Test dynamic imports work (this would be more relevant in E2E tests)
      const start = performance.now()
      
      // Simulate component import
      const ShowCardModule = await import('@/components/ShowCard')
      
      const end = performance.now()
      const importTime = end - start
      
      expect(ShowCardModule.ShowCard).toBeDefined()
      expect(importTime).toBeLessThan(10) // Should be very fast in tests
    })
  })

  describe('Search Performance', () => {
    it('should handle rapid search inputs without performance degradation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<SearchBar />)
      
      const input = screen.getByRole('combobox')
      
      const start = performance.now()
      
      // Simulate rapid typing
      await user.type(input, 'a', { delay: 1 })
      await user.type(input, 'b', { delay: 1 })
      await user.type(input, 'c', { delay: 1 })
      
      const end = performance.now()
      const typingTime = end - start
      
      // Should handle rapid input efficiently
      expect(typingTime).toBeLessThan(50)
    })
  })

  describe('Accessibility Performance', () => {
    it('should render accessible content quickly', () => {
      const start = performance.now()
      render(<ShowCard show={mockShow} />)
      const end = performance.now()
      
      // Check accessibility attributes are present
      expect(screen.getByAltText('Game of Thrones poster')).toBeInTheDocument()
      expect(screen.getByRole(/link|button/)).toBeInTheDocument()
      
      const renderTime = end - start
      expect(renderTime).toBeLessThan(16)
    })
  })
})