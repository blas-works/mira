import { useState, useCallback, useRef, useEffect } from 'react'
import type { AnnotationTool } from '@shared/types'
import { ANNOTATION_COLORS, DEFAULT_FONT_SIZE } from '@shared/constants'
import { useEditorData, useEditorActions } from '@/hooks'
import { useEditorKeyboard } from './use-editor-keyboard'
import { AnnotationToolbar } from '@/overlay/annotation-toolbar'
import { ActionToolbar } from '@/overlay/action-toolbar'
import { AnnotationCanvas, type AnnotationCanvasHandle } from '@/overlay/annotation-canvas'
import { ColorToast } from '@/overlay/color-toast'
import { EyedropperLoupe } from '@/overlay/eyedropper-loupe'

function EditorDiscardDialog({
  onDismiss,
  onConfirm
}: {
  onDismiss: () => void
  onConfirm: () => void
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-(--toolbar-bg) border border-(--toolbar-border) rounded-xl p-5 shadow-2xl max-w-xs text-center space-y-4">
        <p className="text-sm text-foreground">You have unsaved annotations. Discard?</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onDismiss}
            className="px-4 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg text-sm text-red-400 bg-red-500/15 hover:bg-red-500/25 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}

export function EditorWindow(): React.JSX.Element {
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

  const { editorData, compositeCanvasRef } = useEditorData()

  const {
    showDiscardDialog,
    handleCopy,
    handleSave,
    handleOcr,
    handleCancel,
    handleConfirmDiscard,
    handleDismissDiscard
  } = useEditorActions({
    width: editorData?.width ?? 0,
    height: editorData?.height ?? 0,
    scaleFactor: editorData?.scaleFactor ?? 1,
    compositeCanvasRef,
    annotationsCount
  })

  useEditorKeyboard({
    activeTool,
    setActiveTool,
    handleCopy,
    handleSave,
    handleCancel
  })

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

  const containerRef = useRef<HTMLDivElement>(null)
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (!editorData || !containerRef.current) return

    const updateSize = (): void => {
      const container = containerRef.current
      if (!container) return

      const availW = container.clientWidth - 24
      const availH = container.clientHeight - 24

      if (availW <= 0 || availH <= 0) return

      const imgW = editorData.width
      const imgH = editorData.height
      const ratio = Math.min(availW / imgW, availH / imgH)

      const newW = Math.round(imgW * ratio)
      const newH = Math.round(imgH * ratio)

      setDisplaySize({ width: newW, height: newH })

      const sidebar = container.parentElement?.querySelector<HTMLDivElement>(
        ':scope > div:first-child'
      )
      const titleBar = container
        .closest<HTMLDivElement>('.flex.flex-col')
        ?.querySelector<HTMLDivElement>(':scope > div:first-child')

      const sidebarW = sidebar?.offsetWidth ?? 56
      const titleH = titleBar?.offsetHeight ?? 40
      const pad = 24

      const frameW = newW + sidebarW + pad
      const frameH = newH + titleH + pad

      window.api.editor.resize(frameW, frameH)
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [editorData])

  if (!editorData) {
    return <div className="w-full h-full bg-[#0a0a0a]" />
  }

  const renderWidth = displaySize?.width ?? editorData.width
  const renderHeight = displaySize?.height ?? editorData.height
  const selection = { x: 0, y: 0, width: renderWidth, height: renderHeight }

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a] select-none">
      {/* Title bar with drag region and action toolbar */}
      <div className="flex items-center justify-between shrink-0 border-b border-(--toolbar-border)">
        <div className="flex-1 h-10 app-drag-region" />
        <div className="shrink-0 p-1">
          <ActionToolbar
            onCopy={handleCopy}
            onSave={handleSave}
            onOcr={handleOcr}
            onCancel={handleCancel}
            onUndo={() => annotationRef.current?.undo()}
            onRedo={() => annotationRef.current?.redo()}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      </div>

      {/* Main content: sidebar + image */}
      <div className="flex flex-1 min-h-0">
        {/* Annotation toolbar sidebar */}
        <div className="shrink-0 p-2 border-r border-(--toolbar-border) flex flex-col items-center">
          <AnnotationToolbar
            activeTool={activeTool}
            activeColor={activeColor}
            activeFontSize={activeFontSize}
            onToolChange={setActiveTool}
            onColorChange={setActiveColor}
            onFontSizeChange={setActiveFontSize}
          />
        </div>

        {/* Image canvas area */}
        <div
          ref={containerRef}
          className="flex-1 min-w-0 overflow-hidden flex items-center justify-center p-3 relative"
        >
          {displaySize && (
            <div
              className="relative shrink-0 rounded-sm overflow-hidden shadow-lg"
              style={{ width: renderWidth, height: renderHeight }}
            >
              <img
                src={editorData.imageDataURL}
                className="block pointer-events-none"
                style={{ width: renderWidth, height: renderHeight }}
                draggable={false}
              />
              <AnnotationCanvas
                ref={annotationRef}
                selection={selection}
                activeTool={activeTool}
                activeColor={activeColor}
                activeFontSize={activeFontSize}
                compositeCanvasRef={compositeCanvasRef}
                scaleFactor={editorData.scaleFactor}
                onAnnotationsChange={handleAnnotationsChange}
                onUndoStateChange={handleUndoStateChange}
                onColorPicked={handleColorPicked}
              />
            </div>
          )}
        </div>
      </div>

      {activeTool === 'eyedropper' && (
        <EyedropperLoupe
          selection={selection}
          compositeCanvasRef={compositeCanvasRef}
          scaleFactor={editorData.scaleFactor}
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
        <EditorDiscardDialog onDismiss={handleDismissDiscard} onConfirm={handleConfirmDiscard} />
      )}
    </div>
  )
}
