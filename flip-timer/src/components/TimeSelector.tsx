interface TimeSelectorProps {
  options: number[] // minutes
  selected: number
  onSelect: (minutes: number) => void
  accentColor: string
}

export function TimeSelector({ options, selected, onSelect, accentColor }: TimeSelectorProps) {
  return (
    <div className="flex gap-3 justify-center">
      {options.map((minutes) => (
        <button
          key={minutes}
          onClick={() => onSelect(minutes)}
          className="btn-press w-14 h-14 rounded-full text-sm font-medium transition-all duration-300 border-2"
          style={{
            borderColor: selected === minutes ? accentColor : 'var(--color-ring-track)',
            color: selected === minutes ? accentColor : 'var(--color-text-muted)',
            backgroundColor: selected === minutes
              ? `${accentColor}15`
              : 'transparent',
          }}
        >
          {minutes}
        </button>
      ))}
    </div>
  )
}
