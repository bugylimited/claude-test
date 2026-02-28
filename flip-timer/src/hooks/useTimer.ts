import { useState, useRef, useCallback, useEffect } from 'react'

export type TimerState = 'idle' | 'running' | 'paused' | 'finished'

interface UseTimerReturn {
  timeLeft: number
  totalTime: number
  state: TimerState
  progress: number
  start: (seconds: number) => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimer(onFinish?: () => void): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [state, setState] = useState<TimerState>('idle')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTimeRef = useRef<number>(0)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const remaining = Math.max(0, endTimeRef.current - Date.now())
    const seconds = Math.ceil(remaining / 1000)
    setTimeLeft(seconds)

    if (remaining <= 0) {
      clearTimer()
      setState('finished')
      onFinishRef.current?.()
    }
  }, [clearTimer])

  const start = useCallback((seconds: number) => {
    clearTimer()
    setTotalTime(seconds)
    setTimeLeft(seconds)
    endTimeRef.current = Date.now() + seconds * 1000
    setState('running')
    intervalRef.current = setInterval(tick, 250)
  }, [clearTimer, tick])

  const pause = useCallback(() => {
    if (state !== 'running') return
    clearTimer()
    const remaining = Math.max(0, endTimeRef.current - Date.now())
    setTimeLeft(Math.ceil(remaining / 1000))
    setState('paused')
  }, [state, clearTimer])

  const resume = useCallback(() => {
    if (state !== 'paused') return
    endTimeRef.current = Date.now() + timeLeft * 1000
    setState('running')
    intervalRef.current = setInterval(tick, 250)
  }, [state, timeLeft, tick])

  const reset = useCallback(() => {
    clearTimer()
    setTimeLeft(0)
    setTotalTime(0)
    setState('idle')
  }, [clearTimer])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0

  return { timeLeft, totalTime, state, progress, start, pause, resume, reset }
}
