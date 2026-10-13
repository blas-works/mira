import { desktopCapturer, nativeImage, screen } from 'electron'
import type { CaptureData, DisplayCapture } from '../../shared/types'
import { isWaylandSession } from './dbus'
import { capturePortalScreenshot } from './portal-screenshot'

export async function captureAllScreens(): Promise<CaptureData> {
  const displays = screen.getAllDisplays()

  const minX = Math.min(...displays.map((d) => d.bounds.x))
  const minY = Math.min(...displays.map((d) => d.bounds.y))
  const maxX = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width))
  const maxY = Math.max(...displays.map((d) => d.bounds.y + d.bounds.height))

  const virtualWidth = maxX - minX
  const virtualHeight = maxY - minY
  const primaryScale = screen.getPrimaryDisplay().scaleFactor

  const virtualBounds = {
    x: minX,
    y: minY,
    width: virtualWidth,
    height: virtualHeight,
    scaleFactor: primaryScale
  }

  if (isWaylandSession()) {
    try {
      const png = await capturePortalScreenshot()
      return { displays: cropWorkspace(png, displays, virtualBounds), virtualBounds }
    } catch (err) {
      console.warn('Screenshot portal failed, falling back to desktopCapturer:', err)
    }
  }

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: Math.round(virtualWidth * primaryScale),
      height: Math.round(virtualHeight * primaryScale)
    }
  })

  if (sources.length === 0) {
    throw new Error('No screen sources available')
  }

  const displayCaptures = displays.map((display) => {
    const source = sources.find((s) => s.display_id === display.id.toString()) ?? sources[0]

    return {
      imageDataURL: source.thumbnail.toDataURL(),
      bounds: {
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        scaleFactor: display.scaleFactor
      }
    }
  })

  return { displays: displayCaptures, virtualBounds }
}

function cropWorkspace(
  png: Buffer,
  displays: Electron.Display[],
  virtualBounds: CaptureData['virtualBounds']
): DisplayCapture[] {
  const image = nativeImage.createFromBuffer(png)
  const { width, height } = image.getSize()
  const ratioX = width / virtualBounds.width
  const ratioY = height / virtualBounds.height

  return displays.map((display) => ({
    imageDataURL: image
      .crop({
        x: Math.round((display.bounds.x - virtualBounds.x) * ratioX),
        y: Math.round((display.bounds.y - virtualBounds.y) * ratioY),
        width: Math.round(display.bounds.width * ratioX),
        height: Math.round(display.bounds.height * ratioY)
      })
      .toDataURL(),
    bounds: {
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      scaleFactor: display.scaleFactor
    }
  }))
}
