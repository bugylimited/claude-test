interface TimerRingProps {
  progress: number // 0 to 1
  accentColor: string
  accentColorSecondary?: string
  glowColor?: string
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
}

export function TimerRing({
  progress,
  accentColor,
  accentColorSecondary,
  glowColor,
  size = 280,
  strokeWidth = 6,
  children,
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)
  const gradientId = 'timer-gradient'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ '--glow-color': glowColor || accentColor } as React.CSSProperties}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColorSecondary || accentColor} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ring-track)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="timer-ring-progress"
          style={{ '--glow-color': glowColor || accentColor } as React.CSSProperties}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
