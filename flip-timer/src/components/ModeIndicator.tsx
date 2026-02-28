import type { OrientationMode } from '../hooks/useDeviceOrientation'

interface ModeIndicatorProps {
  mode: OrientationMode
}

export function ModeIndicator({ mode }: ModeIndicatorProps) {
  return (
    <div className="mode-transition text-center">
      <span
        className="text-sm font-medium tracking-[0.3em] uppercase"
        style={{
          color: mode === 'focus'
            ? 'var(--color-focus-accent)'
            : 'var(--color-break-accent)',
        }}
      >
        {mode === 'focus' ? 'Fokus' : 'Pause'}
      </span>
    </div>
  )
}
