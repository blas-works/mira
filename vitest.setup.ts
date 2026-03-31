import { vi, afterEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/app/path'),
    on: vi.fn(),
    whenReady: vi.fn(() => Promise.resolve()),
    quit: vi.fn(),
    hide: vi.fn(),
    getName: vi.fn(() => 'mira'),
    isPackaged: true
  },
  BrowserWindow: vi.fn(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    on: vi.fn(),
    show: vi.fn(),
    close: vi.fn(),
    hide: vi.fn(),
    webContents: {
      send: vi.fn()
    }
  })),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn()
  },
  ipcRenderer: {
    send: vi.fn(),
    invoke: vi.fn(),
    on: vi.fn()
  },
  clipboard: {
    writeImage: vi.fn(),
    writeText: vi.fn(),
    readText: vi.fn()
  },
  desktopCapturer: {
    getSources: vi.fn(() => Promise.resolve([]))
  },
  screen: {
    getAllDisplays: vi.fn(() => []),
    getPrimaryDisplay: vi.fn(() => ({
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      scaleFactor: 1
    }))
  },
  globalShortcut: {
    register: vi.fn(),
    unregister: vi.fn(),
    unregisterAll: vi.fn()
  },
  Tray: vi.fn(() => ({
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn()
  })),
  Menu: {
    buildFromTemplate: vi.fn()
  },
  nativeImage: {
    createFromDataURL: vi.fn(() => ({
      toPNG: vi.fn(() => Buffer.from([])),
      toDataURL: vi.fn(() => 'data:image/png;base64,'),
      getSize: vi.fn(() => ({ width: 100, height: 100 }))
    })),
    createFromPath: vi.fn(() => ({
      resize: vi.fn()
    }))
  },
  dialog: {
    showSaveDialog: vi.fn(() => Promise.resolve({ canceled: false, filePath: '/mock/save.png' }))
  },
  contextBridge: {
    exposeInMainWorld: vi.fn()
  },
  shell: {
    openPath: vi.fn()
  }
}))

vi.mock('electron-store', () => ({
  default: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    has: vi.fn(),
    store: {}
  }))
}))

vi.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdates: vi.fn(),
    on: vi.fn(),
    quitAndInstall: vi.fn()
  }
}))

Object.defineProperty(window, 'api', {
  value: {
    window: { close: vi.fn() },
    settings: {
      load: vi.fn(() => Promise.resolve({})),
      update: vi.fn(() => Promise.resolve({})),
      registerShortcut: vi.fn(() => Promise.resolve({}))
    },
    capture: {
      onStart: vi.fn(),
      openEditor: vi.fn(),
      copy: vi.fn(),
      save: vi.fn(),
      cancel: vi.fn()
    },
    editor: {
      onInit: vi.fn(),
      copy: vi.fn(),
      save: vi.fn(),
      cancel: vi.fn(),
      resize: vi.fn()
    },
    update: {
      check: vi.fn(() => Promise.resolve(true)),
      getStatus: vi.fn(() => Promise.resolve({ available: false })),
      restart: vi.fn(() => Promise.resolve(true)),
      snooze: vi.fn(() => Promise.resolve(true)),
      brewUpgrade: vi.fn(() => Promise.resolve(true)),
      onStatus: vi.fn(() => vi.fn())
    }
  },
  writable: true
})

afterEach(() => {
  vi.clearAllMocks()
})
