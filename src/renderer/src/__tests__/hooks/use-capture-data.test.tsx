import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCaptureData } from '@/hooks/use-capture-data'
import type { CaptureData } from '@shared/types'

const mockCaptureData: CaptureData = {
  displays: [
    {
      imageDataURL: 'data:image/png;base64,test',
      bounds: { x: 0, y: 0, width: 800, height: 600, scaleFactor: 1 }
    }
  ],
  virtualBounds: { x: 0, y: 0, width: 800, height: 600, scaleFactor: 1 }
}

const mockMultiDisplayData: CaptureData = {
  displays: [
    {
      imageDataURL: 'data:image/png;base64,disp1',
      bounds: { x: 0, y: 0, width: 1920, height: 1080, scaleFactor: 2 }
    },
    {
      imageDataURL: 'data:image/png;base64,disp2',
      bounds: { x: 1920, y: 0, width: 1920, height: 1080, scaleFactor: 2 }
    }
  ],
  virtualBounds: { x: 0, y: 0, width: 3840, height: 1080, scaleFactor: 2 }
}

const origCreateElement = document.createElement.bind(document)

describe('useCaptureData', () => {
  let imageInstances: HTMLImageElement[]

  beforeEach(() => {
    imageInstances = []

    class MockImage {
      onload: ((e: Event) => void) | null = null
      naturalWidth = 800
      naturalHeight = 600
      private _src = ''

      constructor() {
        imageInstances.push(this as unknown as HTMLImageElement)
      }

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

  it('starts with null captureData', () => {
    const { result } = renderHook(() => useCaptureData())
    expect(result.current.captureData).toBeNull()
  })

  it('sets captureData when onStart is called', () => {
    const { result } = renderHook(() => useCaptureData())
    const onStart = (window.api.capture.onStart as unknown as Mock).mock.calls[0][0]
    act(() => {
      onStart(mockCaptureData)
    })
    expect(result.current.captureData).toEqual(mockCaptureData)
  })

  it('provides a compositeCanvasRef', () => {
    const { result } = renderHook(() => useCaptureData())
    expect(result.current.compositeCanvasRef).toBeDefined()
    expect(result.current.compositeCanvasRef.current).toBeNull()
  })

  it('composites images onto canvas when captureData is set', async () => {
    const { result } = renderHook(() => useCaptureData())
    const onStart = (window.api.capture.onStart as unknown as Mock).mock.calls[0][0]

    act(() => {
      onStart(mockCaptureData)
    })

    // Flush microtasks for Image onload
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.compositeCanvasRef.current).not.toBeNull()
  })

  it('composites multiple displays sorted by index', async () => {
    const { result } = renderHook(() => useCaptureData())
    const onStart = (window.api.capture.onStart as unknown as Mock).mock.calls[0][0]

    act(() => {
      onStart(mockMultiDisplayData)
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })

    expect(result.current.compositeCanvasRef.current).not.toBeNull()
  })

  it('allows setting captureData via setCaptureData', () => {
    const { result } = renderHook(() => useCaptureData())
    act(() => {
      result.current.setCaptureData(mockCaptureData)
    })
    expect(result.current.captureData).toEqual(mockCaptureData)
  })

  it('does not composite when captureData is null', () => {
    const { result } = renderHook(() => useCaptureData())
    expect(result.current.compositeCanvasRef.current).toBeNull()
  })
})
