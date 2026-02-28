import { useState, useEffect, useCallback, useRef } from 'react'
import { TimerRing } from './components/TimerRing'
import { ModeIndicator } from './components/ModeIndicator'
import { TimeSelector } from './components/TimeSelector'
import { PermissionPrompt } from './components/PermissionPrompt'
import { useTimer } from './hooks/useTimer'
import { useDeviceOrientation, type OrientationMode } from './hooks/useDeviceOrientation'
import { useWakeLock } from './hooks/useWakeLock'
import { playBell, vibrate } from './utils/audio'
import { formatTime } from './utils/format'

const FOCUS_OPTIONS = [25, 45, 60] // minutes
const BREAK_OPTIONS = [5, 10, 15]  // minutes

function App() {
  const [setupDone, setSetupDone] = useState(false)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)

  const prevModeRef = useRef<OrientationMode>('focus')

  const handleTimerFinish = useCallback(() => {
    playBell()
    vibrate()
  }, [])

  const timer = useTimer(handleTimerFinish)
  const orientation = useDeviceOrientation()
  const wakeLock = useWakeLock()

  const currentMode = orientation.permissionGranted ? orientation.mode : 'focus'
  const accentColor = currentMode === 'focus'
    ? 'var(--color-focus-accent)'
    : 'var(--color-break-accent)'

  const currentOptions = currentMode === 'focus' ? FOCUS_OPTIONS : BREAK_OPTIONS
  const selectedMinutes = currentMode === 'focus' ? focusMinutes : breakMinutes

  // Handle mode changes from rotation
  useEffect(() => {
    if (!orientation.permissionGranted) return
    if (prevModeRef.current === orientation.mode) return

    prevModeRef.current = orientation.mode

    // Auto-start the appropriate timer when mode changes via rotation
    const minutes = orientation.mode === 'focus' ? focusMinutes : breakMinutes
    timer.start(minutes * 60)
  }, [orientation.mode, orientation.permissionGranted, focusMinutes, breakMinutes, timer])

  // Request wake lock when timer is running
  useEffect(() => {
    if (timer.state === 'running') {
      wakeLock.request()
    }
  }, [timer.state, wakeLock])

  const handlePermissionRequest = async () => {
    if (orientation.isSupported && !orientation.permissionDenied) {
      await orientation.requestPermission()
    }
    setSetupDone(true)
  }

  const handleTimeSelect = (minutes: number) => {
    if (currentMode === 'focus') {
      setFocusMinutes(minutes)
    } else {
      setBreakMinutes(minutes)
    }
    // Restart timer with new duration if running or start fresh
    timer.start(minutes * 60)
  }

  const handleTapTimer = () => {
    switch (timer.state) {
      case 'idle':
      case 'finished':
        timer.start(selectedMinutes * 60)
        break
      case 'running':
        timer.pause()
        break
      case 'paused':
        timer.resume()
        break
    }
  }

  // Show permission prompt on first launch
  if (!setupDone) {
    return (
      <PermissionPrompt
        onRequest={handlePermissionRequest}
        denied={orientation.permissionDenied}
      />
    )
  }

  const displayTime = timer.state === 'idle'
    ? formatTime(selectedMinutes * 60)
    : formatTime(timer.timeLeft)

  const isActive = timer.state === 'running'

  return (
    <div
      className="mode-transition w-full h-full flex flex-col items-center justify-center gap-8 px-6"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Mode indicator */}
      <ModeIndicator mode={currentMode} />

      {/* Timer ring */}
      <div
        onClick={handleTapTimer}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={isActive ? 'Pause timer' : 'Start timer'}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTapTimer() }}
      >
        <TimerRing
          progress={timer.state === 'idle' ? 0 : timer.progress}
          accentColor={accentColor}
        >
          {/* Time display */}
          <span
            className={`text-5xl font-extralight tabular-nums tracking-wider ${isActive ? 'timer-pulse' : ''}`}
            style={{ color: 'var(--color-text-primary)' }}
          >
            {displayTime}
          </span>

          {/* State hint */}
          <span className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {timer.state === 'idle' && 'Tippen zum Starten'}
            {timer.state === 'running' && 'Tippen zum Pausieren'}
            {timer.state === 'paused' && 'Tippen zum Fortsetzen'}
            {timer.state === 'finished' && 'Fertig! Tippen für Neustart'}
          </span>
        </TimerRing>
      </div>

      {/* Time selector */}
      <TimeSelector
        options={currentOptions}
        selected={selectedMinutes}
        onSelect={handleTimeSelect}
        accentColor={accentColor}
      />

      {/* Rotation hint */}
      {orientation.permissionGranted && (
        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          Drehe dein iPhone um den Modus zu wechseln
        </p>
      )}
    </div>
  )
}

export default App
