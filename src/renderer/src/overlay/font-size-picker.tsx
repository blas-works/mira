import { FONT_SIZES } from '@shared/constants'

interface FontSizePickerProps {
  activeFontSize: number
  onFontSizeChange: (size: number) => void
}

export function FontSizePicker({
  activeFontSize,
  onFontSizeChange
}: FontSizePickerProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      {FONT_SIZES.map(({ label, value }) => (
        <button
          key={label}
          onClick={() => onFontSizeChange(value)}
          className={`w-8 h-6 rounded-md text-[10px] font-semibold flex items-center justify-center transition-all duration-150 ${
            activeFontSize === value
              ? 'bg-accent-blue-muted text-accent-blue ring-1 ring-(--accent-blue)/30'
              : 'text-neutral-400 hover:bg-white/6 hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
