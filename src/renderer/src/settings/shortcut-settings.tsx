import { ShortcutInput } from './shortcut-input'
import type { AppSettings } from '@shared/types'

interface ShortcutSettingsProps {
  settings: AppSettings
  onUpdateShortcut: (action: string, keys: string) => void
}

export function ShortcutSettings({
  settings,
  onUpdateShortcut
}: ShortcutSettingsProps): React.JSX.Element {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-2">
          Capture
        </p>
        <div className="rounded-lg px-3 py-3 -mx-1">
          <div className="flex flex-col gap-0.5 mb-3">
            <span className="text-sm font-medium text-foreground">Capture area</span>
            <span className="text-xs text-muted-foreground leading-tight">
              Freeze all screens and select an area
            </span>
          </div>
          <ShortcutInput
            value={settings.shortcuts.captureArea}
            onShortcutChange={(keys) => onUpdateShortcut('captureArea', keys)}
          />
        </div>
      </section>
    </div>
  )
}
