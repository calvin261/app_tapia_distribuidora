import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import React from 'react'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test@localhost/test_db'

// Global mocks
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

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

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => {
  const iconNames = [
    'HomeIcon', 'UserGroupIcon', 'CubeIcon', 'ShoppingCartIcon', 'TruckIcon',
    'ChartBarIcon', 'BellIcon', 'ChatBubbleLeftRightIcon', 'Bars3Icon', 
    'XMarkIcon', 'MagnifyingGlassIcon', 'UserCircleIcon', 'CogIcon',
    'QuestionMarkCircleIcon', 'CurrencyDollarIcon', 'ArrowTrendingUpIcon',
    'ArrowTrendingDownIcon', 'ExclamationTriangleIcon', 'ReceiptPercentIcon'
  ]
  
  type MockIconProps = { className?: string; [key: string]: unknown }
  type MockIconComponent = (props: MockIconProps) => React.ReactElement
  
  const mocks: Record<string, MockIconComponent> = {}
  
  iconNames.forEach(iconName => {
    mocks[iconName] = ({ className, ...props }: MockIconProps) => {
      return React.createElement('div', {
        className,
        'data-testid': `${iconName.toLowerCase().replace('icon', '')}-icon`,
        ...props
      })
    }
  })
  
  return new Proxy(mocks, {
    get(target, prop) {
      if (target[prop as string]) {
        return target[prop as string]
      }
      // Fallback for any unmocked icons
      return ({ className, ...props }: MockIconProps) => {
        return React.createElement('div', {
          className,
          'data-testid': `${String(prop).toLowerCase()}-icon`,
          ...props
        })
      }
    }
  })
})

// Setup and cleanup
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})
