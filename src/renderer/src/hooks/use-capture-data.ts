import { useState, useEffect, useRef } from 'react'
import type { CaptureData } from '@shared/types'

interface UseCaptureDataReturn {
  captureData: CaptureData | null
  compositeCanvasRef: React.RefObject<HTMLCanvasElement | null>
  setCaptureData: (data: CaptureData | null) => void
}

export function useCaptureData(): UseCaptureDataReturn {
  const [captureData, setCaptureData] = useState<CaptureData | null>(null)
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    window.api.capture.onStart((data) => {
      setCaptureData(data as CaptureData)
    })
  }, [])

  useEffect(() => {
    if (!captureData) return

    const { displays, virtualBounds } = captureData
    const scale = virtualBounds.scaleFactor

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(virtualBounds.width * scale)
    canvas.height = Math.round(virtualBounds.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let loaded = 0
    const images: Array<{ img: HTMLImageElement; index: number }> = []

    displays.forEach((display, index) => {
      const img = new Image()
      img.onload = (): void => {
        images.push({ img, index })
        loaded++
        if (loaded === displays.length) {
          for (const { img: loadedImg, index: i } of images.sort((a, b) => a.index - b.index)) {
            const d = displays[i]
            const dx = Math.round((d.bounds.x - virtualBounds.x) * scale)
            const dy = Math.round((d.bounds.y - virtualBounds.y) * scale)
            const dw = Math.round(d.bounds.width * scale)
            const dh = Math.round(d.bounds.height * scale)
            ctx.drawImage(
              loadedImg,
              0,
              0,
              loadedImg.naturalWidth,
              loadedImg.naturalHeight,
              dx,
              dy,
              dw,
              dh
            )
          }
          compositeCanvasRef.current = canvas
        }
      }
      img.src = display.imageDataURL
    })
  }, [captureData])

  return { captureData, compositeCanvasRef, setCaptureData }
}
