import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import type { AppSettings } from '../../shared/types'
import { getSettings, updateSettings, setShortcut } from '../services/store'
import { reregisterShortcuts } from '../services/shortcuts'
import { settingsUpdateSchema, shortcutRegisterSchema } from './validators'

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_LOAD, () => {
    return getSettings()
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, (_event, partial: unknown) => {
    const result = settingsUpdateSchema.safeParse(partial)
    if (!result.success) {
      throw new Error(`Invalid settings payload: ${result.error.message}`)
    }
    return updateSettings(result.data as Partial<AppSettings>)
  })

  ipcMain.handle(IPC_CHANNELS.SHORTCUT_REGISTER, (_event, payload: unknown) => {
    const result = shortcutRegisterSchema.safeParse(payload)
    if (!result.success) {
      throw new Error(`Invalid shortcut payload: ${result.error.message}`)
    }
    setShortcut(result.data.action, result.data.keys)
    reregisterShortcuts()
    return getSettings()
  })
}
