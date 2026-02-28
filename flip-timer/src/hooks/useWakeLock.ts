import { useState, useCallback, useEffect, useRef } from 'react'

interface UseWakeLockReturn {
  isActive: boolean
  request: () => Promise<void>
  release: () => Promise<void>
}

export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
      })
    } catch {
      // Wake Lock request failed (e.g., low battery)
    }
  }, [])

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsActive(false)
    }
  }, [])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, request])

  useEffect(() => {
    return () => {
      wakeLockRef.current?.release()
    }
  }, [])

  return { isActive, request, release }
}
