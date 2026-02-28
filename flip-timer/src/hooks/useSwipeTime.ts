import { useRef, useCallback, useState } from 'react'
import { tickVibrate } from '../utils/audio'

interface UseSwipeTimeOptions {
  /** Current remaining seconds */
  timeLeft: number
  /** Total seconds for the timer */
  totalTime: number
  /** Called with new remaining seconds when user swipes */
  onAdjust: (newTimeLeft: number) => void
  /** Minimum time in seconds (default: 60) */
  minTime?: number
  /** Seconds per swipe-step (default: 60 = 1 minute) */
  stepSeconds?: number
  /** Pixels of vertical drag per step (default: 30) */
  pixelsPerStep?: number
}

interface UseSwipeTimeReturn {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  isSwiping: boolean
  /** Preview time while swiping (null when not swiping) */
  previewTime: number | null
}

export function useSwipeTime({
  timeLeft,
  totalTime,
  onAdjust,
  minTime = 60,
  stepSeconds = 60,
  pixelsPerStep = 30,
}: UseSwipeTimeOptions): UseSwipeTimeReturn {
  const [isSwiping, setIsSwiping] = useState(false)
  const [previewTime, setPreviewTime] = useState<number | null>(null)

  const startYRef = useRef(0)
  const startTimeRef = useRef(0)
  const lastStepRef = useRef(0)
  const isSwipingRef = useRef(false)
  const moved = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    startYRef.current = touch.clientY
    startTimeRef.current = timeLeft
    lastStepRef.current = 0
    moved.current = false
  }, [timeLeft])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const deltaY = startYRef.current - touch.clientY

    // Only start swiping after a small threshold to avoid interfering with taps
    if (!isSwipingRef.current && Math.abs(deltaY) < 10) return

    if (!isSwipingRef.current) {
      isSwipingRef.current = true
      setIsSwiping(true)
    }
    moved.current = true

    // Swipe up = add time, swipe down = subtract time
    const steps = Math.round(deltaY / pixelsPerStep)
    const newTime = Math.max(minTime, Math.min(totalTime, startTimeRef.current + steps * stepSeconds))

    setPreviewTime(newTime)

    // Tick vibration when crossing a minute boundary
    if (steps !== lastStepRef.current) {
      lastStepRef.current = steps
      tickVibrate()
    }
  }, [pixelsPerStep, stepSeconds, minTime, totalTime])

  const onTouchEnd = useCallback(() => {
    if (isSwipingRef.current && previewTime !== null) {
      onAdjust(previewTime)
    }
    isSwipingRef.current = false
    setIsSwiping(false)
    setPreviewTime(null)
  }, [previewTime, onAdjust])

  return { onTouchStart, onTouchMove, onTouchEnd, isSwiping, previewTime }
}
