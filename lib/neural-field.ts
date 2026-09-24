// Rede neural interativa de fundo: neurônios flutuam em profundidade, conectam-se quando próximos
// e trocam sinais. O ponteiro age como mais um neurônio; o clique dispara uma descarga em onda.

const VIOLET = [139, 92, 246]
const CYAN = [6, 182, 212]
const COLOR_BUCKETS = 6 // as sinapses são agrupadas por cor e opacidade: poucos strokes por frame
const ALPHA_BUCKETS = 4

type Neuron = { x: number; y: number; vx: number; vy: number; z: number; act: number; sx: number; sy: number }
type Pulse = { from: number; to: number; t: number; speed: number; hops: number }
type Wave = { x: number; y: number; r: number; life: number }

const POINTER = -1 // índice "virtual" do neurônio do ponteiro

const mixRaw = (t: number) => VIOLET.map((v, i) => Math.round(v + (CYAN[i] - v) * t)).join(", ")
// Cores do gradiente pré-calculadas: nada de montar string de cor a cada frame
const COLOR_STEPS = 32
const COLOR_TABLE = Array.from({ length: COLOR_STEPS }, (_, i) => mixRaw(i / (COLOR_STEPS - 1)))
const mix = (t: number) => COLOR_TABLE[Math.round(Math.min(1, Math.max(0, t)) * (COLOR_STEPS - 1))]

export function createNeuralField(
  canvas: HTMLCanvasElement,
  { interactive, signal }: { interactive: boolean; signal: AbortSignal },
) {
  const ctx = canvas.getContext("2d")!
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const neuronFill = Array.from({ length: COLOR_BUCKETS }, (_, i) => `rgba(${mix(i / (COLOR_BUCKETS - 1))}, 0.75)`)

  let W = 0
  let H = 0
  let baseLink = 150
  let link = 150
  // Modo rede neural (evento "neural-focus"): mais conexões, mais disparos, alcance maior do ponteiro
  let focus = 0
  let focusTarget = 0
  let neurons: Neuron[] = []
  const pulses: Pulse[] = []
  const waves: Wave[] = []
  const pointer = { x: -9999, y: -9999, active: false, lastFire: 0 }
  let scroll = window.scrollY

  // Segmentos das sinapses por bucket (cor × opacidade), em buffers reaproveitados entre frames
  const BUCKETS = COLOR_BUCKETS * ALPHA_BUCKETS
  const segs: Float32Array[] = Array.from({ length: BUCKETS }, () => new Float32Array(4 * 400))
  const segCount = new Uint16Array(BUCKETS)
  const bucketStroke = Array.from({ length: BUCKETS }, (_, k) => {
    const cb = Math.floor(k / ALPHA_BUCKETS)
    const ab = k % ALPHA_BUCKETS
    return `rgba(${mix(cb / (COLOR_BUCKETS - 1))}, ${0.06 + ab * 0.075})`
  })

  const populate = () => {
    const count = Math.round(Math.min(120, Math.max(36, (W * H) / 15000)))
    neurons = Array.from({ length: count }, () => {
      const z = 0.35 + Math.random() * 0.65
      const speed = 0.08 + Math.random() * 0.18
      const angle = Math.random() * Math.PI * 2
      return { x: Math.random() * W, y: Math.random() * H, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, z, act: 0, sx: 0, sy: 0 }
    })
  }

  const resize = () => {
    const prevW = W || window.innerWidth
    const prevH = H || window.innerHeight
    W = window.innerWidth
    H = window.innerHeight
    baseLink = W < 640 ? 115 : 150
    link = baseLink
    canvas.width = Math.floor(W * dpr)
    canvas.height = Math.floor(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!neurons.length) populate()
    else neurons.forEach((n) => ((n.x *= W / prevW), (n.y *= H / prevH)))
  }

  const pos = (i: number) => (i === POINTER ? pointer : { x: neurons[i].sx, y: neurons[i].sy })

  // Dispara um neurônio: acende e manda sinal para até 2 vizinhos mais próximos
  const fire = (i: number, hops: number, exclude = POINTER) => {
    const n = neurons[i]
    n.act = 1
    if (hops <= 0) return
    const near: { j: number; d: number }[] = []
    for (let j = 0; j < neurons.length; j++) {
      if (j === i || j === exclude) continue
      const d = (neurons[j].sx - n.sx) ** 2 + (neurons[j].sy - n.sy) ** 2
      if (d < link * link) near.push({ j, d })
    }
    near.sort((a, b) => a.d - b.d)
    for (const { j } of near.slice(0, 2)) {
      if (pulses.length > 90) break
      pulses.push({ from: i, to: j, t: 0, speed: 0.025 + Math.random() * 0.02, hops: hops - 1 })
    }
  }

  const nearestTo = (x: number, y: number, radius: number) => {
    let best = -1
    let bestD = radius * radius
    neurons.forEach((n, i) => {
      const d = (n.sx - x) ** 2 + (n.sy - y) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }

  let lastSpontaneous = 0

  const frame = (now: number) => {
    ctx.clearRect(0, 0, W, H)

    focus += (focusTarget - focus) * 0.04
    link = baseLink * (1 + 0.35 * focus)
    const pointerReach = 190 * (1 + 0.5 * focus)

    // Movimento + parallax de rolagem (camadas mais próximas rolam mais rápido)
    const span = H + 120
    for (const n of neurons) {
      n.x += n.vx
      n.y += n.vy
      if (n.x < -40) n.x = W + 40
      else if (n.x > W + 40) n.x = -40
      if (n.y < -60) n.y += span
      else if (n.y > H + 60) n.y -= span
      if (pointer.active) {
        // Atração suave em direção ao ponteiro
        const dx = pointer.x - n.sx
        const dy = pointer.y - n.sy
        const d2 = dx * dx + dy * dy
        if (d2 < 220 * 220 && d2 > 400) {
          n.x += dx * 0.0025 * n.z
          n.y += dy * 0.0025 * n.z
        }
      }
      n.sx = n.x
      n.sy = ((((n.y - scroll * 0.12 * n.z) % span) + span) % span) - 60
      n.act *= 0.94
    }

    // Sinapses entre neurônios próximos, agrupadas em buckets de cor × opacidade
    segCount.fill(0)
    const L2 = link * link
    for (let i = 0; i < neurons.length; i++) {
      const a = neurons[i]
      for (let j = i + 1; j < neurons.length; j++) {
        const b = neurons[j]
        const dx = a.sx - b.sx
        const dy = a.sy - b.sy
        const d2 = dx * dx + dy * dy
        if (d2 > L2) continue
        const strength = (1 - Math.sqrt(d2) / link) * Math.min(a.z, b.z)
        const ab = Math.min(ALPHA_BUCKETS - 1, Math.floor(strength * ALPHA_BUCKETS) + (focus > 0.5 ? 1 : 0))
        const cb = Math.min(COLOR_BUCKETS - 1, Math.max(0, Math.floor(((a.sx + b.sx) / 2 / W) * COLOR_BUCKETS)))
        const k = cb * ALPHA_BUCKETS + ab
        const c = segCount[k]
        if (c >= 400) continue
        const buf = segs[k]
        buf[c * 4] = a.sx
        buf[c * 4 + 1] = a.sy
        buf[c * 4 + 2] = b.sx
        buf[c * 4 + 3] = b.sy
        segCount[k] = c + 1
      }
    }
    ctx.lineWidth = 1
    for (let k = 0; k < BUCKETS; k++) {
      const count = segCount[k]
      if (!count) continue
      const buf = segs[k]
      ctx.strokeStyle = bucketStroke[k]
      ctx.beginPath()
      for (let c = 0; c < count; c++) {
        ctx.moveTo(buf[c * 4], buf[c * 4 + 1])
        ctx.lineTo(buf[c * 4 + 2], buf[c * 4 + 3])
      }
      ctx.stroke()
    }

    // O ponteiro também é um neurônio: conecta-se aos próximos
    if (pointer.active) {
      ctx.lineWidth = 1
      for (const n of neurons) {
        const d = Math.hypot(n.sx - pointer.x, n.sy - pointer.y)
        if (d > pointerReach) continue
        ctx.strokeStyle = `rgba(${CYAN.join(", ")}, ${(1 - d / pointerReach) * 0.45})`
        ctx.beginPath()
        ctx.moveTo(pointer.x, pointer.y)
        ctx.lineTo(n.sx, n.sy)
        ctx.stroke()
      }
    }

    // Neurônios
    for (let cb = 0; cb < COLOR_BUCKETS; cb++) {
      ctx.fillStyle = neuronFill[cb]
      ctx.beginPath()
      for (const n of neurons) {
        if (Math.min(COLOR_BUCKETS - 1, Math.max(0, Math.floor((n.sx / W) * COLOR_BUCKETS))) !== cb) continue
        const r = 0.9 + n.z * 1.6
        ctx.moveTo(n.sx + r, n.sy)
        ctx.arc(n.sx, n.sy, r, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    // Brilho aditivo: neurônios ativos, sinais e ondas
    ctx.globalCompositeOperation = "lighter"
    for (const n of neurons) {
      if (n.act < 0.03) continue
      const color = mix(Math.min(1, Math.max(0, n.sx / W)))
      ctx.fillStyle = `rgba(${color}, ${n.act * 0.35})`
      ctx.beginPath()
      ctx.arc(n.sx, n.sy, 3 + n.act * 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(230, 238, 248, ${n.act * 0.9})`
      ctx.beginPath()
      ctx.arc(n.sx, n.sy, 1.2 + n.act * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]
      const a = pos(p.from)
      const b = pos(p.to)
      // Sinapse rompida (neurônios se afastaram demais): o sinal se perde
      if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 > (link * 1.4) ** 2) {
        pulses.splice(i, 1)
        continue
      }
      p.t += p.speed
      if (p.t >= 1) {
        pulses.splice(i, 1)
        fire(p.to, p.hops, p.from)
        continue
      }
      const x = a.x + (b.x - a.x) * p.t
      const y = a.y + (b.y - a.y) * p.t
      const color = mix(Math.min(1, Math.max(0, x / W)))
      ctx.fillStyle = `rgba(${color}, 0.28)`
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "rgba(230, 238, 248, 0.95)"
      ctx.beginPath()
      ctx.arc(x, y, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i]
      w.r += 7
      w.life -= 0.022
      if (w.life <= 0) {
        waves.splice(i, 1)
        continue
      }
      ctx.strokeStyle = `rgba(${mix(Math.min(1, Math.max(0, w.x / W)))}, ${w.life * 0.5})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = "source-over"

    // Atividade espontânea: a rede está sempre "pensando"
    if (now - lastSpontaneous > (900 + Math.random() * 500) * (1 - 0.65 * focus)) {
      lastSpontaneous = now
      fire(Math.floor(Math.random() * neurons.length), 4)
    }
  }

  // ── Interação ──
  if (interactive) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return
        pointer.x = e.clientX
        pointer.y = e.clientY
        pointer.active = true
        const now = performance.now()
        if (now - pointer.lastFire > 380) {
          const i = nearestTo(pointer.x, pointer.y, 190)
          if (i >= 0) {
            pointer.lastFire = now
            pulses.push({ from: POINTER, to: i, t: 0, speed: 0.06, hops: 3 })
          }
        }
      },
      { passive: true, signal },
    )
    document.documentElement.addEventListener("pointerleave", () => (pointer.active = false), { signal })
  }

  // Clique/toque: descarga em onda que ativa os neurônios ao redor
  window.addEventListener(
    "pointerdown",
    (e) => {
      waves.push({ x: e.clientX, y: e.clientY, r: 4, life: 1 })
      neurons.forEach((n, i) => {
        if ((n.sx - e.clientX) ** 2 + (n.sy - e.clientY) ** 2 < 230 * 230) fire(i, 2)
      })
    },
    { passive: true, signal },
  )

  window.addEventListener("scroll", () => (scroll = window.scrollY), { passive: true, signal })
  window.addEventListener("neural-focus", (e) => (focusTarget = (e as CustomEvent<boolean>).detail ? 1 : 0), { signal })

  let resizeQueued = false
  window.addEventListener(
    "resize",
    () => {
      if (resizeQueued) return
      resizeQueued = true
      requestAnimationFrame(() => {
        resize()
        resizeQueued = false
      })
    },
    { signal },
  )

  resize()

  let id = 0
  const tick = (now: number) => {
    frame(now)
    id = requestAnimationFrame(tick)
  }
  return {
    start: () => {
      if (!id) id = requestAnimationFrame(tick)
    },
    stop: () => {
      cancelAnimationFrame(id)
      id = 0
    },
    // Um único quadro estático (prefers-reduced-motion)
    still: () => frame(performance.now()),
  }
}
