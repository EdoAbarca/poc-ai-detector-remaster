import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDetectionProgress } from '../hooks/useDetectionProgress'

// Mock fetch globally
global.fetch = vi.fn()

// Mock Toastify
vi.mock('toastify-js', () => ({
  default: vi.fn(() => ({
    showToast: vi.fn()
  }))
}))

describe('useDetectionProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDetectionProgress('job-123', 500, false))

    expect(result.current.progress.percentage).toBe(0)
    expect(result.current.progress.status).toBe('waiting')
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.isComplete).toBe(false)
  })

  it('should fetch progress data when enabled', async () => {
    const mockProgressData = {
      percentage: 45,
      status: 'Processing chunk 5 of 10...',
      currentDoc: 'test-document.pdf',
      chunksProcessed: 5,
      totalChunks: 10
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProgressData
    })

    const { result } = renderHook(() => useDetectionProgress('job-123', 500, true))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.progress.percentage).toBe(45)
    expect(result.current.progress.currentDoc).toBe('test-document.pdf')
    expect(result.current.error).toBe(null)
  })

  it('should handle 404 error', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    const { result } = renderHook(() => useDetectionProgress('non-existent-job', 500, true))

    await waitFor(() => {
      expect(result.current.error).toBe('Detection job not found')
    }, { timeout: 3000 })

    expect(result.current.isLoading).toBe(false)
  })

  it('should handle network error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDetectionProgress('job-123', 500, true))

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    }, { timeout: 3000 })

    expect(result.current.isLoading).toBe(false)
  })

  it('should mark as complete when progress reaches 100%', async () => {
    const mockProgressData = {
      percentage: 100,
      status: 'completed',
      currentDoc: 'test-document.pdf',
      chunksProcessed: 10,
      totalChunks: 10
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProgressData
    })

    const { result } = renderHook(() => useDetectionProgress('job-123', 500, true))

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true)
    }, { timeout: 3000 })

    expect(result.current.progress.percentage).toBe(100)
  })

  it('should mark as complete on failed status', async () => {
    const mockProgressData = {
      percentage: 45,
      status: 'failed',
      currentDoc: 'test-document.pdf',
      message: 'Detection service unavailable'
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProgressData
    })

    const { result } = renderHook(() => useDetectionProgress('job-123', 500, true))

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true)
    }, { timeout: 3000 })

    expect(result.current.progress.status).toBe('failed')
  })

  it('should not poll when enabled is false', () => {
    renderHook(() => useDetectionProgress('job-123', 500, false))

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should not poll when jobId is not provided', () => {
    renderHook(() => useDetectionProgress(null, 500, true))

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should stop polling when stopPolling is called', async () => {
    const mockProgressData = {
      percentage: 50,
      status: 'Processing...',
      currentDoc: 'test-document.pdf'
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProgressData
    })

    const { result } = renderHook(() => useDetectionProgress('job-123', 500, true))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    act(() => {
      result.current.stopPolling()
    })

    expect(result.current.isComplete).toBe(true)
  })

  it('should reset progress when resetProgress is called', async () => {
    const mockProgressData = {
      percentage: 50,
      status: 'Processing...',
      currentDoc: 'test-document.pdf'
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProgressData
    })

    const { result } = renderHook(() => useDetectionProgress('job-123', 500, true))

    await waitFor(() => {
      expect(result.current.progress.percentage).toBe(50)
    }, { timeout: 3000 })

    act(() => {
      result.current.resetProgress()
    })

    expect(result.current.progress.percentage).toBe(0)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.isComplete).toBe(false)
  })
})
