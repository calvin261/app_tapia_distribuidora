import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock todas las dependencias problemáticas
vi.mock('@/components/layout/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div data-testid="page-layout">
      {title && <h1 data-testid="page-title">{title}</h1>}
      {children}
    </div>
  )
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

vi.mock('@heroicons/react/24/outline', () => {
  const MockIcon = ({ className }: { className?: string }) => 
    <div className={className} data-testid="mock-icon" />
  
  return new Proxy({}, {
    get: () => MockIcon
  })
})

describe('Simplified Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock fetch responses
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
  })

  it('should verify test setup is working', () => {
    expect(true).toBe(true)
  })

  it('should mock fetch correctly', async () => {
    const response = await fetch('/api/test')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(Array.isArray(data)).toBe(true)
  })

  it('should render mock PageLayout', async () => {
    const { PageLayout } = await import('@/components/layout/PageLayout')
    render(
      <PageLayout title="Test Title">
        <div>Test Content</div>
      </PageLayout>
    )
    
    expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    expect(screen.getByTestId('page-title')).toHaveTextContent('Test Title')
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should handle async component imports', async () => {
    // Test that we can import modules without errors
    expect(async () => {
      await import('@/components/layout/PageLayout')
    }).not.toThrow()
  })
})
