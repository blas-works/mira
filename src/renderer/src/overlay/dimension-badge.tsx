interface DimensionBadgeProps {
  width: number
  height: number
  x: number
  y: number
}

export function DimensionBadge({ width, height, x, y }: DimensionBadgeProps): React.JSX.Element {
  const badgeY = y < 30 ? y + Math.round(height) + 6 : y - 30

  return (
    <div
      className="absolute z-50 bg-black/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/8 font-mono tabular-nums tracking-wider pointer-events-none select-none"
      style={{
        left: x,
        top: badgeY
      }}
    >
      {Math.round(width)} × {Math.round(height)}
    </div>
  )
}
