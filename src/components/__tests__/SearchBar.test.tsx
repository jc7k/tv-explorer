import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { SearchBar } from '../SearchBar'
import { mockSearchResponse } from '@/test/mocks'

// Mock hooks
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value // Return value immediately for testing
}))

vi.mock('@/hooks/useTMDB', () => ({
  useSearchTVShows: vi.fn(() => ({
    data: mockSearchResponse,
    loading: false,
    error: null
  }))
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default placeholder', () => {
    render(<SearchBar />)
    
    expect(screen.getByPlaceholderText('Search TV shows...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Find your favorite shows'
    render(<SearchBar placeholder={customPlaceholder} />)
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
  })

  it('calls onSearch when typing', async () => {
    const user = userEvent.setup()
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'Game of Thrones')
    
    expect(mockOnSearch).toHaveBeenCalledWith('Game of Thrones')
  })

  it('shows search results when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'Game')
    
    await waitFor(() => {
      expect(screen.getByText('Game of Thrones')).toBeInTheDocument()
    })
  })

  it('navigates to show details on result click', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'Game')
    
    await waitFor(() => {
      const showResult = screen.getByText('Game of Thrones')
      return user.click(showResult)
    })
    
    expect(mockNavigate).toHaveBeenCalledWith('/show/1399')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'Game')
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Game of Thrones')).toBeInTheDocument()
    })
    
    // Test arrow down navigation
    await user.keyboard('{ArrowDown}')
    const firstResult = screen.getByText('Game of Thrones').closest('div')
    expect(firstResult).toHaveClass('bg-gray-700')
    
    // Test Enter key selection
    await user.keyboard('{Enter}')
    expect(mockNavigate).toHaveBeenCalledWith('/show/1399')
  })

  it('handles Enter key for search page navigation', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'test query')
    
    // Clear results first
    fireEvent.blur(input)
    await user.keyboard('{Enter}')
    
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test query')
  })

  it('hides results when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <SearchBar />
        <div data-testid="outside">Outside element</div>
      </div>
    )
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'Game')
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Game of Thrones')).toBeInTheDocument()
    })
    
    // Click outside
    await user.click(screen.getByTestId('outside'))
    
    await waitFor(() => {
      expect(screen.queryByText('Game of Thrones')).not.toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    const { useSearchTVShows } = require('@/hooks/useTMDB')
    useSearchTVShows.mockReturnValue({
      data: null,
      loading: true,
      error: null
    })
    
    render(<SearchBar />)
    
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-search-class'
    render(<SearchBar className={customClass} />)
    
    const container = screen.getByRole('textbox').closest('.relative')
    expect(container).toHaveClass(customClass)
  })

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('combobox')
    await user.type(input, 'test query')
    
    const clearButton = screen.getByRole('button', { name: /clear search/i })
    await user.click(clearButton)
    
    expect(input).toHaveValue('')
  })
})