"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"

// Modo rede neural: o conteúdo se dissolve, a rede do fundo se intensifica e o visitante
// fica livre para interagir com ela. Esc ou o botão "Voltar ao portfólio" trazem tudo de volta,
// na mesma posição de rolagem. O conteúdo chega pronto do servidor via children.
export default function HomeShell({ children }: { children: React.ReactNode }) {
  const [immersive, setImmersive] = useState(false)
  const [hidden, setHidden] = useState(false)

  // Sai do modo e devolve o foco ao botão que o abriu (navegação por teclado). O foco espera o
  // header voltar a ser visível: elementos com visibility hidden não aceitam foco.
  const exit = () => {
    setImmersive(false)
    setTimeout(() => document.querySelector<HTMLElement>("header button[title]")?.focus({ preventScroll: true }), 120)
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("neural-focus", { detail: immersive }))
    if (!immersive) {
      setHidden(false)
      return
    }

    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = "hidden"
    // Depois do fade, o conteúdo sai da pintura (visibility) para não custar nada por trás da rede
    const timer = setTimeout(() => setHidden(true), 700)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && exit()
    window.addEventListener("keydown", onKey)

    return () => {
      clearTimeout(timer)
      root.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [immersive])


  return (
    <>
      {/* Header fora do bloco com transform: um ancestral com transform faria o header fixo "pular" */}
      <div
        inert={immersive}
        aria-hidden={immersive}
        className={`transition-opacity duration-500 motion-reduce:transition-none ${immersive ? "pointer-events-none opacity-0" : ""} ${
          hidden ? "invisible" : ""
        }`}
      >
        <Header onExplore={() => setImmersive(true)} />
      </div>
      <div
        inert={immersive}
        aria-hidden={immersive}
        className={`origin-top transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${
          immersive ? "pointer-events-none scale-[0.97] opacity-0 blur-sm" : ""
        } ${hidden ? "invisible" : ""}`}
      >
        {children}
      </div>

      {immersive && <NeuralModePanel onExit={exit} />}
    </>
  )
}

function NeuralModePanel({ onExit }: { onExit: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Foca o "Voltar" depois que o conteúdo ficou inerte (autoFocus rodaria antes e perderia o foco)
  useEffect(() => {
    const id = requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-8 sm:pb-10">
      <div
        role="dialog"
        aria-label="Modo rede neural"
        className="glass pointer-events-auto flex w-full max-w-xl animate-[fadeUp_0.6s_ease_0.35s_both] flex-col items-center gap-4 rounded-2xl px-6 py-5 text-center sm:flex-row sm:text-left"
      >
        <div className="flex-1">
          <p className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-sm font-semibold text-transparent">
            Você está dentro da rede neural
          </p>
          <p className="mt-1 text-sm text-[#9aa4b2]">
            <span className="hidden sm:inline">Mova o mouse para ativar os neurônios e clique para uma descarga.</span>
            <span className="sm:hidden">Toque na tela para disparar a rede.</span>
          </p>
        </div>
        <button
          ref={buttonRef}
          onClick={onExit}
          className="btn relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] px-4 py-2.5 text-sm font-bold text-[#061025] shadow-[0_8px_32px_rgba(139,92,246,0.2)]"
        >
          <ArrowLeft size={16} />
          Voltar ao portfólio
          <kbd className="hidden rounded border border-[#061025]/30 px-1.5 text-[10px] font-semibold sm:inline">Esc</kbd>
        </button>
      </div>
    </div>
  )
}
