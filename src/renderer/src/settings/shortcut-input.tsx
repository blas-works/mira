import { useShortcutRecorder } from '@/hooks/use-shortcut-recorder'

interface ShortcutInputProps {
  value: string
  onShortcutChange: (accelerator: string) => void
}

const isMac = navigator.platform.includes('Mac')

function acceleratorToDisplay(accelerator: string): string {
  return accelerator
    .replace('CommandOrControl', isMac ? '⌘' : 'Ctrl')
    .replace('Shift', isMac ? '⇧' : 'Shift')
    .replace('Alt', isMac ? '⌥' : 'Alt')
    .replace(/\+/g, ' + ')
}

export function ShortcutInput({ value, onShortcutChange }: ShortcutInputProps): React.JSX.Element {
  const { recording, displayValue, startRecording } = useShortcutRecorder({
    onRecord: onShortcutChange
  })

  return (
    <div className="flex items-center gap-2">
      <div
        onClick={startRecording}
        className={`flex h-9 flex-1 items-center justify-center rounded-lg border bg-muted/20 font-mono text-[13px] cursor-pointer select-none transition-all ${
          recording
            ? 'border-accent-blue ring-2 ring-(--accent-blue)/20 animate-pulse text-foreground'
            : 'border-border hover:bg-muted/40 text-muted-foreground'
        }`}
      >
        <span className="tracking-wide">
          {recording ? displayValue : acceleratorToDisplay(value)}
        </span>
      </div>
      <button
        onClick={startRecording}
        disabled={recording}
        className="h-9 px-3 rounded-lg border border-border bg-background text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-40"
      >
        {recording ? 'Recording...' : 'Change'}
      </button>
    </div>
  )
}
