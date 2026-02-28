interface PermissionPromptProps {
  onRequest: () => void
  denied: boolean
}

export function PermissionPrompt({ onRequest, denied }: PermissionPromptProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg-primary)] z-50 p-8">
      <div className="text-center animate-fade-in max-w-xs">
        {/* Timer icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-[var(--color-focus-accent)] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-focus-accent)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h1 className="text-2xl font-light mb-3 text-[var(--color-text-primary)]">
          Flip Timer
        </h1>

        <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
          {denied
            ? 'Sensor-Zugriff wurde abgelehnt. Du kannst die App trotzdem manuell bedienen, oder erlaube den Zugriff in den Safari-Einstellungen.'
            : 'Flip Timer nutzt den Bewegungssensor deines iPhones, um zwischen Fokus und Pause zu wechseln. Drehe dein Handy auf der Ladestation um den Modus zu ändern.'}
        </p>

        {!denied && (
          <button
            onClick={onRequest}
            className="btn-press px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 border-2 border-[var(--color-focus-accent)] text-[var(--color-focus-accent)] hover:bg-[var(--color-focus-accent)] hover:text-white"
          >
            Sensoren aktivieren
          </button>
        )}

        {denied && (
          <button
            onClick={onRequest}
            className="btn-press px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 border-2 border-[var(--color-text-muted)] text-[var(--color-text-muted)]"
          >
            Ohne Sensoren fortfahren
          </button>
        )}
      </div>
    </div>
  )
}
