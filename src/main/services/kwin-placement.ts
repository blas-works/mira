import { app } from 'electron'
import { randomUUID } from 'crypto'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { Message } from 'dbus-next'
import type { DisplayBounds } from '../../shared/types'
import { createSessionBus } from './dbus'

const KWIN_NAME = 'org.kde.KWin'

/**
 * Wayland clients cannot position their own windows, so KWin drops the overlay
 * at an arbitrary origin. A one-shot KWin script moves it onto the virtual bounds.
 */
export async function placeWindowWithKWin(caption: string, bounds: DisplayBounds): Promise<void> {
  const pluginName = `mira-placement-${randomUUID()}`
  const geometry = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }

  // KWin runs this script inside the compositor, so it must not be writable by
  // anyone else: private 0700 directory, exclusive create, 0600 file.
  const scriptDir = await mkdtemp(join(app.getPath('temp'), 'mira-kwin-'))
  const scriptPath = join(scriptDir, `${pluginName}.js`)

  try {
    await writeFile(
      scriptPath,
      `for (const w of workspace.windowList()) {
  if (w.caption === ${JSON.stringify(caption)} && w.pid === ${process.pid}) {
    w.keepAbove = true
    w.frameGeometry = ${JSON.stringify(geometry)}
  }
}`,
      { flag: 'wx', mode: 0o600 }
    )
    await runKWinScript(scriptPath, pluginName)
  } finally {
    await rm(scriptDir, { recursive: true, force: true }).catch(() => {})
  }
}

async function runKWinScript(scriptPath: string, pluginName: string): Promise<void> {
  const bus = createSessionBus()
  const call = (
    path: string,
    iface: string,
    member: string,
    signature = '',
    body: unknown[] = []
  ): Promise<Message | null> =>
    bus.call(
      new Message({ destination: KWIN_NAME, path, interface: iface, member, signature, body })
    )

  try {
    const reply = await call('/Scripting', 'org.kde.kwin.Scripting', 'loadScript', 'ss', [
      scriptPath,
      pluginName
    ])
    const scriptId = reply?.body[0] as number
    try {
      await call(`/Scripting/Script${scriptId}`, 'org.kde.kwin.Script', 'run')
    } finally {
      await call('/Scripting', 'org.kde.kwin.Scripting', 'unloadScript', 's', [pluginName])
    }
  } finally {
    bus.disconnect()
  }
}
