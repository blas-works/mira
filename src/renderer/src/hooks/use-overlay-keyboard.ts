import { useEffect } from 'react'
import type { AnnotationTool } from '@shared/types'

interface UseOverlayKeyboardParams {
  phase: string
  activeTool: AnnotationTool
  setActiveTool: (tool: AnnotationTool) => void
  handleCopy: () => void
  handleSave: () => void
  handleCancel: () => void
}

const TOOL_KEY_MAP: Record<string, AnnotationTool> = {
  v: 'select',
  p: 'pen',
  a: 'arrow',
  r: 'rect',
  t: 'text',
  b: 'blur',
  i: 'eyedropper'
}

export function useOverlayKeyboard({
  phase,
  activeTool,
  setActiveTool,
  handleCopy,
  handleSave,
  handleCancel
}: UseOverlayKeyboardParams): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isTyping = document.activeElement?.tagName === 'TEXTAREA'
      if (isTyping) return

      if (e.key === 'Escape') {
        handleCancel()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && phase === 'selected') {
        e.preventDefault()
        handleCopy()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's' && phase === 'selected') {
        e.preventDefault()
        handleSave()
      }

      if (phase === 'selected' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tool = TOOL_KEY_MAP[e.key.toLowerCase()]
        if (tool && activeTool !== tool) {
          setActiveTool(tool)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, handleCopy, handleSave, activeTool, handleCancel, setActiveTool])
}
