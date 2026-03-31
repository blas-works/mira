import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ColorToastProps {
  hex: string
  position: { x: number; y: number }
  onDismiss: () => void
}

export function ColorToast({ hex, position, onDismiss }: ColorToastProps): React.JSX.Element {
  const [copied] = useState(true)

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="absolute z-100 flex items-center gap-2 px-3 py-2 rounded-lg bg-(--toolbar-bg) backdrop-blur-xl border border-(--toolbar-border) shadow-2xl animate-toolbar-enter pointer-events-none"
      style={{
        left: position.x + 16,
        top: position.y - 16
      }}
    >
      <div
        className="w-5 h-5 rounded-sm border border-white/20 shrink-0"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-mono font-medium text-foreground tracking-wide">
        {hex.toUpperCase()}
      </span>
      {copied ? (
        <Check className="w-3 h-3 text-green-400 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-neutral-400 shrink-0" />
      )}
    </div>
  )
}
