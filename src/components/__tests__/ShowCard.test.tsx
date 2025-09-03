import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@/test/utils'
import { ShowCard } from '../ShowCard'
import { mockShow } from '@/test/mocks'

// Mock the performance hook
vi.mock('@/hooks/usePerformanceMonitor', () => ({
  useRenderPerformance: vi.fn()
}))

// Mock LazyImage component
vi.mock('../LazyImage', () => ({
  LazyImage: ({ alt, onLoad, placeholder }: any) => (
    <div data-testid="lazy-image">
      {placeholder}
      <img alt={alt} onLoad={onLoad} />
    </div>
  )
}))

describe('ShowCard', () => {
  it('renders show information correctly', () => {
    render(<ShowCard show={mockShow} />)
    
    expect(screen.getByText('Game of Thrones')).toBeInTheDocument()
    expect(screen.getByText('2011')).toBeInTheDocument()
    expect(screen.getByText('8.3')).toBeInTheDocument()
    expect(screen.getByAltText('Game of Thrones poster')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<ShowCard show={mockShow} onClick={handleClick} />)
    
    const card = screen.getByRole('button')
    fireEvent.click(card)
    
    expect(handleClick).toHaveBeenCalledWith(mockShow)
  })

  it('renders as link when no onClick provided', () => {
    render(<ShowCard show={mockShow} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/show/1399')
  })

  it('applies custom className', () => {
    const customClass = 'custom-test-class'
    render(<ShowCard show={mockShow} className={customClass} />)
    
    const card = screen.getByText('Game of Thrones').closest('div')
    expect(card).toHaveClass(customClass)
  })

  it('displays rating with correct color coding', () => {
    // Test high rating (green)
    render(<ShowCard show={mockShow} />)
    const highRating = screen.getByText('8.3')
    expect(highRating).toHaveClass('text-green-400')

    // Test medium rating (yellow)
    const mediumShow = { ...mockShow, vote_average: 6.5 }
    render(<ShowCard show={mediumShow} />)
    const mediumRating = screen.getByText('6.5')
    expect(mediumRating).toHaveClass('text-yellow-400')

    // Test low rating (red)
    const lowShow = { ...mockShow, vote_average: 4.0 }
    render(<ShowCard show={lowShow} />)
    const lowRating = screen.getByText('4.0')
    expect(lowRating).toHaveClass('text-red-400')
  })

  it('handles missing poster_path gracefully', () => {
    const showWithoutPoster = { ...mockShow, poster_path: null }
    render(<ShowCard show={showWithoutPoster} />)
    
    expect(screen.getByTestId('lazy-image')).toBeInTheDocument()
  })

  it('displays formatted year from first_air_date', () => {
    render(<ShowCard show={mockShow} />)
    expect(screen.getByText('2011')).toBeInTheDocument()
  })

  it('truncates long show names', () => {
    const longNameShow = { 
      ...mockShow, 
      name: 'This is a very long show name that should be truncated to fit properly in the card layout' 
    }
    render(<ShowCard show={longNameShow} />)
    
    const showName = screen.getByText(/This is a very long show name/)
    expect(showName).toHaveClass('truncate')
  })
})