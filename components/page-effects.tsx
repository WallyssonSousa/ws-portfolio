"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { whenIdle } from "@/lib/idle"
import { createNeuralField } from "@/lib/neural-field"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max))

// Roda `step` a cada frame enquanto ele retornar true; para sozinho quando a animação assenta.
function frameLoop(step: () => boolean) {
    let id = 0
    const tick = () => {
        id = step() ? requestAnimationFrame(tick) : 0
    }
    return {
        start: () => {
            if (!id) id = requestAnimationFrame(tick)
        },
        stop: () => {
            cancelAnimationFrame(id)
            id = 0
        },
    }
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const hasFinePointer = () => window.matchMedia("(pointer:fine)").matches

const CURSOR_IDLE = "radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)"
const CURSOR_HOVER = "radial-gradient(circle, rgba(255,255,255,0.28), rgba(255,255,255,0) 60%)"

export default function PageEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cursorRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    // Efeitos globais: vivem durante toda a sessão, independente da rota.
    useEffect(() => {
        const reduced = prefersReducedMotion()
        const fine = hasFinePointer()
        const ac = new AbortController()
        const { signal } = ac
        const loops: { stop: () => void }[] = []
        let cancelIdle = () => {}

        // Barra de progresso
        const progress = progressRef.current!
        let progressQueued = false
        const onScrollProgress = () => {
            if (progressQueued) return
            progressQueued = true
            requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight
                progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
                progressQueued = false
            })
        }
        window.addEventListener("scroll", onScrollProgress, { passive: true, signal })
        onScrollProgress()

        // Ripple nos botões (ignora .ghost)
        document.addEventListener(
            "click",
            (e) => {
                const btn = (e.target as Element).closest<HTMLElement>(".btn:not(.ghost)")
                if (!btn || reduced) return
                const rect = btn.getBoundingClientRect()
                const d = Math.max(rect.width, rect.height)
                const circle = document.createElement("span")
                circle.className = "absolute rounded-full pointer-events-none mix-blend-screen"
                circle.style.background = "radial-gradient(circle, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)"
                circle.style.width = circle.style.height = `${d}px`
                circle.style.left = `${e.clientX - rect.left - d / 2}px`
                circle.style.top = `${e.clientY - rect.top - d / 2}px`
                btn.appendChild(circle)
                circle.animate(
                    [
                        { transform: "scale(0.2)", opacity: 0.6 },
                        { transform: "scale(1.6)", opacity: 0 },
                    ],
                    { duration: 600, easing: "ease-out", fill: "forwards" },
                )
                setTimeout(() => circle.remove(), 650)
            },
            { signal },
        )

        // Interações de ponteiro: cursor orbe, magnético, tilt e brilho dos cards.
        // Um único listener delegado no document serve qualquer elemento, inclusive os montados depois.
        if (fine) {
            const cursor = cursorRef.current!
            let cx = window.innerWidth / 2,
                cy = window.innerHeight / 2,
                tx = cx,
                ty = cy
            const cursorLoop = frameLoop(() => {
                cx = lerp(cx, tx, 0.2)
                cy = lerp(cy, ty, 0.2)
                cursor.style.transform = `translate(${cx}px, ${cy}px)`
                return Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1
            })
            loops.push(cursorLoop)

            let magnet: HTMLElement | null = null
            let tilt: HTMLElement | null = null
            let hovering = false
            let cursorShown = false

            const releaseMagnet = () => {
                if (!magnet) return
                const el = magnet
                el.style.transition = "transform 0.25s ease"
                el.style.transform = "translate(0px, 0px)"
                setTimeout(() => (el.style.transition = ""), 260)
                magnet = null
            }
            const releaseTilt = () => {
                if (!tilt) return
                const el = tilt
                el.style.transition = "transform 0.6s cubic-bezier(.2,.9,.2,1)"
                el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)"
                setTimeout(() => (el.style.transition = ""), 620)
                tilt = null
            }

            document.addEventListener(
                "pointermove",
                (e) => {
                    if (e.pointerType === "touch") return
                    const target = e.target as Element

                    if (!reduced) {
                        if (!cursorShown) {
                            cursorShown = true
                            cursor.style.opacity = hovering ? "1" : "0.9"
                        }
                        tx = e.clientX
                        ty = e.clientY
                        cursorLoop.start()
                    }

                    const isHover = !!target.closest(".btn, .chip, a")
                    if (isHover !== hovering && !reduced) {
                        hovering = isHover
                        cursor.style.width = cursor.style.height = isHover ? "44px" : "22px"
                        cursor.style.background = isHover ? CURSOR_HOVER : CURSOR_IDLE
                        cursor.style.opacity = isHover ? "1" : "0.9"
                    }

                    // Magnético em .btn e .chip
                    if (!reduced) {
                        const el = target.closest<HTMLElement>(".btn, .chip")
                        if (el !== magnet) releaseMagnet()
                        if (el) {
                            magnet = el
                            const strength = el.classList.contains("btn") ? 14 : 8
                            const rect = el.getBoundingClientRect()
                            const mx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * strength
                            const my = ((e.clientY - rect.top - rect.height / 2) / rect.height) * strength
                            el.style.transform = `translate(${mx}px, ${my}px)`
                        }
                    }

                    // Tilt 3D + brilho que segue o mouse nos cards [data-tilt]
                    const card = target.closest<HTMLElement>("[data-tilt]")
                    if (card !== tilt) releaseTilt()
                    if (card) {
                        const rect = card.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const y = e.clientY - rect.top
                        card.style.setProperty("--mouse-x", `${x}px`)
                        card.style.setProperty("--mouse-y", `${y}px`)
                        if (!reduced) {
                            tilt = card
                            const rx = (y / rect.height - 0.5) * 10
                            const ry = (x / rect.width - 0.5) * -10
                            card.style.transition = "transform 0.05s linear"
                            card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`
                        }
                    }
                },
                { passive: true, signal },
            )
            document.documentElement.addEventListener(
                "pointerleave",
                () => {
                    releaseMagnet()
                    releaseTilt()
                    cursor.style.opacity = "0"
                    cursorShown = false
                },
                { signal },
            )
        }

        // Rede neural interativa de fundo (ver lib/neural-field.ts)
        {
            const canvas = canvasRef.current!
            const field = createNeuralField(canvas, { interactive: fine && !reduced, signal })
            if (reduced) {
                canvas.style.opacity = "1"
                field.still()
            } else {
                loops.push(field)
                // Depois do carregamento a rede aparece (fade-in) num quadro estático e "acorda" na primeira
                // interação, ou sozinha em 2,5s. Assim a animação nunca disputa a thread com a hidratação.
                cancelIdle = whenIdle(() => {
                    canvas.style.opacity = "1"
                    field.still()
                    const wake = () => {
                        clearTimeout(timer)
                        field.start()
                    }
                    const timer = setTimeout(wake, 2500)
                    for (const type of ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"]) {
                        window.addEventListener(type, wake, { once: true, passive: true, signal })
                    }
                    signal.addEventListener("abort", () => clearTimeout(timer))
                })
            }
        }

        return () => {
            ac.abort()
            cancelIdle()
            loops.forEach((l) => l.stop())
        }
    }, [])

    // Efeitos que dependem dos elementos da página atual: refeitos a cada navegação.
    useEffect(() => {
        const reduced = prefersReducedMotion()
        const fine = hasFinePointer()
        const ac = new AbortController()
        const { signal } = ac
        const loops: { stop: () => void }[] = []
        const observers: IntersectionObserver[] = []

        // Reveals ao rolar
        const revealEls = document.querySelectorAll<HTMLElement>(".section-fade")
        const reveal = (el: HTMLElement) => {
            el.classList.remove("opacity-0", "translate-y-8", "blur-[4px]")
            el.classList.add("opacity-100", "translate-y-0", "blur-0")
        }
        if (!reduced && "IntersectionObserver" in window) {
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return
                        reveal(entry.target as HTMLElement)
                        io.unobserve(entry.target)
                    })
                },
                { threshold: 0.2 },
            )
            revealEls.forEach((el) => io.observe(el))
            observers.push(io)
        } else {
            revealEls.forEach(reveal)
        }

        // Item ativo do menu + sublinhado: a seção ativa é a que cruza a linha de 35% da viewport
        const menu = document.getElementById("menu")
        const underline = document.getElementById("menu-underline")
        const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"))
        if (menu && underline && sections.length) {
            let current = ""
            const visible = new Set<string>()
            const paint = () => {
                const links = menu.querySelectorAll<HTMLAnchorElement>("a")
                links.forEach((a) => {
                    const isActive = a.getAttribute("href") === `#${current}`
                    a.parentElement?.classList.toggle("font-bold", isActive)
                    a.parentElement?.classList.toggle("text-[#8b5cf6]", isActive)
                })
                const active = menu.querySelector<HTMLAnchorElement>(`a[href="#${current}"]`)
                if (!active) return
                const r = active.getBoundingClientRect()
                const parentR = menu.getBoundingClientRect()
                underline.style.opacity = "1"
                underline.style.transform = `translateX(${r.left - parentR.left}px)`
                underline.style.width = `${r.width}px`
            }
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)))
                    const next = sections.filter((s) => visible.has(s.id)).pop()?.id
                    if (next && next !== current) {
                        current = next
                        paint()
                    }
                },
                { rootMargin: "-35% 0px -64% 0px" },
            )
            sections.forEach((s) => io.observe(s))
            observers.push(io)
            window.addEventListener("resize", paint, { signal })
        }

        // Spotlight no hero
        const hero = document.getElementById("home")
        const spotlight = document.getElementById("hero-spotlight")
        if (hero && spotlight && !reduced && fine) {
            spotlight.hidden = false
            let sx = window.innerWidth / 2,
                sy = window.innerHeight / 3,
                tx = sx,
                ty = sy
            const loop = frameLoop(() => {
                sx = lerp(sx, tx, 0.18)
                sy = lerp(sy, ty, 0.18)
                spotlight.style.transform = `translate(${sx}px, ${sy}px)`
                return Math.abs(tx - sx) > 0.1 || Math.abs(ty - sy) > 0.1
            })
            loops.push(loop)
            window.addEventListener(
                "pointermove",
                (e) => {
                    const rect = hero.getBoundingClientRect()
                    if (rect.bottom < 0) return // hero fora da tela
                    tx = e.clientX - rect.left
                    ty = e.clientY - rect.top
                    loop.start()
                },
                { passive: true, signal },
            )
            loop.start()
        }

        // Drift do cartão de perfil ao rolar
        const profileCard = document.getElementById("profile-card")
        if (hero && profileCard && !reduced) {
            let current = 10
            let target = 10
            const loop = frameLoop(() => {
                current = lerp(current, target, 0.2)
                profileCard.style.transform = `translateY(${current}px)`
                return Math.abs(target - current) > 0.05
            })
            loops.push(loop)
            const update = () => {
                const rect = hero.getBoundingClientRect()
                const p = clamp(1 - rect.top / (window.innerHeight || 1), 0, 1)
                target = lerp(10, -20, p)
                loop.start()
            }
            window.addEventListener("scroll", update, { passive: true, signal })
            update()
        }

        return () => {
            ac.abort()
            loops.forEach((l) => l.stop())
            observers.forEach((o) => o.disconnect())
        }
    }, [pathname])

    return (
        <>
            <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-0 h-full w-full pointer-events-none opacity-0 transition-opacity duration-1000" />
            <div
                ref={progressRef}
                aria-hidden
                className="fixed left-0 top-0 h-[3px] w-full origin-left scale-x-0 z-[60] bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] shadow-[0_0_20px_rgba(139,92,246,0.35)] pointer-events-none"
            />
            <div
                ref={cursorRef}
                aria-hidden
                className="fixed left-0 top-0 w-[22px] h-[22px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[70] backdrop-blur-sm border border-white/20 opacity-0 transition-[width,height,background,opacity] duration-200"
                style={{ background: CURSOR_IDLE }}
            />
        </>
    )
}
