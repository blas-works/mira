import { desktopCapturer, screen } from 'electron'
import type { CaptureData } from '../../shared/types'

export async function captureAllScreens(): Promise<CaptureData> {
  const displays = screen.getAllDisplays()

  const minX = Math.min(...displays.map((d) => d.bounds.x))
  const minY = Math.min(...displays.map((d) => d.bounds.y))
  const maxX = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width))
  const maxY = Math.max(...displays.map((d) => d.bounds.y + d.bounds.height))

  const virtualWidth = maxX - minX
  const virtualHeight = maxY - minY
  const primaryScale = screen.getPrimaryDisplay().scaleFactor

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

  return {
    displays: displayCaptures,
    virtualBounds: {
      x: minX,
      y: minY,
      width: virtualWidth,
      height: virtualHeight,
      scaleFactor: primaryScale
    }
  }
}
