"use client"

import { useEffect, useRef } from "react"
import { whenIdle } from "@/lib/idle"

interface Tech {
  name: string
  color: string
  shadowColor?: string
}

interface OrbitCategory {
  title: string
  techs: Tech[]
  radiusRatio: number
  speed: number
  tilt: number
}

const CATEGORIES: OrbitCategory[] = [
  {
    title: "O que eu uso no trabalho",
    techs: [
      { name: "Node.js", color: "#5FA04E", shadowColor: "rgba(95, 160, 78, 0.4)" },
      { name: "Express", color: "#E6EDF3", shadowColor: "rgba(230, 237, 243, 0.3)" },
      { name: "MySQL", color: "#00758F", shadowColor: "rgba(0, 117, 143, 0.45)" },
      { name: "Redis", color: "#DC382D", shadowColor: "rgba(220, 56, 45, 0.4)" },
      { name: "Docker", color: "#2496ED", shadowColor: "rgba(36, 150, 237, 0.4)" },
      { name: "Angular", color: "#DD0031", shadowColor: "rgba(221, 0, 49, 0.4)" },
      { name: "GitHub", color: "#E6EDF3", shadowColor: "rgba(230, 237, 243, 0.3)" },
      { name: "Postman", color: "#FF6C37", shadowColor: "rgba(255, 108, 55, 0.4)" },
    ],
    radiusRatio: 0.35, // 35% do raio base
    speed: 0.0005,
    tilt: 0.6,
  },
  {
    title: "O que eu uso em projetos e na faculdade",
    techs: [
      { name: "TypeScript", color: "#3178C6", shadowColor: "rgba(49, 120, 198, 0.4)" },
      { name: "Next.js", color: "#FFFFFF", shadowColor: "rgba(255, 255, 255, 0.3)" },
      { name: "React", color: "#61DAFB", shadowColor: "rgba(97, 218, 251, 0.4)" },
      { name: "Tailwind", color: "#38BDF8", shadowColor: "rgba(56, 189, 248, 0.4)" },
      { name: "NestJS", color: "#E0234E", shadowColor: "rgba(224, 35, 78, 0.4)" },
      { name: "Python", color: "#3776AB", shadowColor: "rgba(55, 118, 171, 0.4)" },
      { name: "Flask", color: "#FFFFFF", shadowColor: "rgba(255, 255, 255, 0.3)" },
      { name: "PostgreSQL", color: "#336791", shadowColor: "rgba(51, 103, 145, 0.4)" },
    ],
    radiusRatio: 0.55, // 55% do raio base
    speed: 0.0004,
    tilt: 0.5,
  },
  {
    title: "O que eu estudo para desenvolvimento pessoal",
    techs: [
      { name: "Java", color: "#ED8B00", shadowColor: "rgba(237, 139, 0, 0.4)" },
      { name: "Spring Boot", color: "#6DB33F", shadowColor: "rgba(109, 179, 63, 0.4)" },
      { name: "Go", color: "#00ADD8", shadowColor: "rgba(0, 173, 216, 0.4)" },
      { name: "FastAPI", color: "#009688", shadowColor: "rgba(0, 150, 136, 0.4)" },
      { name: "MongoDB", color: "#47A248", shadowColor: "rgba(71, 162, 72, 0.4)" },
      { name: "Kotlin", color: "#A97BFF", shadowColor: "rgba(169, 123, 255, 0.4)" },
    ],
    radiusRatio: 0.75, // 75% do raio base
    speed: 0.0003,
    tilt: 0.4,
  },
]

const MAX_SCALE = 1.3 // escala do ícone mais próximo (z = 1)

// Pré-renderiza o ícone de uma tecnologia (4 gradientes) no tamanho máximo.
// A cada frame ele só é copiado e reduzido com drawImage, sem recriar gradientes.
function renderTechSprite(tech: Tech, scaleFactor: number, dpr: number) {
  const iconSize = 32 * MAX_SCALE * scaleFactor
  const glowSize = iconSize * 1.75
  const half = glowSize
  const sprite = document.createElement("canvas")
  sprite.width = sprite.height = Math.ceil(half * 2 * dpr)
  const ctx = sprite.getContext("2d")!
  ctx.scale(dpr, dpr)
  const x = half
  const y = half

  const shadowColor = tech.shadowColor || `${tech.color}40`
  const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
  glowGradient.addColorStop(0, shadowColor)
  glowGradient.addColorStop(0.5, shadowColor.replace(/[\d.]+\)$/, "0.2)"))
  glowGradient.addColorStop(1, shadowColor.replace(/[\d.]+\)$/, "0)"))
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(x, y, glowSize, 0, Math.PI * 2)
  ctx.fill()

  const outerGlow = ctx.createRadialGradient(x, y, iconSize / 2, x, y, iconSize / 2 + 8 * scaleFactor)
  outerGlow.addColorStop(0, "rgba(255, 255, 255, 0.02)")
  outerGlow.addColorStop(1, "rgba(255, 255, 255, 0)")
  ctx.fillStyle = outerGlow
  ctx.beginPath()
  ctx.arc(x, y, iconSize / 2 + 8 * scaleFactor, 0, Math.PI * 2)
  ctx.fill()

  const bgGradient = ctx.createLinearGradient(x, y - iconSize / 2, x, y + iconSize / 2)
  bgGradient.addColorStop(0, "rgba(255, 255, 255, 0.02)")
  bgGradient.addColorStop(1, "rgba(255, 255, 255, 0.01)")
  ctx.fillStyle = bgGradient
  ctx.beginPath()
  ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2)
  ctx.fill()

  const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, iconSize / 2 - 4 * scaleFactor)
  innerGlow.addColorStop(0, tech.color)
  innerGlow.addColorStop(0.6, `${tech.color}80`)
  innerGlow.addColorStop(1, "rgba(255, 255, 255, 0.05)")
  ctx.fillStyle = innerGlow
  ctx.beginPath()
  ctx.arc(x, y, iconSize / 2 - 4 * scaleFactor, 0, Math.PI * 2)
  ctx.fill()

  return { sprite, half }
}

export default function EnhancedTechStack() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Tudo que só depende do tamanho do canvas é calculado aqui, não a cada frame.
    let width = 0
    let height = 0
    let baseRadius = 0
    let scaleFactor = 0
    let sprites: { sprite: HTMLCanvasElement; half: number }[][] = []
    let ringGradients: CanvasGradient[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      baseRadius = Math.min(width, height) * 0.38
      scaleFactor = baseRadius / 280
      sprites = CATEGORIES.map((c) => c.techs.map((t) => renderTechSprite(t, scaleFactor, dpr)))
      ringGradients = CATEGORIES.map((c) => {
        const radius = baseRadius * c.radiusRatio
        const g = ctx.createRadialGradient(
          width / 2,
          height / 2,
          radius - 2 * scaleFactor,
          width / 2,
          height / 2,
          radius + 2 * scaleFactor,
        )
        g.addColorStop(0, "rgba(139, 92, 246, 0.15)")
        g.addColorStop(0.5, "rgba(255, 255, 255, 0.08)")
        g.addColorStop(1, "rgba(6, 182, 212, 0.15)")
        return g
      })
    }

    // Sinapses núcleo → planeta e o "acender" de cada planeta
    type Synapse = { c: number; i: number; t: number; speed: number }
    const synapses: Synapse[] = []
    const flash = CATEGORIES.map((c) => c.techs.map(() => 0))
    const lastHoverFire = CATEGORIES.map((c) => c.techs.map(() => -Infinity))
    let nextSynapse = 400
    let hover: { x: number; y: number } | null = null
    let prevElapsed = 0

    const draw = (elapsed: number) => {
      const dt = Math.min(64, Math.max(0, elapsed - prevElapsed))
      prevElapsed = elapsed
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      const pulseScale = Math.sin(elapsed * 0.002) * 0.15 + 1

      for (let i = 0; i < 3; i++) {
        const ringRadius = (25 + i * 8) * scaleFactor
        const ringAngle = elapsed * 0.001 * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 3

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(ringAngle)

        ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 - i * 0.1})`
        ctx.lineWidth = 2 * scaleFactor
        ctx.beginPath()
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()

        const electronAngle = elapsed * 0.003 * (i % 2 === 0 ? 1 : -1)
        const electronX = Math.cos(electronAngle) * ringRadius
        const electronY = Math.sin(electronAngle) * ringRadius * 0.3

        const electronGradient = ctx.createRadialGradient(
          electronX,
          electronY,
          0,
          electronX,
          electronY,
          4 * scaleFactor,
        )
        electronGradient.addColorStop(0, "rgba(6, 182, 212, 1)")
        electronGradient.addColorStop(1, "rgba(6, 182, 212, 0.3)")
        ctx.fillStyle = electronGradient
        ctx.beginPath()
        ctx.arc(electronX, electronY, 4 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      const energyGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 * pulseScale * scaleFactor)
      energyGlow.addColorStop(0, "rgba(139, 92, 246, 0.3)")
      energyGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.15)")
      energyGlow.addColorStop(1, "rgba(139, 92, 246, 0)")
      ctx.fillStyle = energyGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, 60 * pulseScale * scaleFactor, 0, Math.PI * 2)
      ctx.fill()

      const coreSize = 18 * pulseScale * scaleFactor

      const outerCore = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize)
      outerCore.addColorStop(0, "rgba(255, 255, 255, 1)")
      outerCore.addColorStop(0.3, "rgba(139, 92, 246, 0.9)")
      outerCore.addColorStop(0.7, "rgba(6, 182, 212, 0.8)")
      outerCore.addColorStop(1, "rgba(139, 92, 246, 0.5)")
      ctx.fillStyle = outerCore
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      const innerCore = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 0.6)
      innerCore.addColorStop(0, "rgba(255, 255, 255, 1)")
      innerCore.addColorStop(0.5, "rgba(139, 92, 246, 1)")
      innerCore.addColorStop(1, "rgba(6, 182, 212, 0.9)")
      ctx.fillStyle = innerCore
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize * 0.6, 0, Math.PI * 2)
      ctx.fill()

      const pulseOpacity = Math.sin(elapsed * 0.004) * 0.5 + 0.5
      ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`
      ctx.lineWidth = 2 * scaleFactor
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize * 0.8, 0, Math.PI * 2)
      ctx.stroke()

      for (let i = 0; i < 6; i++) {
        const particleAngle = elapsed * 0.002 + (i * Math.PI * 2) / 6
        const particleDistance = (45 + Math.sin(elapsed * 0.003 + i) * 5) * scaleFactor
        const particleX = centerX + Math.cos(particleAngle) * particleDistance
        const particleY = centerY + Math.sin(particleAngle) * particleDistance

        const particleGradient = ctx.createRadialGradient(
          particleX,
          particleY,
          0,
          particleX,
          particleY,
          3 * scaleFactor,
        )
        particleGradient.addColorStop(0, "rgba(6, 182, 212, 0.8)")
        particleGradient.addColorStop(1, "rgba(6, 182, 212, 0)")
        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(particleX, particleY, 3 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()
      }

      CATEGORIES.forEach((category, c) => {
        const radius = baseRadius * category.radiusRatio

        ctx.strokeStyle = ringGradients[c]
        ctx.lineWidth = 2 * scaleFactor
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radius, radius * category.tilt, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(elapsed * 0.001 + radius) * 0.05})`
        ctx.lineWidth = 1 * scaleFactor
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radius, radius * category.tilt, 0, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Posições dos planetas neste frame
      const planets = CATEGORIES.map((category) => {
        const radius = baseRadius * category.radiusRatio
        return category.techs.map((_, index) => {
          const angle = elapsed * category.speed + (index * Math.PI * 2) / category.techs.length
          const z = Math.sin(angle) * 0.5 + 0.5
          const scale = 0.8 + z * 0.5
          return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius * category.tilt,
            z,
            scale,
            iconSize: 32 * scale * scaleFactor,
          }
        })
      })

      // Sinapses: o núcleo dispara pulsos até os planetas (sozinho ou quando o mouse passa sobre um)
      if (elapsed > nextSynapse) {
        nextSynapse = elapsed + 550 + Math.random() * 500
        const c = Math.floor(Math.random() * CATEGORIES.length)
        synapses.push({ c, i: Math.floor(Math.random() * CATEGORIES[c].techs.length), t: 0, speed: 0.0011 })
      }
      const pointer = hover
      if (pointer) {
        planets.forEach((row, c) =>
          row.forEach((p, i) => {
            const near = (p.x - pointer.x) ** 2 + (p.y - pointer.y) ** 2 < (p.iconSize * 0.9) ** 2
            if (near && elapsed - lastHoverFire[c][i] > 700) {
              lastHoverFire[c][i] = elapsed
              synapses.push({ c, i, t: 0, speed: 0.0022 })
            }
          }),
        )
      }

      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (let s = synapses.length - 1; s >= 0; s--) {
        const syn = synapses[s]
        syn.t += syn.speed * dt
        const p = planets[syn.c][syn.i]
        if (syn.t >= 1) {
          flash[syn.c][syn.i] = 1
          synapses.splice(s, 1)
          continue
        }
        const fade = syn.t < 0.15 ? syn.t / 0.15 : 1
        const line = ctx.createLinearGradient(centerX, centerY, p.x, p.y)
        line.addColorStop(0, `rgba(139, 92, 246, ${0.45 * fade})`)
        line.addColorStop(1, `rgba(6, 182, 212, ${0.25 * fade})`)
        ctx.strokeStyle = line
        ctx.lineWidth = 1.2 * scaleFactor
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()

        const px = centerX + (p.x - centerX) * syn.t
        const py = centerY + (p.y - centerY) * syn.t
        ctx.fillStyle = "rgba(6, 182, 212, 0.3)"
        ctx.beginPath()
        ctx.arc(px, py, 7 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "rgba(230, 238, 248, 0.95)"
        ctx.beginPath()
        ctx.arc(px, py, 2.4 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      ctx.textAlign = "center"
      CATEGORIES.forEach((category, c) => {
        category.techs.forEach((tech, index) => {
          const { x, y, z, scale, iconSize } = planets[c][index]

          const { sprite, half } = sprites[c][index]
          const k = scale / MAX_SCALE
          ctx.drawImage(sprite, x - half * k, y - half * k, half * 2 * k, half * 2 * k)

          // Planeta atingido por uma sinapse: acende e emite um anel
          const f = (flash[c][index] *= 0.955)
          if (f > 0.03) {
            ctx.save()
            ctx.globalCompositeOperation = "lighter"
            ctx.fillStyle = `rgba(6, 182, 212, ${f * 0.35})`
            ctx.beginPath()
            ctx.arc(x, y, iconSize / 2 + 4 * scaleFactor, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = `rgba(6, 182, 212, ${f * 0.8})`
            ctx.lineWidth = 1.5 * scaleFactor
            ctx.beginPath()
            ctx.arc(x, y, iconSize / 2 + (1 - f) * 18 * scaleFactor, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
          }

          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + z * 0.05})`
          ctx.lineWidth = 1.5 * scaleFactor
          ctx.beginPath()
          ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2)
          ctx.stroke()

          ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + z * 0.1})`
          ctx.lineWidth = 1 * scaleFactor
          ctx.beginPath()
          ctx.arc(x, y, iconSize / 2 - 2 * scaleFactor, 0, Math.PI * 2)
          ctx.stroke()

          ctx.globalAlpha = Math.min(1, 0.7 + z * 0.3 + f * 0.3)
          ctx.font = `${Math.max(10, 12 * scale * scaleFactor)}px sans-serif`
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
          ctx.fillText(tech.name, x + 1, y + iconSize + 14 * scaleFactor)
          ctx.fillStyle = f > 0.1 ? "#e6eef8" : "#9aa4b2"
          ctx.fillText(tech.name, x, y + iconSize + 13 * scaleFactor)
          ctx.globalAlpha = 1
        })
      })
    }

    // Loop só roda enquanto a seção está visível. O tempo pausado não conta, então nada "salta" ao voltar.
    let frameId = 0
    let elapsed = 0
    let last = 0
    let ready = false // só anima depois do carregamento (ver whenIdle)
    let visible = false
    const tick = (now: number) => {
      if (last) elapsed += now - last
      last = now
      draw(elapsed)
      frameId = requestAnimationFrame(tick)
    }
    const play = () => {
      if (frameId || reduced || !ready || !visible) return
      last = 0
      frameId = requestAnimationFrame(tick)
    }
    const pause = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
    }

    // Sprites e primeiro quadro só são preparados quando a seção se aproxima da tela:
    // nada disso roda durante o carregamento da página (estava custando ~150ms de TBT no mobile).
    let sized = false
    const prepare = () => {
      if (sized) return
      sized = true
      resize()
      draw(elapsed)
    }
    const ro = new ResizeObserver(() => {
      sized = false
      if (visible) prepare()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          prepare()
          play()
        } else pause()
      },
      // Só quando a seção realmente aparece: logo abaixo da dobra ela não deve animar durante o carregamento
      { threshold: 0.15 },
    )
    io.observe(canvas)

    const cancelIdle = whenIdle(() => {
      ready = true
      play()
    })

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      hover = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => (hover = null)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerleave", onLeave)

    return () => {
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
      cancelIdle()
      pause()
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <section id="tech-stack" className="py-12 sm:py-16 lg:py-20">
      <h2 className="mb-3 text-center text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
        Tecnologias &{" "}
        <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">Ferramentas</span>
      </h2>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center sm:mb-8">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="aspect-square max-h-[900px] w-full max-w-[1000px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:gap-6">
          {CATEGORIES.map((category) => (
            <div key={category.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-[#e6eef8] sm:text-base">{category.title}</h3>
              <div className="flex flex-wrap gap-2">
                {category.techs.map((tech) => (
                  <div
                    key={tech.name}
                    className="chip inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-[#9aa4b2] transition-all hover:bg-white/10 sm:text-sm"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tech.color }} />
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
