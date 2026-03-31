import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEditorData } from '@/hooks/use-editor-data'
import type { EditorData } from '@shared/types'

const mockEditorData: EditorData = {
  imageDataURL: 'data:image/png;base64,test',
  width: 800,
  height: 600,
  scaleFactor: 1
}

const origCreateElement = document.createElement.bind(document)

describe('useEditorData', () => {
  beforeEach(() => {
    class MockImage {
      onload: ((e: Event) => void) | null = null
      private _src = ''

      set src(value: string) {
        this._src = value
        queueMicrotask(() => this.onload?.(new Event('load')))
      }

      get src(): string {
        return this._src
      }
    }
    vi.stubGlobal('Image', MockImage as unknown as typeof globalThis.Image)

    const mockCtx = { drawImage: vi.fn() }
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const canvas = origCreateElement('canvas')
        vi.spyOn(canvas, 'getContext').mockReturnValue(
          mockCtx as unknown as CanvasRenderingContext2D
        )
        return canvas
      }
      return origCreateElement(tag)
    }) as typeof document.createElement)
  })

  it('starts with null editorData', () => {
    const { result } = renderHook(() => useEditorData())
    expect(result.current.editorData).toBeNull()
  })

  it('sets editorData when onInit is called', () => {
    const { result } = renderHook(() => useEditorData())
    const onInit = (window.api.editor.onInit as unknown as Mock).mock.calls[0][0]
    act(() => {
      onInit(mockEditorData)
    })
    expect(result.current.editorData).toEqual(mockEditorData)
  })

  it('provides a compositeCanvasRef', () => {
    const { result } = renderHook(() => useEditorData())
    expect(result.current.compositeCanvasRef).toBeDefined()
    expect(result.current.compositeCanvasRef.current).toBeNull()
  })

  it('loads image and creates composite canvas when editorData is set', async () => {
    const { result } = renderHook(() => useEditorData())
    const onInit = (window.api.editor.onInit as unknown as Mock).mock.calls[0][0]

    act(() => {
      onInit(mockEditorData)
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.compositeCanvasRef.current).not.toBeNull()
  })

  it('does not create composite canvas when getContext returns null', async () => {
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const canvas = origCreateElement('canvas')
        vi.spyOn(canvas, 'getContext').mockReturnValue(null)
        return canvas
      }
      return origCreateElement(tag)
    }) as typeof document.createElement)

    const { result } = renderHook(() => useEditorData())
    const onInit = (window.api.editor.onInit as unknown as Mock).mock.calls[0][0]

    act(() => {
      onInit(mockEditorData)
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.compositeCanvasRef.current).toBeNull()
  })
})
