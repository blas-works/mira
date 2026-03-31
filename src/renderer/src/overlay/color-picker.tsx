import { ANNOTATION_COLORS } from '@shared/constants'

interface ColorPickerProps {
  activeColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({ activeColor, onColorChange }: ColorPickerProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {ANNOTATION_COLORS.map(({ name, value }) => (
        <button
          key={name}
          onClick={() => onColorChange(value)}
          className={`w-5 h-5 rounded-full transition-all duration-150 ${
            activeColor === value
              ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-(--toolbar-bg) scale-110'
              : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-110'
          }`}
          style={{ backgroundColor: value }}
          title={name}
        />
      ))}
    </div>
  )
}
