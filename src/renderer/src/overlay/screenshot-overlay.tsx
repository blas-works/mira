import { useState, useCallback, useRef } from 'react'
import type { AnnotationTool } from '@shared/types'
import { ANNOTATION_COLORS, DEFAULT_FONT_SIZE } from '@shared/constants'
import {
  useSelection,
  useCaptureData,
  useCaptureActions,
  useToolbarPosition,
  useOverlayKeyboard
} from '@/hooks'
import { DimensionBadge } from './dimension-badge'
import { SelectionArea } from './selection-area'
import { DimOverlay } from './dim-overlay'
import { ActionToolbar } from './action-toolbar'
import { AnnotationToolbar } from './annotation-toolbar'
import { AnnotationCanvas, type AnnotationCanvasHandle } from './annotation-canvas'
import { ColorToast } from './color-toast'
import { EyedropperLoupe } from './eyedropper-loupe'
import { DiscardDialog } from './discard-dialog'

export function ScreenshotOverlay(): React.JSX.Element {
  const {
    phase,
    selection,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onHandleMouseDown,
    onSelectionMouseDown
  } = useSelection()

  const { captureData, compositeCanvasRef } = useCaptureData()

  const [activeTool, setActiveTool] = useState<AnnotationTool>('select')
  const [activeColor, setActiveColor] = useState(ANNOTATION_COLORS[0].value)
  const [activeFontSize, setActiveFontSize] = useState(DEFAULT_FONT_SIZE)
  const [annotationsCount, setAnnotationsCount] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [pickedColor, setPickedColor] = useState<{
    hex: string
    position: { x: number; y: number }
  } | null>(null)
  const annotationRef = useRef<AnnotationCanvasHandle>(null)

  const {
    showDiscardDialog,
    handleCopy,
    handleSave,
    handleCancel,
    handleConfirmDiscard,
    handleDismissDiscard
  } = useCaptureActions({
    selection,
    captureData,
    compositeCanvasRef,
    annotationsCount
  })

  useOverlayKeyboard({
    phase,
    activeTool,
    setActiveTool,
    handleCopy,
    handleSave,
    handleCancel
  })

  const { annotationToolbarPos, actionToolbarPos } = useToolbarPosition(selection)

  const handleAnnotationsChange = useCallback((count: number): void => {
    setAnnotationsCount(count)
  }, [])

  const handleUndoStateChange = useCallback((undoable: boolean, redoable: boolean): void => {
    setCanUndo(undoable)
    setCanRedo(redoable)
  }, [])

  const handleColorPicked = useCallback((hex: string, position: { x: number; y: number }): void => {
    setPickedColor({ hex, position })
  }, [])

  return (
    <div
      className="fixed inset-0 select-none"
      style={{
        cursor:
          phase === 'idle' || phase === 'selecting'
            ? 'crosshair'
            : activeTool === 'select'
              ? 'default'
              : 'crosshair'
      }}
      onMouseDown={phase === 'idle' ? onMouseDown : undefined}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {captureData &&
        captureData.displays.map((display, i) => (
          <img
            key={i}
            src={display.imageDataURL}
            className="absolute pointer-events-none"
            style={{
              left: display.bounds.x - captureData.virtualBounds.x,
              top: display.bounds.y - captureData.virtualBounds.y,
              width: display.bounds.width,
              height: display.bounds.height
            }}
            draggable={false}
          />
        ))}

      <DimOverlay selection={selection} />

      {selection && (selection.width > 5 || selection.height > 5) && (
        <DimensionBadge
          width={selection.width}
          height={selection.height}
          x={selection.x}
          y={selection.y}
        />
      )}

      {selection && phase !== 'idle' && (
        <SelectionArea
          selection={selection}
          onMouseDown={onSelectionMouseDown}
          onHandleMouseDown={onHandleMouseDown}
        />
      )}

      {selection && phase === 'selected' && captureData && (
        <>
          <AnnotationCanvas
            ref={annotationRef}
            selection={selection}
            activeTool={activeTool}
            activeColor={activeColor}
            activeFontSize={activeFontSize}
            compositeCanvasRef={compositeCanvasRef}
            scaleFactor={captureData.virtualBounds.scaleFactor}
            onAnnotationsChange={handleAnnotationsChange}
            onUndoStateChange={handleUndoStateChange}
            onColorPicked={handleColorPicked}
          />

          <AnnotationToolbar
            activeTool={activeTool}
            activeColor={activeColor}
            activeFontSize={activeFontSize}
            onToolChange={setActiveTool}
            onColorChange={setActiveColor}
            onFontSizeChange={setActiveFontSize}
            position={annotationToolbarPos}
          />

          <ActionToolbar
            onCopy={handleCopy}
            onSave={handleSave}
            onCancel={handleCancel}
            onUndo={() => annotationRef.current?.undo()}
            onRedo={() => annotationRef.current?.redo()}
            canUndo={canUndo}
            canRedo={canRedo}
            position={actionToolbarPos}
          />
        </>
      )}

      {activeTool === 'eyedropper' && selection && captureData && (
        <EyedropperLoupe
          selection={selection}
          compositeCanvasRef={compositeCanvasRef}
          scaleFactor={captureData.virtualBounds.scaleFactor}
        />
      )}

      {pickedColor && (
        <ColorToast
          hex={pickedColor.hex}
          position={pickedColor.position}
          onDismiss={() => setPickedColor(null)}
        />
      )}

      {showDiscardDialog && (
        <DiscardDialog
          captureData={captureData}
          selection={selection}
          onDismiss={handleDismissDiscard}
          onConfirm={handleConfirmDiscard}
        />
      )}

      {phase === 'idle' && (
        <div className="absolute bottom-4 left-4 text-xs text-white/40 select-none pointer-events-none">
          ESC to cancel
        </div>
      )}
    </div>
  )
}
