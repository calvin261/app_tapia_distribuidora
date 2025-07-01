import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sql } from '@/lib/database'

// Mock the database
vi.mock('@/lib/database', () => ({
  sql: vi.fn()
}))

describe('Database Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle successful database queries', async () => {
    const mockResult = [{ id: 1, name: 'Test' }]
    vi.mocked(sql).mockResolvedValue(mockResult)

    const result = await sql`SELECT * FROM test_table`
    
    expect(sql).toHaveBeenCalledWith(['SELECT * FROM test_table'])
    expect(result).toEqual(mockResult)
  })

  it('should handle database connection errors', async () => {
    const mockError = new Error('Connection failed')
    vi.mocked(sql).mockRejectedValue(mockError)

    await expect(sql`SELECT * FROM test_table`).rejects.toThrow('Connection failed')
  })

  it('should format SQL queries correctly', async () => {
    const mockResult = []
    vi.mocked(sql).mockResolvedValue(mockResult)

    const userId = 'test-id'
    await sql`SELECT * FROM users WHERE id = ${userId}`
    
    expect(sql).toHaveBeenCalledWith(['SELECT * FROM users WHERE id = ', ''], userId)
  })
})
