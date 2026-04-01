import { useState, useCallback } from 'react'
import type { CaptureData, SelectionRect } from '@shared/types'

interface UseCaptureActionsParams {
  selection: SelectionRect | null
  captureData: CaptureData | null
  compositeCanvasRef: React.RefObject<HTMLCanvasElement | null>
  annotationsCount: number
}

interface UseCaptureActionsReturn {
  showDiscardDialog: boolean
  handleCopy: () => void
  handleSave: () => void
  handleOcr: () => void
  handleCancel: () => void
  handleConfirmDiscard: () => void
  handleDismissDiscard: () => void
}

export function useCaptureActions({
  selection,
  captureData,
  compositeCanvasRef,
  annotationsCount
}: UseCaptureActionsParams): UseCaptureActionsReturn {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  const compositeCapture = useCallback((): string | null => {
    if (!selection || !captureData || !compositeCanvasRef.current) return null

    const scale = captureData.virtualBounds.scaleFactor
    const outCanvas = document.createElement('canvas')
    outCanvas.width = Math.round(selection.width * scale)
    outCanvas.height = Math.round(selection.height * scale)

    const ctx = outCanvas.getContext('2d')
    if (!ctx) return null

    const sx = Math.round(selection.x * scale)
    const sy = Math.round(selection.y * scale)
    const sw = Math.round(selection.width * scale)
    const sh = Math.round(selection.height * scale)

    ctx.drawImage(
      compositeCanvasRef.current,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      outCanvas.width,
      outCanvas.height
    )

    const annotationCanvas = document.getElementById('annotation-canvas') as HTMLCanvasElement
    if (annotationCanvas) {
      ctx.drawImage(
        annotationCanvas,
        0,
        0,
        annotationCanvas.width,
        annotationCanvas.height,
        0,
        0,
        outCanvas.width,
        outCanvas.height
      )
    }

    return outCanvas.toDataURL('image/png')
  }, [selection, captureData, compositeCanvasRef])

  const handleCopy = useCallback((): void => {
    if (!selection || !captureData) return
    const dataURL = compositeCapture()
    if (dataURL) window.api.capture.copy(dataURL)
  }, [selection, captureData, compositeCapture])

  const handleSave = useCallback((): void => {
    if (!selection || !captureData) return
    const dataURL = compositeCapture()
    if (dataURL) window.api.capture.save(dataURL)
  }, [selection, captureData, compositeCapture])

  const handleOcr = useCallback((): void => {
    if (!selection || !captureData) return
    const dataURL = compositeCapture()
    if (dataURL) window.api.capture.ocr(dataURL)
  }, [selection, captureData, compositeCapture])

  const handleCancel = useCallback((): void => {
    if (annotationsCount > 0) {
      setShowDiscardDialog(true)
    } else {
      window.api.capture.cancel()
    }
  }, [annotationsCount])

  const handleConfirmDiscard = useCallback((): void => {
    setShowDiscardDialog(false)
    window.api.capture.cancel()
  }, [])

  const handleDismissDiscard = useCallback((): void => {
    setShowDiscardDialog(false)
  }, [])

  return {
    showDiscardDialog,
    handleCopy,
    handleSave,
    handleOcr,
    handleCancel,
    handleConfirmDiscard,
    handleDismissDiscard
  }
}
