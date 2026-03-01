import { useState, useEffect, useCallback, useRef } from 'react'
import { TimerRing } from './components/TimerRing'
import { ModeIndicator } from './components/ModeIndicator'
import { TimeSelector } from './components/TimeSelector'
import { PermissionPrompt } from './components/PermissionPrompt'
import { useTimer } from './hooks/useTimer'
import { useDeviceOrientation, type OrientationMode } from './hooks/useDeviceOrientation'
import { useWakeLock } from './hooks/useWakeLock'
import { useSwipeTime } from './hooks/useSwipeTime'
import { playBell, vibrate } from './utils/audio'
import { formatTime } from './utils/format'

const FOCUS_OPTIONS = [25, 45, 60] // minutes
const BREAK_OPTIONS = [5, 10, 15]  // minutes

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia('(orientation: landscape)').matches
  )
  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)')
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isLandscape
}

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
  const isLandscape = useIsLandscape()

  const currentMode = orientation.permissionGranted ? orientation.mode : 'focus'

  const accentColor = currentMode === 'focus'
    ? 'var(--color-focus-accent)'
    : 'var(--color-break-accent)'
  const accentColorSecondary = currentMode === 'focus'
    ? 'var(--color-focus-accent-secondary)'
    : 'var(--color-break-accent-secondary)'
  const glowColor = currentMode === 'focus' ? '#FF6B6B' : '#4ECDC4'

  const currentOptions = currentMode === 'focus' ? FOCUS_OPTIONS : BREAK_OPTIONS
  const selectedMinutes = currentMode === 'focus' ? focusMinutes : breakMinutes

  const swipe = useSwipeTime({
    timeLeft: timer.timeLeft,
    totalTime: timer.totalTime,
    onAdjust: timer.adjustTimeLeft,
    minTime: 60,
    stepSeconds: 60,
    pixelsPerStep: 30,
  })

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
    // Don't trigger tap if we were swiping
    if (swipe.isSwiping) return

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

  // Show preview time while swiping, otherwise normal display
  const displaySeconds = swipe.previewTime ?? timer.timeLeft
  const displayTime = timer.state === 'idle'
    ? formatTime(selectedMinutes * 60)
    : formatTime(displaySeconds)

  const isActive = timer.state === 'running'
  const canSwipe = timer.state === 'running' || timer.state === 'paused'

  const ringSize = isLandscape ? 220 : 280
  const timerFontClass = isLandscape ? 'text-5xl' : 'text-7xl'

  const timerRingElement = (
    <div
      onClick={handleTapTimer}
      onTouchStart={canSwipe ? swipe.onTouchStart : undefined}
      onTouchMove={canSwipe ? swipe.onTouchMove : undefined}
      onTouchEnd={canSwipe ? swipe.onTouchEnd : undefined}
      className={`cursor-pointer ${swipe.isSwiping ? 'swiping' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={isActive ? 'Pause timer' : 'Start timer'}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTapTimer() }}
    >
      <TimerRing
        progress={timer.state === 'idle' ? 0 : swipe.previewTime !== null
          ? 1 - swipe.previewTime / timer.totalTime
          : timer.progress}
        accentColor={accentColor}
        accentColorSecondary={accentColorSecondary}
        glowColor={glowColor}
        size={ringSize}
      >
        {/* Time display */}
        <span
          className={`${timerFontClass} font-extralight tabular-nums tracking-wider ${isActive && !swipe.isSwiping ? 'timer-pulse' : ''}`}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {displayTime}
        </span>

        {/* State hint */}
        <span className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {swipe.isSwiping && 'Wischen zum Anpassen'}
          {!swipe.isSwiping && timer.state === 'idle' && 'Tippen zum Starten'}
          {!swipe.isSwiping && timer.state === 'running' && 'Tippen zum Pausieren'}
          {!swipe.isSwiping && timer.state === 'paused' && 'Tippen zum Fortsetzen'}
          {!swipe.isSwiping && timer.state === 'finished' && 'Fertig! Tippen für Neustart'}
        </span>

        {/* Swipe hint when timer is active but not swiping */}
        {canSwipe && !swipe.isSwiping && (
          <span className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
            ↕ Wischen für Zeitanpassung
          </span>
        )}
      </TimerRing>
    </div>
  )

  if (isLandscape) {
    return (
      <div className="mode-transition w-full h-full flex flex-row items-center justify-center gap-10 px-8">
        {/* Left side: Mode + Time selector (vertical) */}
        <div className="flex flex-col items-center justify-center gap-6">
          <ModeIndicator mode={currentMode} />
          <TimeSelector
            options={currentOptions}
            selected={selectedMinutes}
            onSelect={handleTimeSelect}
            accentColor={accentColor}
            vertical
          />
        </div>

        {/* Center: Timer ring */}
        {timerRingElement}

        {/* Right side: Rotation hint */}
        {orientation.permissionGranted && (
          <div className="flex flex-col items-center justify-center w-24">
            <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Drehe dein iPhone um den Modus zu wechseln
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="mode-transition w-full h-full flex flex-col items-center justify-center gap-8 px-6"
    >
      {/* Mode indicator */}
      <ModeIndicator mode={currentMode} />

      {/* Timer ring with swipe support */}
      {timerRingElement}

      {/* Time selector */}
      <TimeSelector
        options={currentOptions}
        selected={selectedMinutes}
        onSelect={handleTimeSelect}
        accentColor={accentColor}
      />

      {/* Rotation hint */}
      {orientation.permissionGranted && (
        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          Drehe dein iPhone um den Modus zu wechseln
        </p>
      )}
    </div>
  )
}

export default App
