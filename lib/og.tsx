import { ImageResponse } from "next/og"
import { getDictionary } from "@/content/dictionaries"
import { getProjects } from "@/data/projects"
import { SITE_URL, type Locale } from "@/lib/i18n"

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = "image/png"

// Rede neural determinística (mesma a cada build) desenhada em SVG no fundo do cartão
function NeuralBackdrop() {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const nodes = Array.from({ length: 46 }, () => ({ x: 560 + rand() * 660, y: rand() * 630, r: 1.5 + rand() * 2.5 }))
  const lines: [number, number, number, number, number][] = []
  nodes.forEach((a, i) =>
    nodes.slice(i + 1).forEach((b) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < 150) lines.push([a.x, a.y, b.x, b.y, 1 - d / 150])
    }),
  )
  return (
    <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      {lines.map(([x1, y1, x2, y2, s], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#g)" strokeWidth="1.2" strokeOpacity={0.15 + s * 0.45} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={i % 3 === 0 ? "#7dd3fc" : "#3b82f6"} fillOpacity="0.9" />
      ))}
    </svg>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "linear-gradient(180deg, #0b1020 0%, #071024 100%)",
        color: "#e6eef8",
        fontFamily: "sans-serif",
      }}
    >
      <NeuralBackdrop />
      <div
        style={{
          position: "absolute",
          left: -120,
          top: -160,
          width: 620,
          height: 620,
          borderRadius: 620,
          background: "radial-gradient(circle, rgba(59,130,246,0.28), rgba(59,130,246,0) 70%)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", padding: "72px 80px", position: "relative", width: "100%" }}>
        {children}
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "linear-gradient(135deg, #3b82f6, #7dd3fc)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#061025",
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        WS
      </div>
      <div style={{ fontSize: 24, color: "#9aa4b2" }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
    </div>
  )
}

export function homeOgImage(locale: Locale) {
  const t = getDictionary(locale).meta
  return new ImageResponse(
    (
      <Frame>
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>Wallysson Sousa</div>
          <div
            style={{
              marginTop: 18,
              fontSize: 40,
              fontWeight: 700,
              backgroundImage: "linear-gradient(90deg, #3b82f6, #7dd3fc)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t.ogTagline}
          </div>
          <div style={{ marginTop: 22, fontSize: 28, color: "#cdd6e3" }}>{t.ogRole}</div>
        </div>
      </Frame>
    ),
    ogSize,
  )
}

export async function projectOgImage(locale: Locale, slug: string) {
  const d = getDictionary(locale)
  const project = getProjects(locale).find((p) => p.slug === slug)
  if (!project) return homeOgImage(locale)
  return new ImageResponse(
    (
      <Frame>
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", maxWidth: 760 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 22, color: "#9aa4b2" }}>
            {/* Ponto de status desenhado em CSS: glifos como ● fariam o gerador baixar uma fonte no build */}
            <span style={{ display: "flex", alignItems: "center", gap: 10, color: project.status === "live" ? "#7dd3fc" : "#bfdbfe" }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 12,
                  background: project.status === "live" ? "#7dd3fc" : "#3b82f6",
                }}
              />
              {d.projects.status[project.status]}
            </span>
            <span>·</span>
            <span>{project.year}</span>
            <span>·</span>
            <span>{d.projects.kind[project.kind]}</span>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.05,
              backgroundImage: "linear-gradient(90deg, #3b82f6, #7dd3fc)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {project.title}
          </div>
          <div style={{ marginTop: 18, fontSize: 30, lineHeight: 1.35, color: "#cdd6e3" }}>{project.summary}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            {project.architecture.map((l) => (
              <div
                key={l.label}
                style={{
                  display: "flex",
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(147,197,253,0.4)",
                  background: "rgba(16,23,46,0.8)",
                  fontSize: 20,
                  color: "#e6eef8",
                }}
              >
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </Frame>
    ),
    ogSize,
  )
}
