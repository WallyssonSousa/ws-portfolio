import type { ArchLayer } from "@/data/projects"

const PILL_H = 26
const CHAR_W = 6.4 // largura média da Geist Mono a 11px
const pillWidth = (label: string) => Math.min(132, label.length * CHAR_W + 22)

type Pill = { label: string; x: number; y: number; w: number }
type Shape = { width: number; height: number; cols: Pill[][]; edges: string[]; labels: { text: string; x: number; y: number; anchor: "middle" | "start" }[] }

// Horizontal (desktop): cada camada é uma coluna, da esquerda para a direita.
function horizontal(layers: ArchLayer[]): Shape {
  const width = 560
  const height = 240
  const padX = 72
  const colX = (i: number) => padX + ((width - padX * 2) * i) / Math.max(1, layers.length - 1)
  const cols = layers.map((layer, i) => {
    const gap = 14
    const total = layer.nodes.length * PILL_H + (layer.nodes.length - 1) * gap
    const top = (height - 28 - total) / 2
    return layer.nodes.map((label, j) => ({ label, x: colX(i), y: top + j * (PILL_H + gap) + PILL_H / 2, w: pillWidth(label) }))
  })
  const edges = cols.slice(0, -1).flatMap((col, i) =>
    col.flatMap((a) =>
      cols[i + 1].map((b) => {
        const x1 = a.x + a.w / 2
        const x2 = b.x - b.w / 2
        const mid = (x1 + x2) / 2
        return `M${x1},${a.y} C${mid},${a.y} ${mid},${b.y} ${x2},${b.y}`
      }),
    ),
  )
  const labels = layers.map((l, i) => ({ text: l.label, x: colX(i), y: height - 8, anchor: "middle" as const }))
  return { width, height, cols, edges, labels }
}

// Vertical (celular): cada camada é uma linha, de cima para baixo, com o texto em tamanho real.
function vertical(layers: ArchLayer[]): Shape {
  const width = 360
  const rowH = 64
  const left = 92 // espaço do rótulo da camada
  const height = layers.length * rowH
  const cols = layers.map((layer, i) => {
    const gap = 10
    const widths = layer.nodes.map(pillWidth)
    const total = widths.reduce((n, w) => n + w, 0) + gap * (widths.length - 1)
    let x = left + (width - left - total) / 2
    return layer.nodes.map((label, j) => {
      const pill = { label, x: x + widths[j] / 2, y: i * rowH + rowH / 2, w: widths[j] }
      x += widths[j] + gap
      return pill
    })
  })
  const edges = cols.slice(0, -1).flatMap((row, i) =>
    row.flatMap((a) =>
      cols[i + 1].map((b) => {
        const y1 = a.y + PILL_H / 2
        const y2 = b.y - PILL_H / 2
        const mid = (y1 + y2) / 2
        return `M${a.x},${y1} C${a.x},${mid} ${b.x},${mid} ${b.x},${y2}`
      }),
    ),
  )
  const labels = layers.map((l, i) => ({ text: l.label, x: 4, y: i * rowH + rowH / 2 + 4, anchor: "start" as const }))
  return { width, height, cols, edges, labels }
}

function Diagram({ shape, className }: { shape: Shape; className: string }) {
  return (
    <svg viewBox={`0 0 ${shape.width} ${shape.height}`} className={className} aria-hidden>
      <defs>
        <linearGradient id="synapse-edge" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="1">
        {shape.edges.map((d, i) => (
          <path key={i} d={d} stroke="url(#synapse-edge)" />
        ))}
        {shape.edges.map((d, i) => (
          <path
            key={`s${i}`}
            d={d}
            className="signal"
            stroke="#7dd3fc"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ animationDelay: `${(i % 5) * -0.28}s` }}
          />
        ))}
      </g>
      {shape.cols.flat().map((n, i) => (
        <g key={i}>
          <rect x={n.x - n.w / 2} y={n.y - PILL_H / 2} width={n.w} height={PILL_H} rx="8" fill="#10172e" stroke="rgba(147,197,253,0.35)" />
          <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#e6eef8" className="font-mono">
            {n.label}
          </text>
        </g>
      ))}
      {shape.labels.map((l) => (
        <text
          key={l.text}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          fontSize="10"
          letterSpacing="1.2"
          fill="#9aa4b2"
          className="font-mono uppercase"
        >
          {l.text}
        </text>
      ))}
    </svg>
  )
}

// Diagrama da arquitetura como uma rede: cada camada é um grupo de nós, ligados em cascata.
// Os sinais (.signal) só correm no hover do card ou com live (ver globals.css).
export default function ArchDiagram({
  layers,
  live = false,
  label = "Arquitetura",
}: {
  layers: ArchLayer[]
  live?: boolean
  label?: string
}) {
  return (
    <div
      role="img"
      aria-label={`${label}: ${layers.map((l) => `${l.label} (${l.nodes.join(", ")})`).join(" → ")}`}
      className={`diagram h-full w-full ${live ? "is-live" : ""}`}
    >
      <Diagram shape={horizontal(layers)} className="hidden h-full w-full sm:block" />
      <Diagram shape={vertical(layers)} className="block h-auto w-full sm:hidden" />
    </div>
  )
}
