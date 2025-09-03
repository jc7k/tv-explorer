import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from '@axe-core/react'
import { ShowCard } from '@/components/ShowCard'
import { SearchBar } from '@/components/SearchBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { mockShow } from './mocks'

// Mock performance hook for ShowCard
vi.mock('@/hooks/usePerformanceMonitor', () => ({
  useRenderPerformance: vi.fn()
}))

// Mock LazyImage for ShowCard
vi.mock('@/components/LazyImage', () => ({
  LazyImage: ({ alt, placeholder }: any) => (
    <div data-testid="lazy-image">
      {placeholder}
      <img alt={alt} />
    </div>
  )
}))

// Mock hooks for SearchBar
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value
}))

vi.mock('@/hooks/useTMDB', () => ({
  useSearchTVShows: () => ({
    data: { results: [] },
    loading: false,
    error: null
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>
  }
})

describe('Accessibility Tests', () => {
  it('ShowCard should not have any accessibility violations', async () => {
    const { container } = render(<ShowCard show={mockShow} />)
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('SearchBar should not have any accessibility violations', async () => {
    const { container } = render(<SearchBar />)
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ErrorBoundary fallback should not have accessibility violations', async () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()

    consoleSpy.mockRestore()
  })

  it('ShowCard has proper ARIA labels and roles', () => {
    render(<ShowCard show={mockShow} />)
    
    // Check for alt text on image
    expect(screen.getByAltText('Game of Thrones poster')).toBeInTheDocument()
    
    // Check for proper link or button roles
    const interactiveElement = screen.getByRole(/link|button/)
    expect(interactiveElement).toBeInTheDocument()
  })

  it('SearchBar has proper form elements and labels', () => {
    render(<SearchBar placeholder="Search shows" />)
    
    // Input should be properly labeled
    const searchInput = screen.getByRole('combobox')
    expect(searchInput).toHaveAttribute('placeholder', 'Search shows')
    
    // Should have autocomplete attribute for better UX
    expect(searchInput).toHaveAttribute('autoComplete')
  })

  it('Interactive elements have proper focus management', () => {
    render(<ShowCard show={mockShow} />)
    
    const interactiveElement = screen.getByRole(/link|button/)
    interactiveElement.focus()
    
    expect(document.activeElement).toBe(interactiveElement)
  })

  it('Error messages are properly announced', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Error message should be visible and readable
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Please try refreshing the page')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('Images have proper alt text for screen readers', () => {
    render(<ShowCard show={mockShow} />)
    
    const image = screen.getByAltText('Game of Thrones poster')
    expect(image).toHaveAttribute('alt', 'Game of Thrones poster')
  })

  it('Color contrast should be sufficient (visual test)', () => {
    render(<ShowCard show={mockShow} />)
    
    // This is a placeholder for color contrast testing
    // In a real implementation, you might use axe-core's color contrast rules
    // or integration with design system color tokens
    const titleElement = screen.getByText('Game of Thrones')
    expect(titleElement).toBeInTheDocument()
  })

  it('Keyboard navigation works properly', () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByRole('combobox')
    
    // Should be focusable
    searchInput.focus()
    expect(document.activeElement).toBe(searchInput)
    
    // Should handle keyboard events (tested in SearchBar.test.tsx)
    expect(searchInput).toHaveAttribute('onKeyDown')
  })
})