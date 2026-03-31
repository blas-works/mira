import type { SelectionRect } from '@shared/types'

interface DimOverlayProps {
  selection: SelectionRect | null
}

export function DimOverlay({ selection }: DimOverlayProps): React.JSX.Element {
  if (!selection) {
    return <div className="absolute inset-0 bg-(--overlay-dim) pointer-events-none" />
  }

  return (
    <>
      <div
        className="absolute bg-(--overlay-dim) pointer-events-none"
        style={{ left: 0, top: 0, width: '100%', height: selection.y }}
      />
      <div
        className="absolute bg-(--overlay-dim) pointer-events-none"
        style={{ left: 0, top: selection.y, width: selection.x, height: selection.height }}
      />
      <div
        className="absolute bg-(--overlay-dim) pointer-events-none"
        style={{
          left: selection.x + selection.width,
          top: selection.y,
          width: `calc(100% - ${selection.x + selection.width}px)`,
          height: selection.height
        }}
      />
      <div
        className="absolute bg-(--overlay-dim) pointer-events-none"
        style={{
          left: 0,
          top: selection.y + selection.height,
          width: '100%',
          height: `calc(100% - ${selection.y + selection.height}px)`
        }}
      />
    </>
  )
}
