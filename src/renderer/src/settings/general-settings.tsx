import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { OCR_LANGUAGES } from '@shared/constants'
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

function LanguagePills({
  active,
  onToggle
}: {
  active: string[]
  onToggle: (code: string) => void
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {OCR_LANGUAGES.map((lang) => {
        const isActive = active.includes(lang.code)
        const isLast = isActive && active.length <= 1

        return (
          <button
            key={lang.code}
            onClick={() => {
              if (!isLast) onToggle(lang.code)
            }}
            title={isLast ? 'At least one language required' : undefined}
            className={`h-7 px-3 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer select-none inline-flex items-center gap-1.5 ${
              isActive
                ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400/50 hover:text-blue-200'
                : 'bg-white/5 border-white/10 text-neutral-500 hover:bg-white/8 hover:border-white/15 hover:text-neutral-400'
            } ${isLast ? 'opacity-70' : ''}`}
          >
            {lang.label}
            {isActive && <span className="text-[10px] text-blue-400/70">✓</span>}
          </button>
        )
      })}
    </div>
  )
}

export function GeneralSettings({
  settings,
  onUpdateSetting
}: GeneralSettingsProps): React.JSX.Element {
  const toggleLanguage = (code: string): void => {
    const current = settings.ocrLanguages
    if (current.includes(code)) {
      if (current.length <= 1) return
      onUpdateSetting(
        'ocrLanguages',
        current.filter((l) => l !== code)
      )
    } else {
      onUpdateSetting('ocrLanguages', [...current, code])
    }
  }

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
        </div>
      </section>

      <Separator className="opacity-50" />

      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-2">
          OCR
        </p>
        <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 -mx-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Languages</span>
            <span className="text-xs text-muted-foreground leading-tight">
              Add languages for text recognition
            </span>
          </div>
          <LanguagePills active={settings.ocrLanguages} onToggle={toggleLanguage} />
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
