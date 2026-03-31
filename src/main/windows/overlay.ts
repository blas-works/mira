import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import type { CaptureData } from '../../shared/types'
import { IPC_CHANNELS } from '../../shared/constants'

let overlayWindow: BrowserWindow | null = null

export function createOverlayWindow(captureData: CaptureData): void {
  destroyOverlayWindow()

  const { virtualBounds } = captureData

  overlayWindow = new BrowserWindow({
    x: virtualBounds.x,
    y: virtualBounds.y,
    width: virtualBounds.width,
    height: virtualBounds.height,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    fullscreenable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setIgnoreMouseEvents(false)

  overlayWindow.on('ready-to-show', () => {
    overlayWindow?.show()
    overlayWindow?.focus()
    overlayWindow?.webContents.send(IPC_CHANNELS.CAPTURE_START, captureData)
  })

  overlayWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay.html`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/overlay.html'))
  }
}

export function isOverlayActive(): boolean {
  return overlayWindow !== null && !overlayWindow.isDestroyed()
}

export function destroyOverlayWindow(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy()
    overlayWindow = null
  }
}
