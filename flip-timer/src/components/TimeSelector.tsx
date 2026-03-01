interface TimeSelectorProps {
  options: number[] // minutes
  selected: number
  onSelect: (minutes: number) => void
  accentColor: string
  vertical?: boolean
}

export function TimeSelector({ options, selected, onSelect, accentColor, vertical }: TimeSelectorProps) {
  return (
    <div className={`flex gap-3 justify-center ${vertical ? 'flex-col items-center' : ''}`}>
      {options.map((minutes) => (
        <button
          key={minutes}
          onClick={() => onSelect(minutes)}
          className="btn-press w-16 h-16 rounded-full text-base font-medium transition-all duration-300 border-2"
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
