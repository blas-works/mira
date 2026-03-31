import { Tray, Menu, nativeImage as ni, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

let tray: Tray | null = null

interface TrayCallbacks {
  onCaptureArea: () => void
  onOpenSettings: () => void
  onQuit: () => void
}

function resolveResource(filename: string): string {
  if (is.dev) {
    return join(app.getAppPath(), 'resources', filename)
  }
  return join(process.resourcesPath, filename)
}

function findIcon(filename: string): Electron.NativeImage {
  const p = resolveResource(filename)
  const img = ni.createFromPath(p)
  if (img.isEmpty()) {
    console.error(`[Tray] Icon not found: ${p}`)
  }
  return img
}

export function getAppIconPath(): string {
  return resolveResource('icon.png')
}

function loadTrayIcon(): Electron.NativeImage {
  if (process.platform === 'darwin') {
    const retina = findIcon('trayTemplate@2x.png')
    if (!retina.isEmpty()) {
      retina.setTemplateImage(true)
      return retina
    }
    const icon = findIcon('trayTemplate.png')
    if (!icon.isEmpty()) {
      icon.setTemplateImage(true)
      return icon
    }
  }

  if (process.platform === 'win32') {
    const icon = findIcon('tray-windows.png')
    if (!icon.isEmpty()) return icon.resize({ width: 16, height: 16 })
  }

  if (process.platform === 'linux') {
    const icon = findIcon('tray-linux.png')
    if (!icon.isEmpty()) return icon
  }

  // Fallback to app icon
  const fallback = findIcon('icon.png')
  if (!fallback.isEmpty()) {
    return fallback.resize({ width: 22, height: 22 })
  }

  return ni.createEmpty()
}

export function createTray(callbacks: TrayCallbacks): Tray {
  const icon = loadTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('Mira')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Capture Area',
      click: callbacks.onCaptureArea
    },
    { type: 'separator' },
    {
      label: 'Preferences...',
      click: callbacks.onOpenSettings
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: callbacks.onQuit
    }
  ])

  tray.setContextMenu(contextMenu)
  return tray
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
