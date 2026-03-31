import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import type { EditorData } from '../../shared/types'
import { IPC_CHANNELS } from '../../shared/constants'
import { getAppIconPath } from '../services/tray'

let editorWindow: BrowserWindow | null = null

const TOOLBAR_SIDE_WIDTH = 56
const TITLEBAR_HEIGHT = 40
const CONTENT_PADDING = 24
const MAX_SCREEN_RATIO = 0.85

export function createEditorWindow(editorData: EditorData): void {
  destroyEditorWindow()

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: workWidth, height: workHeight } = primaryDisplay.workAreaSize
  const workArea = primaryDisplay.workArea

  const maxWidth = Math.floor(workWidth * MAX_SCREEN_RATIO)
  const maxHeight = Math.floor(workHeight * MAX_SCREEN_RATIO)

  const idealWidth = editorData.width + TOOLBAR_SIDE_WIDTH + CONTENT_PADDING
  const idealHeight = editorData.height + TITLEBAR_HEIGHT + CONTENT_PADDING

  const windowWidth = Math.min(idealWidth, maxWidth)
  const windowHeight = Math.min(idealHeight, maxHeight)

  const x = Math.round(workArea.x + (workWidth - windowWidth) / 2)
  const y = Math.round(workArea.y + (workHeight - windowHeight) / 2)

  editorWindow = new BrowserWindow({
    x,
    y,
    width: windowWidth,
    height: windowHeight,
    minWidth: 300,
    minHeight: 200,
    frame: false,
    resizable: true,
    transparent: false,
    backgroundColor: '#0a0a0a',
    ...(process.platform !== 'darwin' && getAppIconPath() && { icon: getAppIconPath() }),
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  editorWindow.setAlwaysOnTop(true, 'floating')

  editorWindow.on('ready-to-show', () => {
    editorWindow?.show()
    editorWindow?.focus()
    editorWindow?.webContents.send(IPC_CHANNELS.EDITOR_INIT, editorData)
  })

  editorWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })

  editorWindow.on('closed', () => {
    editorWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    editorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/editor.html`)
  } else {
    editorWindow.loadFile(join(__dirname, '../renderer/editor.html'))
  }
}

export function getEditorWindow(): BrowserWindow | null {
  return editorWindow
}

export function isEditorActive(): boolean {
  return editorWindow !== null && !editorWindow.isDestroyed()
}

export function destroyEditorWindow(): void {
  if (editorWindow && !editorWindow.isDestroyed()) {
    editorWindow.destroy()
    editorWindow = null
  }
}
