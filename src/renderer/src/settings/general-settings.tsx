import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import type { AppSettings } from '@shared/types'

interface GeneralSettingsProps {
  settings: AppSettings
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

interface SettingRowProps {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

function SettingRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  disabled
}: SettingRowProps): React.JSX.Element {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 rounded-lg px-3 py-3 -mx-1 transition-colors ${
        disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer hover:bg-white/3'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {title}
          {disabled && <span className="text-[11px]">🚧</span>}
        </span>
        <span className="text-xs text-muted-foreground leading-tight">{description}</span>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </label>
  )
}

export function GeneralSettings({
  settings,
  onUpdateSetting
}: GeneralSettingsProps): React.JSX.Element {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-2">
          Capture
        </p>
        <div className="space-y-0.5">
          <SettingRow
            id="sound"
            title="Capture sound"
            description="Play sound when taking a screenshot"
            checked={settings.captureSound}
            onCheckedChange={(checked) => onUpdateSetting('captureSound', checked)}
            disabled
          />
          <SettingRow
            id="magnifier"
            title="Show magnifier"
            description="Helps select with pixel precision"
            checked={settings.showMagnifier}
            onCheckedChange={(checked) => onUpdateSetting('showMagnifier', checked)}
            disabled
          />
        </div>
      </section>

      <Separator className="opacity-50" />

      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-2">
          System
        </p>
        <SettingRow
          id="startup"
          title="Launch at startup"
          description="Open automatically when the computer starts"
          checked={settings.launchAtStartup}
          onCheckedChange={(checked) => onUpdateSetting('launchAtStartup', checked)}
        />
      </section>
    </div>
  )
}
