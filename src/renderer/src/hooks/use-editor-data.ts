import { useState, useEffect, useRef } from 'react'
import type { EditorData } from '@shared/types'

interface UseEditorDataReturn {
  editorData: EditorData | null
  compositeCanvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function useEditorData(): UseEditorDataReturn {
  const [editorData, setEditorData] = useState<EditorData | null>(null)
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    window.api.editor.onInit((data) => {
      setEditorData(data as EditorData)
    })
  }, [])

  useEffect(() => {
    if (!editorData) return

    const img = new Image()
    img.onload = (): void => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(editorData.width * editorData.scaleFactor)
      canvas.height = Math.round(editorData.height * editorData.scaleFactor)
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      compositeCanvasRef.current = canvas
    }
    img.src = editorData.imageDataURL
  }, [editorData])

  return { editorData, compositeCanvasRef }
}
