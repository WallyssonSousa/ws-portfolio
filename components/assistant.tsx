"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { BrainCircuit, Bot, SendHorizontal, X } from "lucide-react"
import { getDictionary } from "@/content/dictionaries"
import type { AssistantAnswer } from "@/lib/assistant"
import type { Locale } from "@/lib/i18n"

type Message = { role: "user" | "bot"; text: string; links?: AssistantAnswer["links"]; typing?: boolean }

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Assistente do portfólio: responde localmente a partir dos dados do site (lib/assistant.ts).
// O motor só é carregado quando o painel abre, para não pesar no carregamento da página.
export default function Assistant({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).assistant
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: t.welcome }])
  const [asked, setAsked] = useState<string[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  // Some durante o modo rede neural
  useEffect(() => {
    const onFocus = (e: Event) => {
      const on = (e as CustomEvent<boolean>).detail
      setHidden(on)
      if (on) setOpen(false)
    }
    window.addEventListener("neural-focus", onFocus)
    return () => window.removeEventListener("neural-focus", onFocus)
  }, [])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      launcherRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" })
  }, [messages, busy])

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || busy) return
    setInput("")
    setAsked((a) => [...a, q])
    setMessages((m) => [...m, { role: "user", text: q }])
    setBusy(true)

    // "Pensando": a rede do fundo dispara enquanto a resposta é montada
    const pulses = window.setInterval(() => window.dispatchEvent(new Event("neural-pulse")), 180)
    const [{ answer }] = await Promise.all([
      import("@/lib/assistant"),
      new Promise((r) => setTimeout(r, reducedMotion() ? 0 : 550 + Math.random() * 350)),
    ])
    window.clearInterval(pulses)
    const reply = answer(q, locale)
    setBusy(false)

    if (reducedMotion()) {
      setMessages((m) => [...m, { role: "bot", ...reply }])
      return
    }
    // Resposta "digitada"
    setMessages((m) => [...m, { role: "bot", text: "", typing: true }])
    let shown = 0
    const timer = window.setInterval(() => {
      shown = Math.min(reply.text.length, shown + 3)
      const done = shown >= reply.text.length
      setMessages((m) => {
        const copy = m.slice()
        copy[copy.length - 1] = { role: "bot", text: reply.text.slice(0, shown), links: done ? reply.links : undefined, typing: !done }
        return copy
      })
      if (done) window.clearInterval(timer)
    }, 16)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  const suggestions = t.suggestions.filter((s) => !asked.includes(s)).slice(0, 3)

  if (hidden) return null

  return (
    <div className="print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="glass fixed right-4 bottom-24 z-50 flex h-[min(560px,calc(100dvh-8rem))] w-[min(390px,calc(100vw-2rem))] animate-[fadeUp_0.35s_ease_both] flex-col overflow-hidden rounded-2xl sm:right-6"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] text-[#061025]">
              <Bot size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{t.title}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false)
                launcherRef.current?.focus()
              }}
              aria-label={t.close}
              className="rounded-lg p-1.5 text-[#9aa4b2] transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] font-medium text-[#061025]"
                      : "rounded-bl-md border border-white/10 bg-white/[0.04] text-[#cdd6e3]"
                  }`}
                >
                  {m.text}
                  {m.typing && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[#7dd3fc] align-middle" />}
                  {m.links && m.links.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target={l.href.startsWith("http") ? "_blank" : undefined}
                          rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                          onClick={() => !l.href.startsWith("http") && setOpen(false)}
                          className="rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 px-2.5 py-1 text-xs text-[#7dd3fc] transition hover:bg-[#7dd3fc]/20"
                        >
                          {l.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 px-1 text-xs text-[#9aa4b2]">
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="neuron-live h-2 w-2 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc]"
                      style={{ animationDelay: `${i * 0.2}s`, animationDuration: "0.9s" }}
                    />
                  ))}
                </span>
                {t.thinking}
              </div>
            )}
          </div>

          {suggestions.length > 0 && !busy && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#cdd6e3] transition hover:border-[#3b82f6]/40 hover:bg-white/10 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-[#9aa4b2] transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={t.send}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] text-[#061025] transition disabled:opacity-40"
            >
              <SendHorizontal size={17} />
            </button>
          </form>
        </div>
      )}

      <button
        ref={launcherRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? t.close : t.open}
        title={t.open}
        className="group fixed right-4 bottom-4 z-50 grid h-14 w-14 place-items-center rounded-full sm:right-6 sm:bottom-6"
      >
        {!open && (
          <span aria-hidden className="neuron-live absolute inset-0 rounded-full bg-gradient-to-br from-[#3b82f6]/40 to-[#7dd3fc]/40" />
        )}
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] p-[2px] shadow-[0_8px_32px_rgba(59,130,246,0.35)] transition-transform group-hover:scale-105">
          <span className="grid h-full w-full place-items-center rounded-full bg-[#0b1020] text-[#93c5fd]">
            {open ? <X size={20} /> : <BrainCircuit size={22} />}
          </span>
        </span>
      </button>
    </div>
  )
}
