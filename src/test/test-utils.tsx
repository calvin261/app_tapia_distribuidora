import { vi } from 'vitest'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Tipos explícitos para datos de prueba
export interface CustomerMock {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  credit_limit: number;
  created_at: string;
  [key: string]: unknown;
}

export interface SupplierMock {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_terms: string;
  created_at: string;
  [key: string]: unknown;
}

export interface ProductMock {
  id: string;
  name: string;
  description: string;
  sku: string;
  category_name: string;
  supplier_name: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  min_stock_level: number;
  status: string;
  unit: string;
  created_at: string;
  [key: string]: unknown;
}

export interface SaleMock {
  id: string;
  invoice_number: string;
  customer_name: string;
  sale_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

export interface PurchaseMock {
  id: string;
  order_number: string;
  supplier_name: string;
  order_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

// Test utilities
export const mockFetch = <T = unknown>(data: T, status = 200) => {
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
export const mockCustomer = (overrides: Partial<CustomerMock> = {}): CustomerMock => ({
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

export const mockSupplier = (overrides: Partial<SupplierMock> = {}): SupplierMock => ({
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

export const mockProduct = (overrides: Partial<ProductMock> = {}): ProductMock => ({
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

export const mockSale = (overrides: Partial<SaleMock> = {}): SaleMock => ({
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

export const mockPurchase = (overrides: Partial<PurchaseMock> = {}): PurchaseMock => ({
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
type WaitForElementCallback<T> = () => T | undefined | null
export async function waitForElement<T>(callback: WaitForElementCallback<T>, timeout = 1000): Promise<T> {
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
          reject(error instanceof Error ? error : new Error(String(error)))
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
