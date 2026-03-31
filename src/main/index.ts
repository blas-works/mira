import { app, systemPreferences, BrowserWindow, Menu, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createTray } from './services/tray'
import { registerShortcuts, unregisterAllShortcuts } from './services/shortcuts'
import { captureAllScreens } from './services/capture'
import { createSettingsWindow } from './windows/settings'
import { createOverlayWindow, isOverlayActive } from './windows/overlay'
import { isEditorActive } from './windows/editor'
import { registerIpcHandlers } from './ipc/handlers'
import { initStore, applyLaunchAtStartup, getStore } from './services/store'
import {
  setupAutoUpdater,
  checkPendingUpdate,
  startPolling,
  setMainWindow,
  checkForUpdates,
  getUpdateStatus,
  forceRestart,
  snoozeCriticalRestart,
  runBrewUpgrade
} from './auto-updater'

function registerUpdateHandlers(): void {
  ipcMain.handle('update:check', () => {
    checkForUpdates()
    return true
  })

  ipcMain.handle('update:get-status', () => {
    return getUpdateStatus()
  })

  ipcMain.handle('update:restart', () => {
    forceRestart()
    return true
  })

  ipcMain.handle('update:snooze', () => {
    snoozeCriticalRestart()
    return true
  })

  ipcMain.handle('update:brew-upgrade', () => {
    runBrewUpgrade()
    return true
  })
}

function checkScreenPermission(): boolean {
  if (process.platform !== 'darwin') return true
  const status = systemPreferences.getMediaAccessStatus('screen')
  return status === 'granted'
}

async function handleCapture(): Promise<void> {
  if (isOverlayActive() || isEditorActive()) return

  if (!checkScreenPermission()) {
    console.warn('Screen recording permission not granted')
    createSettingsWindow()
    return
  }

  try {
    const captureData = await captureAllScreens()
    createOverlayWindow(captureData)
  } catch (err) {
    console.error('Capture failed:', err)
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.mira.app')
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Edit',
        submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }]
      }
    ])
  )
  await initStore()
  applyLaunchAtStartup()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  if (process.platform === 'darwin') {
    app.dock?.hide()
  }

  registerIpcHandlers()
  registerUpdateHandlers()

  createTray({
    onCaptureArea: handleCapture,
    onOpenSettings: () => {
      const win = createSettingsWindow()
      setMainWindow(win)
    },
    onQuit: () => app.quit()
  })

  registerShortcuts({
    onCapture: handleCapture
  })

  const store = getStore()
  if (store) {
    setupAutoUpdater(null, store)
    checkPendingUpdate()
    startPolling()
  }
})

app.on('window-all-closed', () => {
  // Keep app running — tray-only app
})

app.on('will-quit', () => {
  unregisterAllShortcuts()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSettingsWindow()
  }
})
