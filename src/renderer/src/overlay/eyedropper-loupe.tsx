import { useEffect, useRef, useCallback } from 'react'
import type { SelectionRect } from '@shared/types'

interface EyedropperLoupeProps {
  selection: SelectionRect
  compositeCanvasRef: React.RefObject<HTMLCanvasElement | null>
  scaleFactor: number
}

const GRID = 11
const CELL = 12
const SIZE = GRID * CELL
const HALF = Math.floor(GRID / 2)

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

export function EyedropperLoupe({
  selection,
  compositeCanvasRef,
  scaleFactor
}: EyedropperLoupeProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hexRef = useRef<HTMLSpanElement>(null)
  const swatchRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current
      const canvas = canvasRef.current
      const composite = compositeCanvasRef.current
      if (!container || !canvas || !composite) return

      const ctx = canvas.getContext('2d')
      const compositeCtx = composite.getContext('2d')
      if (!ctx || !compositeCtx) return

      const canvasX = clientX - selection.x
      const canvasY = clientY - selection.y
      const inBounds =
        canvasX >= 0 && canvasX < selection.width && canvasY >= 0 && canvasY < selection.height

      container.style.display = inBounds ? 'flex' : 'none'
      if (!inBounds) return

      // Position: above-right of cursor, flip if near edges
      const offsetX = 24
      const offsetY = SIZE + 40
      let left = clientX + offsetX
      let top = clientY - offsetY

      if (left + SIZE + 16 > window.innerWidth) {
        left = clientX - offsetX - SIZE
      }
      if (top < 8) {
        top = clientY + 24
      }

      container.style.left = `${left}px`
      container.style.top = `${top}px`

      // Sample pixels from composite canvas
      const centerX = Math.round((selection.x + canvasX) * scaleFactor)
      const centerY = Math.round((selection.y + canvasY) * scaleFactor)
      const startX = centerX - HALF
      const startY = centerY - HALF

      const imageData = compositeCtx.getImageData(startX, startY, GRID, GRID)
      const pixels = imageData.data

      ctx.clearRect(0, 0, SIZE, SIZE)

      // Draw pixel grid
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const i = (row * GRID + col) * 4
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]

          ctx.fillStyle = rgbToHex(r, g, b)
          ctx.fillRect(col * CELL, row * CELL, CELL, CELL)
        }
      }

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 0.5
      for (let i = 1; i < GRID; i++) {
        const pos = i * CELL
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, SIZE)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(SIZE, pos)
        ctx.stroke()
      }

      // Highlight center pixel
      const cx = HALF * CELL
      const cy = HALF * CELL
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.strokeRect(cx, cy, CELL, CELL)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.strokeRect(cx + 1.5, cy + 1.5, CELL - 3, CELL - 3)

      // Update hex label
      const ci = (HALF * GRID + HALF) * 4
      const hex = rgbToHex(pixels[ci], pixels[ci + 1], pixels[ci + 2])
      if (hexRef.current) hexRef.current.textContent = hex.toUpperCase()
      if (swatchRef.current) swatchRef.current.style.backgroundColor = hex
    },
    [compositeCanvasRef, selection, scaleFactor]
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      draw(e.clientX, e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [draw])

  return (
    <div
      ref={containerRef}
      className="fixed z-90 flex-col items-center gap-1.5 pointer-events-none"
      style={{ display: 'none' }}
    >
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="rounded-lg border border-(--toolbar-border) shadow-2xl"
        style={{ width: SIZE, height: SIZE, imageRendering: 'pixelated' }}
      />
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-(--toolbar-bg) backdrop-blur-xl border border-(--toolbar-border)">
        <div ref={swatchRef} className="w-3.5 h-3.5 rounded-sm border border-white/20 shrink-0" />
        <span
          ref={hexRef}
          className="text-[11px] font-mono font-medium text-foreground tracking-wide"
        />
      </div>
    </div>
  )
}
