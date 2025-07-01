import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test@localhost/test_db'

// Global mocks
global.fetch = vi.fn()

// Mock Next.js
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))
