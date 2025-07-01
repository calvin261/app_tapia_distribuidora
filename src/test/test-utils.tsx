import { vi } from 'vitest'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Test utilities
export const mockFetch = (data: any, status = 200) => {
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  }
  global.fetch = vi.fn().mockResolvedValue(mockResponse)
  return mockResponse
}

export const mockFetchError = (error: string, status = 500) => {
  const mockResponse = {
    ok: false,
    status,
    json: vi.fn().mockRejectedValue(new Error(error)),
  }
  global.fetch = vi.fn().mockResolvedValue(mockResponse)
  return mockResponse
}

// Custom render function
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    ...options,
  })
}

// Mock data generators
export const mockCustomer = (overrides = {}) => ({
  id: 'customer-1',
  name: 'Cliente Test',
  email: 'cliente@test.com',
  phone: '+1-555-0123',
  address: 'Dirección Test 123',
  tax_id: '12345678',
  credit_limit: 5000,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockSupplier = (overrides = {}) => ({
  id: 'supplier-1',
  name: 'Proveedor Test',
  contact_person: 'Contacto Test',
  email: 'proveedor@test.com',
  phone: '+1-555-0456',
  address: 'Dirección Proveedor 456',
  tax_id: '87654321',
  payment_terms: 'net_30',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockProduct = (overrides = {}) => ({
  id: 'product-1',
  name: 'Producto Test',
  description: 'Descripción del producto test',
  sku: 'TEST-001',
  category_name: 'Categoría Test',
  supplier_name: 'Proveedor Test',
  cost_price: 10.00,
  sale_price: 15.00,
  stock_quantity: 100,
  min_stock_level: 10,
  status: 'active',
  unit: 'unit',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockSale = (overrides = {}) => ({
  id: 'sale-1',
  invoice_number: 'INV-001',
  customer_name: 'Cliente Test',
  sale_date: '2024-01-01T00:00:00Z',
  total_amount: 150.00,
  payment_status: 'completed',
  status: 'completed',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockPurchase = (overrides = {}) => ({
  id: 'purchase-1',
  order_number: 'PO-001',
  supplier_name: 'Proveedor Test',
  order_date: '2024-01-01T00:00:00Z',
  total_amount: 1000.00,
  payment_status: 'pending',
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Wait utilities
export const waitForElement = async (callback: () => any, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      try {
        const result = callback()
        if (result) {
          resolve(result)
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for element'))
        } else {
          setTimeout(check, 50)
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error)
        } else {
          setTimeout(check, 50)
        }
      }
    }
    check()
  })
}

export * from '@testing-library/react'
export { vi }
