import { randomUUID } from 'crypto'
import { readFile, stat, unlink } from 'fs/promises'
import { fileURLToPath } from 'url'
import { Message, MessageType, Variant } from 'dbus-next'
import { createSessionBus } from './dbus'

const PORTAL_NAME = 'org.freedesktop.portal.Desktop'
const PORTAL_PATH = '/org/freedesktop/portal/desktop'
const REQUEST_IFACE = 'org.freedesktop.portal.Request'
const RESPONSE_TIMEOUT_MS = 30_000
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function dbusCall(member: string, signature: string, body: unknown[]): Message {
  return new Message({
    destination: 'org.freedesktop.DBus',
    path: '/org/freedesktop/DBus',
    interface: 'org.freedesktop.DBus',
    member,
    signature,
    body
  })
}

/**
 * Takes a non-interactive screenshot of the whole workspace through the
 * xdg-desktop-portal Screenshot API. On Wayland, desktopCapturer only returns
 * a single user-picked screen without display_id, so it cannot be mapped to displays.
 */
export async function capturePortalScreenshot(): Promise<Buffer> {
  const bus = createSessionBus()
  const requestedAt = Date.now()

  try {
    // Only trust Response signals emitted by the portal itself: any other bus
    // client could forge one pointing at an arbitrary file we would then delete.
    const ownerReply = await bus.call(dbusCall('GetNameOwner', 's', [PORTAL_NAME]))
    const portalOwner = ownerReply?.body[0] as string

    await bus.call(
      dbusCall('AddMatch', 's', [
        `type='signal',sender='${portalOwner}',interface='${REQUEST_IFACE}',member='Response'`
      ])
    )

    const uniqueName = (bus as unknown as { name: string }).name
    const token = `mira_${randomUUID().replace(/-/g, '')}`
    let requestPath = `${PORTAL_PATH}/request/${uniqueName.slice(1).replace(/\./g, '_')}/${token}`

    const response = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Screenshot portal timed out')),
        RESPONSE_TIMEOUT_MS
      )

      bus.on('message', (msg) => {
        if (msg.type !== MessageType.SIGNAL || msg.sender !== portalOwner) return
        if (msg.path !== requestPath) return
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

    const reply = await bus.call(
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
    // Older portals ignore handle_token; the returned handle is authoritative.
    requestPath = (reply?.body[0] as string) ?? requestPath

    const filePath = fileURLToPath(await response)
    const png = await readFile(filePath)
    if (!png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      throw new Error('Screenshot portal returned a non-PNG file')
    }

    // The portal leaves its file in the user's pictures folder; remove it only
    // when it is the PNG created for this request.
    const { mtimeMs } = await stat(filePath)
    if (mtimeMs >= requestedAt - 1000) {
      await unlink(filePath).catch(() => {})
    }
    return png
  } finally {
    bus.disconnect()
  }
}
