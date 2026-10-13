import dbus, { type MessageBus } from 'dbus-next'

export function isWaylandSession(): boolean {
  return process.platform === 'linux' && process.env.XDG_SESSION_TYPE === 'wayland'
}

export function isKdeWaylandSession(): boolean {
  return isWaylandSession() && (process.env.XDG_CURRENT_DESKTOP ?? '').split(':').includes('KDE')
}

export function createSessionBus(): MessageBus {
  // `unix:path=` makes dbus-next load the native usocket addon, which crashes
  // under Electron's V8 sandbox; `unix:socket=` goes through net.createConnection.
  const busAddress = process.env.DBUS_SESSION_BUS_ADDRESS?.replace(/unix:path=/g, 'unix:socket=')
  return dbus.sessionBus(busAddress ? { busAddress } : undefined)
}
