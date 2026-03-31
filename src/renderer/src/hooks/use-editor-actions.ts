import { useState, useCallback } from 'react'

interface UseEditorActionsParams {
  width: number
  height: number
  scaleFactor: number
  compositeCanvasRef: React.RefObject<HTMLCanvasElement | null>
  annotationsCount: number
}

interface UseEditorActionsReturn {
  showDiscardDialog: boolean
  handleCopy: () => void
  handleSave: () => void
  handleCancel: () => void
  handleConfirmDiscard: () => void
  handleDismissDiscard: () => void
}

export function useEditorActions({
  width,
  height,
  scaleFactor,
  compositeCanvasRef,
  annotationsCount
}: UseEditorActionsParams): UseEditorActionsReturn {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  const compositeCapture = useCallback((): string | null => {
    if (!compositeCanvasRef.current) return null

    const outCanvas = document.createElement('canvas')
    outCanvas.width = Math.round(width * scaleFactor)
    outCanvas.height = Math.round(height * scaleFactor)

    const ctx = outCanvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(compositeCanvasRef.current, 0, 0, outCanvas.width, outCanvas.height)

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
  }, [width, height, scaleFactor, compositeCanvasRef])

  const handleCopy = useCallback((): void => {
    const dataURL = compositeCapture()
    if (dataURL) window.api.editor.copy(dataURL)
  }, [compositeCapture])

  const handleSave = useCallback((): void => {
    const dataURL = compositeCapture()
    if (dataURL) window.api.editor.save(dataURL)
  }, [compositeCapture])

  const handleCancel = useCallback((): void => {
    if (annotationsCount > 0) {
      setShowDiscardDialog(true)
    } else {
      window.api.editor.cancel()
    }
  }, [annotationsCount])

  const handleConfirmDiscard = useCallback((): void => {
    setShowDiscardDialog(false)
    window.api.editor.cancel()
  }, [])

  const handleDismissDiscard = useCallback((): void => {
    setShowDiscardDialog(false)
  }, [])

  return {
    showDiscardDialog,
    handleCopy,
    handleSave,
    handleCancel,
    handleConfirmDiscard,
    handleDismissDiscard
  }
}
