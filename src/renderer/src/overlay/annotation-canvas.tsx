import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import type { SelectionRect, AnnotationTool } from '@shared/types'
import { drawAnnotation, redrawAll, createToolHandlers, type CompositeSource } from '@/lib'
import { useAnnotationHistory, useTextInput } from '@/hooks'

export interface AnnotationCanvasHandle {
  undo: () => void
  redo: () => void
}

interface AnnotationCanvasProps {
  selection: SelectionRect
  activeTool: AnnotationTool
  activeColor: string
  activeFontSize: number
  compositeCanvasRef: React.RefObject<HTMLCanvasElement | null>
  scaleFactor: number
  onAnnotationsChange?: (count: number) => void
  onUndoStateChange?: (canUndo: boolean, canRedo: boolean) => void
  onColorPicked?: (hex: string, position: { x: number; y: number }) => void
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

export const AnnotationCanvas = forwardRef<AnnotationCanvasHandle, AnnotationCanvasProps>(
  function AnnotationCanvas(
    {
      selection,
      activeTool,
      activeColor,
      activeFontSize,
      compositeCanvasRef,
      scaleFactor,
      onAnnotationsChange,
      onUndoStateChange,
      onColorPicked
    },
    ref
  ): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const toolHandlersRef = useRef(createToolHandlers())

    const getCompositeSource = useCallback((): CompositeSource | null => {
      const composite = compositeCanvasRef.current
      if (!composite) return null
      return {
        canvas: composite,
        selectionX: selection.x,
        selectionY: selection.y,
        scale: scaleFactor
      }
    }, [compositeCanvasRef, selection.x, selection.y, scaleFactor])

    const { annotations, addAnnotation, undo, redo } = useAnnotationHistory(
      onAnnotationsChange,
      onUndoStateChange
    )
    const {
      textInput,
      textareaRef,
      openTextInput,
      confirmText,
      handleTextKeyDown,
      updateTextValue
    } = useTextInput()

    useImperativeHandle(ref, () => ({ undo, redo }), [undo, redo])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      redrawAll(ctx, annotations, getCompositeSource())
    }, [annotations, getCompositeSource])

    const getCanvasCoords = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return null
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }, [])

    const redrawWithPreview = useCallback(
      (previewItem: import('@shared/types').Annotation | null) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return
        const source = getCompositeSource()
        redrawAll(ctx, annotations, source)
        if (previewItem) {
          drawAnnotation(ctx, previewItem, source)
        }
      },
      [annotations, getCompositeSource]
    )

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (activeTool === 'select') return
        const coords = getCanvasCoords(e)
        if (!coords) return

        const handler = toolHandlersRef.current[activeTool]

        if (handler.isEyedropperTool) {
          const composite = compositeCanvasRef.current
          if (!composite) return
          const ctx = composite.getContext('2d')
          if (!ctx) return

          const px = Math.round((selection.x + coords.x) * scaleFactor)
          const py = Math.round((selection.y + coords.y) * scaleFactor)
          const pixel = ctx.getImageData(px, py, 1, 1).data
          const hex = rgbToHex(pixel[0], pixel[1], pixel[2])

          navigator.clipboard.writeText(hex)
          onColorPicked?.(hex, { x: e.clientX, y: e.clientY })
          return
        }

        if (handler.isTextTool) {
          openTextInput(coords.x, coords.y)
          return
        }
        handler.onMouseDown(coords, activeColor)
      },
      [
        activeTool,
        activeColor,
        getCanvasCoords,
        openTextInput,
        compositeCanvasRef,
        selection.x,
        selection.y,
        scaleFactor,
        onColorPicked
      ]
    )

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        const coords = getCanvasCoords(e)
        if (!coords) return
        const handler = toolHandlersRef.current[activeTool]
        const preview = handler.onMouseMove(coords, activeColor)
        if (preview) {
          redrawWithPreview(preview)
        }
      },
      [activeTool, activeColor, getCanvasCoords, redrawWithPreview]
    )

    const handleMouseUp = useCallback(
      (e: React.MouseEvent) => {
        const coords = getCanvasCoords(e)
        if (!coords) return
        const handler = toolHandlersRef.current[activeTool]
        const annotation = handler.onMouseUp(coords, activeColor)
        if (annotation) {
          addAnnotation(annotation)
        }
      },
      [activeTool, activeColor, getCanvasCoords, addAnnotation]
    )

    const handleConfirmText = useCallback(() => {
      const annotation = confirmText(activeColor, activeFontSize)
      if (annotation) addAnnotation(annotation)
    }, [confirmText, activeColor, activeFontSize, addAnnotation])

    const handleTextKeyDownWrapper = useCallback(
      (e: React.KeyboardEvent) => {
        const annotation = handleTextKeyDown(e, activeColor, activeFontSize)
        if (annotation) addAnnotation(annotation)
      },
      [handleTextKeyDown, activeColor, activeFontSize, addAnnotation]
    )

    const getCursor = (): string => {
      switch (activeTool) {
        case 'select':
          return 'move'
        case 'text':
          return 'text'
        case 'eyedropper':
          return 'crosshair'
        default:
          return 'crosshair'
      }
    }

    return (
      <>
        <canvas
          id="annotation-canvas"
          ref={canvasRef}
          width={selection.width}
          height={selection.height}
          className="absolute"
          style={{
            left: selection.x,
            top: selection.y,
            width: selection.width,
            height: selection.height,
            cursor: getCursor(),
            pointerEvents: activeTool === 'select' || textInput.visible ? 'none' : 'auto'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        {textInput.visible && (
          <textarea
            ref={textareaRef}
            value={textInput.value}
            onChange={(e) => updateTextValue(e.target.value)}
            onKeyDown={handleTextKeyDownWrapper}
            onBlur={handleConfirmText}
            className="absolute bg-transparent border-none outline-none resize-none"
            style={{
              zIndex: 60,
              left: selection.x + textInput.x,
              top: selection.y + textInput.y,
              fontSize: `${activeFontSize}px`,
              fontFamily: "'Geist Variable', sans-serif",
              fontWeight: 500,
              lineHeight: 1.4,
              color: activeColor,
              caretColor: activeColor,
              minWidth: '100px',
              minHeight: '24px'
            }}
          />
        )}
      </>
    )
  }
)
