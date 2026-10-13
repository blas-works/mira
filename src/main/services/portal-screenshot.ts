import { readFile, unlink } from 'fs/promises'
import { fileURLToPath } from 'url'
import { Message, MessageType, Variant } from 'dbus-next'
import { createSessionBus } from './dbus'

const PORTAL_NAME = 'org.freedesktop.portal.Desktop'
const PORTAL_PATH = '/org/freedesktop/portal/desktop'
const REQUEST_IFACE = 'org.freedesktop.portal.Request'
const RESPONSE_TIMEOUT_MS = 30_000

/**
 * Takes a non-interactive screenshot of the whole workspace through the
 * xdg-desktop-portal Screenshot API. On Wayland, desktopCapturer only returns
 * a single user-picked screen without display_id, so it cannot be mapped to displays.
 */
export async function capturePortalScreenshot(): Promise<Buffer> {
  const bus = createSessionBus()

  try {
    await bus.call(
      new Message({
        destination: 'org.freedesktop.DBus',
        path: '/org/freedesktop/DBus',
        interface: 'org.freedesktop.DBus',
        member: 'AddMatch',
        signature: 's',
        body: [`type='signal',interface='${REQUEST_IFACE}',member='Response'`]
      })
    )

    const uniqueName = (bus as unknown as { name: string }).name
    const token = `mira_${Date.now()}`
    const requestPath = `${PORTAL_PATH}/request/${uniqueName.slice(1).replace(/\./g, '_')}/${token}`

    const response = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Screenshot portal timed out')),
        RESPONSE_TIMEOUT_MS
      )

      bus.on('message', (msg) => {
        if (msg.type !== MessageType.SIGNAL || msg.path !== requestPath) return
        if (msg.interface !== REQUEST_IFACE || msg.member !== 'Response') return

        clearTimeout(timer)
        const [code, results] = msg.body as [number, Record<string, Variant<string>>]
        if (code !== 0 || !results.uri) {
          reject(new Error(`Screenshot portal returned code ${code}`))
          return
        }
        resolve(results.uri.value)
      })
    })

    await bus.call(
      new Message({
        destination: PORTAL_NAME,
        path: PORTAL_PATH,
        interface: 'org.freedesktop.portal.Screenshot',
        member: 'Screenshot',
        signature: 'sa{sv}',
        body: [
          '',
          {
            handle_token: new Variant('s', token),
            interactive: new Variant('b', false)
          }
        ]
      })
    )

    const filePath = fileURLToPath(await response)
    const png = await readFile(filePath)
    await unlink(filePath).catch(() => {})
    return png
  } finally {
    bus.disconnect()
  }
}
