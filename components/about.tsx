"use client"

import { useEffect, useRef } from "react"
import { Briefcase, Calendar, GraduationCap, MapPin } from "lucide-react"
import { timeline } from "@/data/profile"

// Linha do tempo como um axônio: um sinal percorre a linha e, ao passar por cada etapa,
// o neurônio dispara, a sinapse leva o pulso até o cartão e o cartão brilha.
export default function About() {
  const listRef = useRef<HTMLOListElement>(null)
  const signalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current!
    const signal = signalRef.current!
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let animations: Animation[] = []
    let visible = false

    const build = () => {
      animations.forEach((a) => a.cancel())
      animations = []

      const height = list.offsetHeight
      if (!height) return
      const duration = Math.max(6000, height * 6.5) // ~155px/s
      const timing: KeyframeAnimationOptions = { duration, iterations: Infinity, easing: "linear" }

      signal.style.opacity = "1"
      animations.push(
        signal.animate([{ transform: "translateY(0px)" }, { transform: `translateY(${height}px)` }], timing),
      )

      const listTop = list.getBoundingClientRect().top
      list.querySelectorAll<HTMLElement>("[data-neuron]").forEach((neuron) => {
        const r = neuron.getBoundingClientRect()
        const o = Math.min(0.9, Math.max(0.02, (r.top + r.height / 2 - listTop) / height))
        const item = neuron.closest("li")!

        // Halo do neurônio: dispara quando o sinal chega
        const halo = neuron.querySelector<HTMLElement>("[data-halo]")!
        animations.push(
          halo.animate(
            [
              { opacity: 0, transform: "scale(0.6)", offset: 0 },
              { opacity: 0, transform: "scale(0.6)", offset: o - 0.015 },
              { opacity: 1, transform: "scale(1.3)", offset: o },
              { opacity: 0, transform: "scale(2.6)", offset: o + 0.08 },
              { opacity: 0, transform: "scale(0.6)", offset: 1 },
            ],
            timing,
          ),
        )

        // Pulso atravessando a sinapse até o cartão
        const pulse = item.querySelector<HTMLElement>("[data-pulse]")
        const branch = item.querySelector<HTMLElement>("[data-branch]")
        if (pulse && branch) {
          const w = branch.offsetWidth
          // Direção pela geometria real: no celular todos os cartões ficam à direita do axônio
          const b = branch.getBoundingClientRect()
          const dir = b.left + b.width / 2 < r.left + r.width / 2 ? -1 : 1
          animations.push(
            pulse.animate(
              [
                { opacity: 0, transform: "translateX(0px)", offset: 0 },
                { opacity: 0, transform: "translateX(0px)", offset: o },
                { opacity: 1, transform: `translateX(${(dir * w) / 2}px)`, offset: o + 0.02 },
                { opacity: 0, transform: `translateX(${dir * w}px)`, offset: o + 0.04 },
                { opacity: 0, transform: "translateX(0px)", offset: 1 },
              ],
              timing,
            ),
          )
        }

        // Cartão brilha quando o pulso chega
        const glow = item.querySelector<HTMLElement>("[data-glow]")
        if (glow) {
          animations.push(
            glow.animate(
              [
                { opacity: 0, offset: 0 },
                { opacity: 0, offset: o + 0.03 },
                { opacity: 1, offset: o + 0.05 },
                { opacity: 0, offset: Math.min(0.99, o + 0.2) },
                { opacity: 0, offset: 1 },
              ],
              timing,
            ),
          )
        }
      })

      if (!visible) animations.forEach((a) => a.pause())
    }

    // Só monta as animações perto da tela, e só anima enquanto está visível
    let dirty = true
    let queued = 0
    const ro = new ResizeObserver(() => {
      dirty = true
      if (!visible) return
      cancelAnimationFrame(queued)
      queued = requestAnimationFrame(() => {
        dirty = false
        build()
      })
    })
    ro.observe(list)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && dirty) {
          dirty = false
          build()
        }
        animations.forEach((a) => (visible ? a.play() : a.pause()))
      },
      { rootMargin: "200px" },
    )
    io.observe(list)

    return () => {
      cancelAnimationFrame(queued)
      ro.disconnect()
      io.disconnect()
      animations.forEach((a) => a.cancel())
    }
  }, [])

  return (
    <section id="about" className="py-28">
      <h2 className="mb-3 text-center text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
        Minha{" "}
        <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">Trajetória</span>
      </h2>
      <p className="section-fade mx-auto max-w-2xl text-center text-[#9aa4b2] opacity-0 translate-y-8 blur-[4px] transition-all duration-700">
        Sou desenvolvedor com experiência em aplicações web, APIs e automação. Gosto de unir engenharia sólida com
        design e microinterações, mantendo performance e clareza como prioridades.
      </p>

      <div className="relative mt-16">
        {/* Axônio */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 left-[19px] w-px bg-gradient-to-b from-[#8b5cf6]/70 via-[#6d8df0]/40 to-[#06b6d4]/70 md:left-1/2"
        />
        {/* Sinal percorrendo o axônio */}
        <div
          ref={signalRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-[19px] z-10 -ml-[5px] -mt-[60px] opacity-0 md:left-1/2"
        >
          <div className="mx-auto h-[56px] w-[2px] bg-gradient-to-b from-transparent to-[#06b6d4]" />
          <div className="h-[11px] w-[11px] rounded-full bg-[#e6eef8] shadow-[0_0_12px_4px_rgba(6,182,212,0.7)]" />
        </div>

        <ol ref={listRef} className="space-y-12">

        {timeline.map((item, i) => {
          const side = i % 2 === 0 ? "left" : "right"
          const Icon = item.kind === "trabalho" ? Briefcase : GraduationCap
          return (
            <li key={item.title} className="group relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
              {/* Neurônio */}
              <div
                data-neuron
                aria-hidden
                className="absolute top-6 left-[19px] z-10 h-[15px] w-[15px] -translate-x-1/2 md:left-1/2"
              >
                <span
                  data-halo
                  className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.55),rgba(139,92,246,0.25)_45%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] p-[2px]">
                  <span className="block h-full w-full rounded-full bg-[#0b1020]" />
                </span>
                <span
                  className={`absolute inset-[4px] rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] transition-transform duration-300 group-hover:scale-125 ${
                    item.current ? "neuron-live" : ""
                  }`}
                />
              </div>

              {/* Sinapse neurônio → cartão */}
              <div
                data-branch={side}
                aria-hidden
                className={`absolute top-[31px] left-[19px] h-px w-[37px] bg-gradient-to-r from-[#8b5cf6]/60 to-[#06b6d4]/40 md:w-8 ${
                  side === "left" ? "md:right-1/2 md:left-auto md:bg-gradient-to-l" : "md:left-1/2"
                }`}
              >
                <span
                  data-pulse
                  className={`absolute -top-[2px] h-[5px] w-[5px] rounded-full bg-[#e6eef8] opacity-0 shadow-[0_0_8px_2px_rgba(6,182,212,0.8)] ${
                    side === "left" ? "left-0 md:right-0 md:left-auto" : "left-0"
                  }`}
                />
              </div>

              {/* Cartão */}
              <article
                className={`section-fade glass relative overflow-hidden rounded-2xl p-6 opacity-0 translate-y-8 blur-[4px] transition-all duration-700 hover:border-white/20 ${
                  side === "left" ? "md:col-start-1" : "md:col-start-2"
                }`}
              >
                <div
                  data-glow
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(120%_80%_at_0%_0%,rgba(6,182,212,0.14),transparent_60%)] opacity-0"
                />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-[#cdd6e3]">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.period}
                    </span>
                    {item.current && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-1 text-xs text-[#67e8f9]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4]" aria-hidden />
                        atual
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 flex items-start gap-2 text-lg font-semibold text-white">
                    <Icon className="mt-1 h-4 w-4 shrink-0 text-[#a78bfa]" />
                    {item.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#cdd6e3]">
                    <MapPin className="h-3.5 w-3.5 text-[#9aa4b2]" />
                    {item.place}
                  </p>

                  {item.details && <p className="mt-4 text-sm leading-relaxed text-[#9aa4b2]">{item.details}</p>}

                  {item.tags && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-[#cdd6e3]"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </li>
          )
        })}
        </ol>
      </div>
    </section>
  )
}
