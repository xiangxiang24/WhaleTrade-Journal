import type { DcaPoint } from '../../shared/data/portfolio-math'

// กราฟเส้นเล็ก (ยอดสะสมรายเดือน) วาดเป็น SVG ยืดตามความกว้างการ์ด สีจาก token
export default function Sparkline({ points, label }: { points: DcaPoint[]; label: string }) {
  if (points.length === 0) return null
  const max = Math.max(...points.map((point) => point.cumulative), 1)
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100
    const y = 30 - (point.cumulative / max) * 26
    return [x, y] as const
  })
  // จุดเดียว = เส้นราบทั้งความกว้าง
  const line = (coords.length === 1 ? [[0, coords[0][1]], [100, coords[0][1]]] : coords)
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="h-12 w-full overflow-visible"
    >
      <path d={`${line} L100 32 L0 32 Z`} className="fill-blue-100" opacity="0.6" />
      <path
        d={line}
        fill="none"
        className="stroke-blue-500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
