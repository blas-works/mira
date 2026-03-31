import type { CaptureData, SelectionRect } from '@shared/types'

interface DiscardDialogProps {
  captureData: CaptureData | null
  selection: SelectionRect | null
  onDismiss: () => void
  onConfirm: () => void
}

export function DiscardDialog({
  captureData,
  selection,
  onDismiss,
  onConfirm
}: DiscardDialogProps): React.JSX.Element {
  const selCenterX = selection ? selection.x + selection.width / 2 : window.innerWidth / 2
  const selCenterY = selection ? selection.y + selection.height / 2 : window.innerHeight / 2
  const vb = captureData?.virtualBounds

  const display =
    captureData?.displays.find((d) => {
      const rx = d.bounds.x - (vb?.x ?? 0)
      const ry = d.bounds.y - (vb?.y ?? 0)
      return (
        selCenterX >= rx &&
        selCenterX < rx + d.bounds.width &&
        selCenterY >= ry &&
        selCenterY < ry + d.bounds.height
      )
    }) ?? captureData?.displays[0]

  const dx = display ? display.bounds.x - (vb?.x ?? 0) : 0
  const dy = display ? display.bounds.y - (vb?.y ?? 0) : 0
  const dw = display?.bounds.width ?? window.innerWidth
  const dh = display?.bounds.height ?? window.innerHeight

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm">
      <div
        className="absolute flex items-center justify-center"
        style={{ left: dx, top: dy, width: dw, height: dh }}
      >
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
    </div>
  )
}
