import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { registerSettingsHandlers, registerCaptureHandlers } from '.'

export function registerIpcHandlers(): void {
  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  registerSettingsHandlers()
  registerCaptureHandlers()
}
