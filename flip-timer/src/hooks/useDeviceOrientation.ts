import { useState, useEffect, useCallback, useRef } from 'react'

export type OrientationMode = 'focus' | 'break'

interface DeviceOrientationState {
  mode: OrientationMode
  permissionGranted: boolean
  permissionDenied: boolean
  isSupported: boolean
  requestPermission: () => Promise<void>
  beta: number | null
}

// Hysteresis thresholds to prevent flickering
const SWITCH_TO_BREAK_THRESHOLD = 140 // degrees – phone nearly upside-down
const SWITCH_TO_FOCUS_THRESHOLD = 40  // degrees – phone mostly upright

export function useDeviceOrientation(): DeviceOrientationState {
  const [mode, setMode] = useState<OrientationMode>('focus')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [beta, setBeta] = useState<number | null>(null)
  const currentModeRef = useRef<OrientationMode>('focus')

  const isSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const b = event.beta // -180 to 180 degrees
    if (b === null) return

    setBeta(b)
    const absBeta = Math.abs(b)

    if (currentModeRef.current === 'focus' && absBeta > SWITCH_TO_BREAK_THRESHOLD) {
      currentModeRef.current = 'break'
      setMode('break')
    } else if (currentModeRef.current === 'break' && absBeta < SWITCH_TO_FOCUS_THRESHOLD) {
      currentModeRef.current = 'focus'
      setMode('focus')
    }
  }, [])

  const requestPermission = useCallback(async () => {
    try {
      // iOS 13+ requires explicit permission
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>
      }

      if (typeof DOE.requestPermission === 'function') {
        const result = await DOE.requestPermission()
        if (result === 'granted') {
          setPermissionGranted(true)
          window.addEventListener('deviceorientation', handleOrientation)
        } else {
          setPermissionDenied(true)
        }
      } else {
        // Non-iOS or older browsers – permission not needed
        setPermissionGranted(true)
        window.addEventListener('deviceorientation', handleOrientation)
      }
    } catch {
      setPermissionDenied(true)
    }
  }, [handleOrientation])

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  return {
    mode,
    permissionGranted,
    permissionDenied,
    isSupported,
    requestPermission,
    beta,
  }
}
