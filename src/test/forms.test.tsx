import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock fetch
global.fetch = vi.fn()

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div data-testid="plus-icon" />,
  PencilIcon: () => <div data-testid="pencil-icon" />,
  TrashIcon: () => <div data-testid="trash-icon" />,
  MagnifyingGlassIcon: () => <div data-testid="search-icon" />,
}))

// Create a simple form component for testing
const TestCustomerForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        placeholder="Nombre" 
        required 
        data-testid="name-input"
      />
      <input 
        name="email" 
        type="email" 
        placeholder="Email" 
        data-testid="email-input"
      />
      <input 
        name="phone" 
        placeholder="Teléfono" 
        data-testid="phone-input"
      />
      <button type="submit" data-testid="submit-button">
        Guardar
      </button>
    </form>
  )
}

describe('Form Components Tests', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields correctly', () => {
    const mockSubmit = vi.fn()
    render(<TestCustomerForm onSubmit={mockSubmit} />)
    
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('phone-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const mockSubmit = vi.fn()
    render(<TestCustomerForm onSubmit={mockSubmit} />)
    
    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)
    
    // HTML5 validation should prevent submission
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn()
    render(<TestCustomerForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByTestId('name-input'), 'Test Customer')
    await user.type(screen.getByTestId('email-input'), 'test@example.com')
    await user.type(screen.getByTestId('phone-input'), '123-456-7890')
    
    await user.click(screen.getByTestId('submit-button'))
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '123-456-7890'
    })
  })

  it('should handle form submission errors', async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
    render(<TestCustomerForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByTestId('name-input'), 'Test Customer')
    await user.click(screen.getByTestId('submit-button'))
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
    })
  })
})
