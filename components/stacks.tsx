"use client"

import { useEffect, useRef } from "react"
import { whenIdle } from "@/lib/idle"

import { CATEGORIES, type Tech } from "@/data/techs"
import { getDictionary } from "@/content/dictionaries"
import type { Locale } from "@/lib/i18n"

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

export default function EnhancedTechStack({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).stacks
  // Rótulos curtos das categorias, lidos pelo canvas (o efeito roda uma vez só)
  const shortRef = useRef(t.short)
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
    // Telas estreitas: órbitas mais "redondas" (aproveitam a altura) e com mais espaço entre planetas
    let tiltBoost = 1
    let sprites: { sprite: HTMLCanvasElement; half: number }[][] = []
    let labelWidths: number[][] = []
    let currentFont = ""
    let ringGradients: CanvasGradient[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Adaptativo: no celular o raio usa mais da largura e ícones/nomes têm um tamanho mínimo legível
      const compact = width < 720 // celular e tablet
      baseRadius = Math.min(width, height) * (compact ? 0.45 : 0.38)
      scaleFactor = compact ? Math.max(baseRadius / 280, 0.62) : baseRadius / 280
      tiltBoost = compact ? 1.5 : 1
      sprites = CATEGORIES.map((c) => c.techs.map((t) => renderTechSprite(t, scaleFactor, dpr)))
      // Largura de cada nome a 12px, medida uma vez: a detecção de colisão escala a partir daqui
      ctx.font = "12px sans-serif"
      labelWidths = CATEGORIES.map((c) => c.techs.map((t) => ctx.measureText(t.name).width))
      currentFont = ""
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
        g.addColorStop(0, "rgba(59,130,246, 0.15)")
        g.addColorStop(0.5, "rgba(255, 255, 255, 0.08)")
        g.addColorStop(1, "rgba(125,211,252, 0.15)")
        return g
      })
    }

    // Sinapses núcleo → planeta e o "acender" de cada planeta
    type Synapse = { c: number; i: number; t: number; speed: number }
    type Planet = { c: number; i: number; x: number; y: number; z: number; scale: number; iconSize: number }
    const synapses: Synapse[] = []
    const flash = CATEGORIES.map((c) => c.techs.map(() => 0))
    const lastHoverFire = CATEGORIES.map((c) => c.techs.map(() => -Infinity))
    let nextSynapse = 400
    let hover: { x: number; y: number } | null = null
    let prevElapsed = 0

    // Foco: planeta sob o ponteiro. A órbita desacelera enquanto há foco, para o nome poder ser lido.
    let focus: { c: number; i: number } | null = null
    let focusAmount = 0 // 0 → 1, suaviza a entrada/saída do destaque
    let orbitTime = 0
    let orbitSpeed = 1

    const tiltOf = (category: { tilt: number }) => Math.min(0.92, category.tilt * tiltBoost)

    const drawCore = (elapsed: number, centerX: number, centerY: number) => {
      const pulseScale = Math.sin(elapsed * 0.002) * 0.15 + 1

      for (let i = 0; i < 3; i++) {
        const ringRadius = (25 + i * 8) * scaleFactor
        const ringAngle = elapsed * 0.001 * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 3

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(ringAngle)

        ctx.strokeStyle = `rgba(59,130,246, ${0.4 - i * 0.1})`
        ctx.lineWidth = 2 * scaleFactor
        ctx.beginPath()
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()

        const electronAngle = elapsed * 0.003 * (i % 2 === 0 ? 1 : -1)
        const electronX = Math.cos(electronAngle) * ringRadius
        const electronY = Math.sin(electronAngle) * ringRadius * 0.3
        const electronGradient = ctx.createRadialGradient(electronX, electronY, 0, electronX, electronY, 4 * scaleFactor)
        electronGradient.addColorStop(0, "rgba(125,211,252, 1)")
        electronGradient.addColorStop(1, "rgba(125,211,252, 0.3)")
        ctx.fillStyle = electronGradient
        ctx.beginPath()
        ctx.arc(electronX, electronY, 4 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      const energyGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 * pulseScale * scaleFactor)
      energyGlow.addColorStop(0, "rgba(59,130,246, 0.3)")
      energyGlow.addColorStop(0.5, "rgba(125,211,252, 0.15)")
      energyGlow.addColorStop(1, "rgba(59,130,246, 0)")
      ctx.fillStyle = energyGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, 60 * pulseScale * scaleFactor, 0, Math.PI * 2)
      ctx.fill()

      const coreSize = 18 * pulseScale * scaleFactor

      const outerCore = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize)
      outerCore.addColorStop(0, "rgba(255, 255, 255, 1)")
      outerCore.addColorStop(0.3, "rgba(59,130,246, 0.9)")
      outerCore.addColorStop(0.7, "rgba(125,211,252, 0.8)")
      outerCore.addColorStop(1, "rgba(59,130,246, 0.5)")
      ctx.fillStyle = outerCore
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      const innerCore = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 0.6)
      innerCore.addColorStop(0, "rgba(255, 255, 255, 1)")
      innerCore.addColorStop(0.5, "rgba(59,130,246, 1)")
      innerCore.addColorStop(1, "rgba(125,211,252, 0.9)")
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
        const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 3 * scaleFactor)
        particleGradient.addColorStop(0, "rgba(125,211,252, 0.8)")
        particleGradient.addColorStop(1, "rgba(125,211,252, 0)")
        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(particleX, particleY, 3 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Rótulos que venceram a disputa de espaço neste frame (ver draw)
    let labelOk = new Set<string>()
    // Opacidade atual de cada rótulo, suavizada entre frames (evita piscar quando a disputa muda)
    const labelFade = CATEGORIES.map((c) => c.techs.map(() => 0.3))

    const drawPlanet = (p: Planet) => {
      const tech = CATEGORIES[p.c].techs[p.i]
      const focused = focus?.c === p.c && focus?.i === p.i
      // Com foco em outro planeta, este esmaece; sem foco, fica normal
      const dim = focused ? 0 : focusAmount
      const grow = focused ? 1 + 0.18 * focusAmount : 1
      const scale = p.scale * grow
      const iconSize = p.iconSize * grow
      const { x, y } = p

      ctx.globalAlpha = 1 - dim * 0.6
      const { sprite, half } = sprites[p.c][p.i]
      const k = scale / MAX_SCALE
      ctx.drawImage(sprite, x - half * k, y - half * k, half * 2 * k, half * 2 * k)

      // Planeta atingido por uma sinapse: acende e emite um anel
      const f = (flash[p.c][p.i] *= 0.955)
      if (f > 0.03) {
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        ctx.fillStyle = `rgba(125,211,252, ${f * 0.35})`
        ctx.beginPath()
        ctx.arc(x, y, iconSize / 2 + 4 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = `rgba(125,211,252, ${f * 0.8})`
        ctx.lineWidth = 1.5 * scaleFactor
        ctx.beginPath()
        ctx.arc(x, y, iconSize / 2 + (1 - f) * 18 * scaleFactor, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      ctx.strokeStyle = focused ? `rgba(125,211,252, ${0.5 + 0.5 * focusAmount})` : `rgba(255, 255, 255, ${0.1 + p.z * 0.05})`
      ctx.lineWidth = (focused ? 2 : 1.5) * scaleFactor
      ctx.beginPath()
      ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + p.z * 0.1})`
      ctx.lineWidth = 1 * scaleFactor
      ctx.beginPath()
      ctx.arc(x, y, iconSize / 2 - 2 * scaleFactor, 0, Math.PI * 2)
      ctx.stroke()

      if (focused) {
        drawFocusLabel(tech.name, shortRef.current[p.c], x, y + iconSize / 2 + 12 * scaleFactor)
      } else {
        // Nome discreto: os planetas da frente ficam legíveis, os de trás quase somem
        // e um nome que colidiria com outro mais à frente praticamente some
        const depthAlpha = labelOk.has(p.c + "-" + p.i) ? (p.z < 0.5 ? 0.16 + p.z * 0.2 : 0.35 + (p.z - 0.5) * 1.2) : 0.05
        const target = Math.min(1, Math.max(0.05, depthAlpha * (1 - dim * 0.85) + f * 0.4))
        const alpha = (labelFade[p.c][p.i] += (target - labelFade[p.c][p.i]) * 0.12)
        if (alpha > 0.07) {
          ctx.globalAlpha = alpha
          // Tamanho arredondado: trocar ctx.font custa caro, então só troca quando o tamanho muda de fato
          const font = `${Math.round(Math.max(10, 12 * p.scale * scaleFactor))}px sans-serif`
          if (font !== currentFont) {
            ctx.font = font
            currentFont = font
          }
          ctx.fillStyle = f > 0.1 ? "#e6eef8" : "#9aa4b2"
          ctx.fillText(tech.name, x, y + iconSize + 13 * scaleFactor)
        }
      }
      ctx.globalAlpha = 1
    }

    // Rótulo de vidro do planeta em foco: nome em destaque + categoria
    const drawFocusLabel = (name: string, category: string, x: number, top: number) => {
      const nameSize = Math.max(13, 15 * scaleFactor)
      const catSize = Math.max(10, 11 * scaleFactor)
      ctx.font = `600 ${nameSize}px sans-serif`
      const nameW = ctx.measureText(name).width
      ctx.font = `${catSize}px sans-serif`
      const catW = ctx.measureText(category).width
      const padX = 12 * Math.max(1, scaleFactor)
      const w = Math.max(nameW, catW) + padX * 2
      const h = nameSize + catSize + 18
      const left = x - w / 2

      ctx.globalAlpha = focusAmount
      ctx.fillStyle = "rgba(11, 16, 32, 0.88)"
      ctx.strokeStyle = "rgba(125,211,252, 0.45)"
      ctx.lineWidth = 1
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(left, top, w, h, 10)
      else ctx.rect(left, top, w, h)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "#e6eef8"
      ctx.font = `600 ${nameSize}px sans-serif`
      ctx.fillText(name, x, top + 8 + nameSize * 0.85)
      ctx.fillStyle = "#7dd3fc"
      ctx.font = `${catSize}px sans-serif`
      ctx.fillText(category, x, top + 12 + nameSize + catSize * 0.85)
      ctx.globalAlpha = 1
      currentFont = "" // o rótulo trocou a fonte; o próximo planeta precisa redefinir
    }

    const draw = (elapsed: number) => {
      const dt = Math.min(64, Math.max(0, elapsed - prevElapsed))
      prevElapsed = elapsed
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      // A órbita anda no próprio relógio: desacelera com foco, sem "pular" quando volta
      orbitSpeed += ((focus ? 0.12 : 1) - orbitSpeed) * 0.08
      orbitTime += dt * orbitSpeed
      focusAmount += ((focus ? 1 : 0) - focusAmount) * 0.15

      // Órbitas (elipses)
      CATEGORIES.forEach((category, c) => {
        const radius = baseRadius * category.radiusRatio
        const highlighted = focus?.c === c
        ctx.strokeStyle = ringGradients[c]
        ctx.lineWidth = (highlighted ? 2.5 : 2) * scaleFactor
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radius, radius * tiltOf(category), 0, 0, Math.PI * 2)
        ctx.stroke()

        const base = 0.1 + Math.sin(elapsed * 0.001 + radius) * 0.05
        ctx.strokeStyle = highlighted
          ? `rgba(125,211,252, ${0.2 + 0.25 * focusAmount})`
          : `rgba(255, 255, 255, ${base * (1 - focusAmount * 0.5)})`
        ctx.lineWidth = 1 * scaleFactor
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radius, radius * tiltOf(category), 0, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Posições dos planetas neste frame
      const planets: Planet[] = []
      CATEGORIES.forEach((category, c) => {
        const radius = baseRadius * category.radiusRatio
        category.techs.forEach((_, i) => {
          const angle = orbitTime * category.speed + (i * Math.PI * 2) / category.techs.length
          const z = Math.sin(angle) * 0.5 + 0.5
          const scale = 0.8 + z * 0.5
          planets.push({
            c,
            i,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius * tiltOf(category),
            z,
            scale,
            iconSize: 32 * scale * scaleFactor,
          })
        })
      })
      const at = (c: number, i: number) => planets.find((p) => p.c === c && p.i === i)!

      // Foco: o planeta mais próximo do ponteiro (preferindo o da frente)
      const pointer = hover
      let nextFocus: typeof focus = null
      if (pointer) {
        let best = Infinity
        for (const p of planets) {
          const d = (p.x - pointer.x) ** 2 + (p.y - pointer.y) ** 2
          const reach = (p.iconSize * 0.95) ** 2
          const score = d - p.z * 40 // empate → o da frente vence
          if (d < reach && score < best) {
            best = score
            nextFocus = { c: p.c, i: p.i }
          }
        }
      }
      if (nextFocus && (nextFocus.c !== focus?.c || nextFocus.i !== focus?.i)) {
        // Novo foco: o núcleo dispara uma sinapse até ele
        if (elapsed - lastHoverFire[nextFocus.c][nextFocus.i] > 700) {
          lastHoverFire[nextFocus.c][nextFocus.i] = elapsed
          synapses.push({ c: nextFocus.c, i: nextFocus.i, t: 0, speed: 0.0024 })
        }
      }
      focus = nextFocus

      // Sinapses espontâneas
      if (elapsed > nextSynapse) {
        nextSynapse = elapsed + 550 + Math.random() * 500
        const c = Math.floor(Math.random() * CATEGORIES.length)
        synapses.push({ c, i: Math.floor(Math.random() * CATEGORIES[c].techs.length), t: 0, speed: 0.0011 })
      }

      // Profundidade: planetas de trás → núcleo → sinapses → planetas da frente → planeta em foco
      const sorted = planets.slice().sort((a, b) => a.z - b.z)
      const isFocus = (p: Planet) => focus?.c === p.c && focus?.i === p.i

      // Colisão de rótulos: posiciona os nomes da frente para trás; quem colidir com um já posicionado fica apagado
      const placed: { l: number; r: number; t: number; b: number }[] = []
      labelOk = new Set()
      for (let n = sorted.length - 1; n >= 0; n--) {
        const q = sorted[n]
        if (isFocus(q)) continue
        const size = Math.max(10, 12 * q.scale * scaleFactor)
        const w = labelWidths[q.c][q.i] * (size / 12) // largura medida uma vez no resize, escalada
        const y = q.y + q.iconSize + 13 * scaleFactor
        const rect = { l: q.x - w / 2 - 4, r: q.x + w / 2 + 4, t: y - size, b: y + 4 }
        if (!placed.some((o) => rect.l < o.r && rect.r > o.l && rect.t < o.b && rect.b > o.t)) {
          placed.push(rect)
          labelOk.add(q.c + "-" + q.i)
        }
      }
      ctx.textAlign = "center"
      for (const p of sorted) if (p.z < 0.5 && !isFocus(p)) drawPlanet(p)

      drawCore(elapsed, centerX, centerY)

      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (let s = synapses.length - 1; s >= 0; s--) {
        const syn = synapses[s]
        syn.t += syn.speed * dt
        const p = at(syn.c, syn.i)
        if (syn.t >= 1) {
          flash[syn.c][syn.i] = 1
          synapses.splice(s, 1)
          continue
        }
        const fade = syn.t < 0.15 ? syn.t / 0.15 : 1
        const line = ctx.createLinearGradient(centerX, centerY, p.x, p.y)
        line.addColorStop(0, `rgba(59,130,246, ${0.45 * fade})`)
        line.addColorStop(1, `rgba(125,211,252, ${0.25 * fade})`)
        ctx.strokeStyle = line
        ctx.lineWidth = 1.2 * scaleFactor
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()

        const px = centerX + (p.x - centerX) * syn.t
        const py = centerY + (p.y - centerY) * syn.t
        ctx.fillStyle = "rgba(125,211,252, 0.3)"
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
      for (const p of sorted) if (p.z >= 0.5 && !isFocus(p)) drawPlanet(p)
      const focused = sorted.find(isFocus)
      if (focused) drawPlanet(focused)
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

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    let touchTimer = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      hover = toLocal(e)
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") hover = null
    }
    // Toque (celular, sem hover): o planeta tocado fica em foco por alguns segundos
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return
      hover = toLocal(e)
      window.clearTimeout(touchTimer)
      touchTimer = window.setTimeout(() => (hover = null), 2500)
    }
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerleave", onLeave)
    canvas.addEventListener("pointerdown", onDown)

    return () => {
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("pointerdown", onDown)
      window.clearTimeout(touchTimer)
      cancelIdle()
      pause()
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <section id="tech-stack" className="py-12 sm:py-16 lg:py-20">
      <h2 className="mb-3 text-center text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
        {t.title}{" "}
        <span className="bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] bg-clip-text text-transparent">{t.highlight}</span>
      </h2>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="-mx-14 mb-6 flex justify-center sm:mx-0 sm:mb-8">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="aspect-square max-h-[900px] w-full max-w-[1000px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:gap-6">
          {CATEGORIES.map((category, idx) => (
            <div key={category.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-[#e6eef8] sm:text-base">{t.categories[idx]}</h3>
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
