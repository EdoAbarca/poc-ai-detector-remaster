import { useState, useEffect, useRef, useCallback } from 'react'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

/**
 * Custom hook to poll detection job progress
 *
 * @param {string} jobId - The job ID to track
 * @param {number} interval - Polling interval in milliseconds (default: 500ms)
 * @param {boolean} enabled - Whether polling is enabled
 * @returns {Object} Progress data and control functions
 */
export function useDetectionProgress (jobId, interval = 500, enabled = true) {
  const [progress, setProgress] = useState({
    percentage: 0,
    status: 'waiting',
    message: '',
    currentDoc: '',
    chunksProcessed: 0,
    totalChunks: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef(null)
  const notificationShownRef = useRef(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333'

  const fetchProgress = useCallback(async () => {
    if (!jobId || !enabled) return

    try {
      const response = await fetch(`${apiUrl}/api/v1/detect/progress/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Detection job not found')
        }
        throw new Error('Failed to fetch detection progress')
      }

      const data = await response.json()
      setProgress(data)
      setIsLoading(false)
      setError(null)

      // Check if job is complete
      if (data.percentage >= 100 || data.status === 'completed') {
        setIsComplete(true)

        // Show completion notification (only once)
        if (!notificationShownRef.current) {
          Toastify({
            text: `✅ Detection complete for ${data.currentDoc || 'document'}`,
            duration: 5000,
            gravity: 'top',
            position: 'right',
            style: {
              background: 'linear-gradient(to right, #10b981, #059669)'
            }
          }).showToast()
          notificationShownRef.current = true
        }

        // Stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else if (data.status === 'failed') {
        setIsComplete(true)

        // Show error notification
        if (!notificationShownRef.current) {
          Toastify({
            text: `❌ Detection failed for ${data.currentDoc || 'document'}`,
            duration: 5000,
            gravity: 'top',
            position: 'right',
            style: {
              background: 'linear-gradient(to right, #ef4444, #dc2626)'
            }
          }).showToast()
          notificationShownRef.current = true
        }

        // Stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } catch (err) {
      setError(err.message)
      setIsLoading(false)

      // Stop polling on error
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [jobId, enabled, apiUrl])

  useEffect(() => {
    if (!jobId || !enabled || isComplete) return

    // Initial fetch
    fetchProgress()

    // Set up polling
    intervalRef.current = setInterval(fetchProgress, interval)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [jobId, enabled, interval, isComplete, fetchProgress])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsComplete(true)
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({
      percentage: 0,
      status: 'waiting',
      message: '',
      currentDoc: '',
      chunksProcessed: 0,
      totalChunks: 0
    })
    setIsLoading(true)
    setError(null)
    setIsComplete(false)
    notificationShownRef.current = false
  }, [])

  return {
    progress,
    isLoading,
    error,
    isComplete,
    stopPolling,
    resetProgress,
    refetch: fetchProgress
  }
}

export default useDetectionProgress
