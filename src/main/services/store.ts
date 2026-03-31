import { app } from 'electron'
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { DEFAULT_SETTINGS } from '../../shared/constants'
import type { AppSettings } from '../../shared/types'

interface ElectronStore {
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
}

let store: ElectronStore | null = null

export async function initStore(): Promise<void> {
  const mod = await import('electron-store')
  const Store = 'default' in mod ? mod.default : mod
  store = new Store({ defaults: DEFAULT_SETTINGS }) as ElectronStore
}

export function getStore(): ElectronStore | null {
  return store
}

function requireStore(): ElectronStore {
  if (!store) throw new Error('Store not initialized')
  return store
}

export function getSettings(): AppSettings {
  const st = requireStore()
  return {
    launchAtStartup: st.get('launchAtStartup') as boolean,
    captureSound: st.get('captureSound') as boolean,
    showMagnifier: st.get('showMagnifier') as boolean,
    shortcuts: st.get('shortcuts') as AppSettings['shortcuts']
  }
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const st = requireStore()
  for (const [key, value] of Object.entries(partial)) {
    st.set(key, value)
  }

  if ('launchAtStartup' in partial) {
    applyLaunchAtStartup()
  }

  return getSettings()
}

export function applyLaunchAtStartup(): void {
  const settings = getSettings()
  const enabled = settings.launchAtStartup

  if (process.platform === 'linux') {
    applyLinuxAutostart(enabled)
  } else {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      ...(process.platform === 'win32' && { path: app.getPath('exe') })
    })
  }
}

function applyLinuxAutostart(enabled: boolean): void {
  const autostartDir = join(app.getPath('home'), '.config', 'autostart')
  const desktopFilePath = join(autostartDir, `${app.getName()}.desktop`)

  if (!enabled) {
    if (existsSync(desktopFilePath)) {
      unlinkSync(desktopFilePath)
    }
    return
  }

  const execPath = process.env['APPIMAGE'] ?? app.getPath('exe')
  const desktopEntry = [
    '[Desktop Entry]',
    'Type=Application',
    `Name=${app.getName()}`,
    `Exec="${execPath}"`,
    'Terminal=false',
    'StartupNotify=false',
    `Comment=${app.getName()} screenshot tool`,
    'Categories=Utility;',
    'X-GNOME-Autostart-enabled=true'
  ].join('\n')

  if (!existsSync(autostartDir)) {
    mkdirSync(autostartDir, { recursive: true })
  }
  writeFileSync(desktopFilePath, desktopEntry, 'utf-8')
}

export function getShortcut(action: keyof AppSettings['shortcuts']): string {
  return requireStore().get(`shortcuts.${action}`) as string
}

const VALID_SHORTCUT_ACTIONS = new Set(['captureArea'])

export function setShortcut(action: string, keys: string): void {
  if (!VALID_SHORTCUT_ACTIONS.has(action)) {
    throw new Error(`Invalid shortcut action: ${action}`)
  }
  requireStore().set(`shortcuts.${action}`, keys)
}
