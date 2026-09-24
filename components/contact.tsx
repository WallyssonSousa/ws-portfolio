"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  FileText,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  RotateCcw,
  Send,
} from "lucide-react"
import { cvPdfPath } from "@/components/site/cv-paths"
import { getDictionary } from "@/content/dictionaries"
import { contactInfo } from "@/data/profile"
import { localePath, type Locale } from "@/lib/i18n"

type Channel = "email" | "whatsapp"

const reveal = "section-fade opacity-0 translate-y-8 blur-[4px] transition-all duration-700"
const pill =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#cdd6e3] transition hover:border-[#3b82f6]/40 hover:bg-white/10 hover:text-white"
const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-white placeholder-[#9aa4b2] transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"

const gmailUrl = (subject = "", body = "") =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
const mailtoUrl = (subject = "", body = "") =>
  `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
const whatsappUrl = (text = "") => `https://wa.me/${contactInfo.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`

// A rede neural do fundo dispara em sequência (mesmo gesto do assistente)
const neuralBurst = () => {
  for (let i = 0; i < 8; i++) setTimeout(() => window.dispatchEvent(new Event("neural-pulse")), i * 70)
}

// Copiar para a área de transferência com confirmação visual temporária
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef(0)
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand("copy")
      area.remove()
    }
    setCopied(key)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), 1800)
  }
  return { copied, copy }
}

// Hora de São Paulo ao vivo: só aparece depois de montar, para não divergir do HTML do servidor
function LocalTime({ locale, label }: { locale: Locale; label: string }) {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [locale])
  return (
    <span>
      {label} <span className="font-semibold text-white tabular-nums">{time ?? "--:--"}</span> <span className="text-[#9aa4b2]">(UTC−3)</span>
    </span>
  )
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] p-[2px]">
      <span className="grid h-full w-full place-items-center rounded-[10px] bg-[#0b1020] text-[#93c5fd]">{children}</span>
    </span>
  )
}

export default function Contact({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).contact
  const { copied, copy } = useCopy()

  const [channel, setChannel] = useState<Channel>("email")
  const [topic, setTopic] = useState<number | null>(null)
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sent, setSent] = useState<{ channel: Channel; subject: string; body: string } | null>(null)

  const socials = [
    { key: "whatsapp", label: t.channels.whatsapp, value: contactInfo.phoneLabel, href: whatsappUrl(), icon: <MessageCircle size={19} /> },
    { key: "linkedin", label: t.channels.linkedin, value: "in/wallyssonsousa", href: contactInfo.linkedin, icon: <Linkedin size={19} /> },
    { key: "github", label: t.channels.github, value: "WallyssonSousa", href: contactInfo.github, icon: <Github size={19} /> },
    { key: "instagram", label: t.channels.instagram, value: "@wallyssonsousa_", href: contactInfo.instagram, icon: <Instagram size={19} /> },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // Atalho de assunto: preenche a mensagem se ela estiver vazia ou ainda for outro modelo
  const pickTopic = (i: number) => {
    const next = topic === i ? null : i
    setTopic(next)
    const isTemplate = form.message.trim() === "" || t.topics.some((tp) => tp.template.trim() === form.message.trim())
    if (isTemplate) setForm((prev) => ({ ...prev, message: next === null ? "" : t.topics[next].template }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const topicLabel = topic !== null ? ` · ${t.topics[topic].label}` : ""
    const subject = `${t.subject}${topicLabel} · ${form.name}`
    const header = [`${t.greeting} ${form.name}`, ...(form.email ? [`Email: ${form.email}`] : [])]
    const body = [...header, "", form.message].join("\n")

    // WhatsApp abre já no clique (senão o bloqueador de pop-up barra); e-mail mostra as opções de envio
    if (channel === "whatsapp") window.open(whatsappUrl(body), "_blank", "noopener,noreferrer")
    setSent({ channel, subject, body })
    neuralBurst()
  }

  const reset = () => {
    setSent(null)
    setTopic(null)
    setForm({ name: "", email: "", message: "" })
  }

  return (
    <section id="contact" className="py-28">
      <h2 className="mb-3 text-center text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
        {t.title} <span className="bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] bg-clip-text text-transparent">{t.highlight}</span>
      </h2>
      <p className={`${reveal} mx-auto max-w-2xl text-center text-[#9aa4b2]`}>{t.intro}</p>

      <div className="mt-6 flex justify-center">
        <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs text-[#cdd6e3]">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="neuron-live absolute inset-0 rounded-full bg-[#7dd3fc]/60" />
            <span className="relative m-auto h-1.5 w-1.5 rounded-full bg-[#7dd3fc]" />
          </span>
          {t.location}
          <span className="text-white/20" aria-hidden>
            |
          </span>
          <LocalTime locale={locale} label={t.localTime} />
        </span>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Canais */}
        <div className="grid content-start gap-4 sm:grid-cols-2">
          {/* E-mail: canal principal, com as três formas de enviar */}
          <div className={`glass rounded-2xl p-6 sm:col-span-2 ${reveal}`}>
            <div className="flex items-center gap-4">
              <IconBadge>
                <Mail size={19} />
              </IconBadge>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{t.channels.email}</p>
                <p className="truncate text-sm text-[#9aa4b2]">{contactInfo.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => copy("email", contactInfo.email)} className={pill}>
                {copied === "email" ? <Check size={14} className="text-[#7dd3fc]" /> : <Copy size={14} />}
                {copied === "email" ? t.actions.copied : t.actions.copy}
              </button>
              <a href={gmailUrl()} target="_blank" rel="noreferrer" className={pill}>
                <ArrowUpRight size={14} />
                {t.actions.gmail}
              </a>
              <a href={mailtoUrl()} className={pill}>
                <Mail size={14} />
                {t.actions.mailApp}
              </a>
            </div>
          </div>

          {socials.map((s, i) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className={`glass group flex items-center gap-3 rounded-2xl p-4 hover:-translate-y-0.5 hover:border-[#3b82f6]/40 ${reveal}`}
              style={{ transitionDelay: `${(i + 1) * 60}ms` }}
            >
              <IconBadge>{s.icon}</IconBadge>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{s.label}</span>
                <span className="block truncate text-[13px] text-[#9aa4b2]">{s.value}</span>
              </span>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-[#9aa4b2] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7dd3fc]"
              />
            </a>
          ))}

          {/* Currículo */}
          <div className={`glass flex flex-wrap items-center gap-4 rounded-2xl p-5 sm:col-span-2 ${reveal}`}>
            <IconBadge>
              <FileText size={19} />
            </IconBadge>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">{t.channels.cv}</span>
              <span className="block text-sm text-[#9aa4b2]">{t.cvValue}</span>
            </span>
            <span className="flex gap-2">
              <Link href={localePath(locale, "/cv")} className={pill}>
                <FileText size={14} />
                {t.actions.view}
              </Link>
              <a href={cvPdfPath(locale)} download className={pill}>
                <Download size={14} />
                {t.actions.download}
              </a>
            </span>
          </div>
        </div>

        {/* Formulário */}
        <div className={`glass relative overflow-hidden rounded-2xl p-6 sm:p-8 ${reveal}`}>
          <h3 className="mb-6 text-lg font-semibold text-white">{t.formTitle}</h3>

          {sent ? (
            <div className="flex animate-[fadeUp_0.5s_ease_both] flex-col items-center py-6 text-center" role="status">
              <span className="relative mb-5 grid h-16 w-16 place-items-center">
                <span className="neuron-live absolute inset-0 rounded-full bg-gradient-to-br from-[#3b82f6]/40 to-[#7dd3fc]/40" />
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] text-[#061025]">
                  <Check size={26} strokeWidth={2.5} />
                </span>
              </span>
              <p className="text-xl font-bold text-white">{t.successTitle}</p>
              <p className="mt-2 max-w-sm text-sm text-[#9aa4b2]">{sent.channel === "email" ? t.successEmail : t.successWhatsapp}</p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {sent.channel === "email" ? (
                  <>
                    <a
                      href={gmailUrl(sent.subject, sent.body)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] px-4 py-2.5 text-sm font-bold text-[#061025]"
                    >
                      <ArrowUpRight size={16} />
                      {t.actions.gmail}
                    </a>
                    <a href={mailtoUrl(sent.subject, sent.body)} className={`${pill} px-4 py-2.5 text-sm`}>
                      <Mail size={15} />
                      {t.actions.mailApp}
                    </a>
                    <button type="button" onClick={() => copy("message", sent.body)} className={`${pill} px-4 py-2.5 text-sm`}>
                      {copied === "message" ? <Check size={15} className="text-[#7dd3fc]" /> : <Copy size={15} />}
                      {copied === "message" ? t.actions.copied : t.copyMessage}
                    </button>
                  </>
                ) : (
                  <a
                    href={whatsappUrl(sent.body)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] px-4 py-2.5 text-sm font-bold text-[#061025]"
                  >
                    <MessageCircle size={16} />
                    {t.openWhatsapp}
                  </a>
                )}
              </div>

              <button type="button" onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#9aa4b2] transition hover:text-white">
                <RotateCcw size={14} />
                {t.writeAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Canal: seletor segmentado com indicador deslizante */}
              <div>
                <p id="channel-label" className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#9aa4b2] uppercase">
                  {t.channelLabel}
                </p>
                <div role="radiogroup" aria-labelledby="channel-label" className="relative grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                  <span
                    aria-hidden
                    className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                      channel === "whatsapp" ? "translate-x-full" : ""
                    }`}
                  />
                  {(["email", "whatsapp"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={channel === c}
                      onClick={() => setChannel(c)}
                      className={`relative z-10 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                        channel === c ? "text-[#061025]" : "text-[#cdd6e3] hover:text-white"
                      }`}
                    >
                      {c === "email" ? <Mail size={15} /> : <MessageCircle size={15} />}
                      {t.channels[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Atalhos de assunto */}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#9aa4b2] uppercase">{t.topicLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {t.topics.map((tp, i) => (
                    <button
                      key={tp.label}
                      type="button"
                      aria-pressed={topic === i}
                      onClick={() => pickTopic(i)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        topic === i
                          ? "border-[#7dd3fc]/40 bg-[#3b82f6]/15 text-white"
                          : "border-white/10 bg-white/5 text-[#cdd6e3] hover:border-[#3b82f6]/40 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {tp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
                    {t.name}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t.namePlaceholder}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
                    {t.emailLabel}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required={channel === "email"}
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t.emailPlaceholder}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-white">
                  {t.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t.messagePlaceholder}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] px-6 py-3 font-bold text-[#061025] shadow-[0_8px_32px_rgba(59,130,246,0.18)]"
              >
                {channel === "email" ? <Mail size={17} /> : <Send size={17} />}
                {channel === "email" ? t.submitEmail : t.submitWhatsapp}
              </button>
            </form>
          )}

          {/* Anúncio para leitores de tela quando algo é copiado */}
          <span className="sr-only" aria-live="polite">
            {copied ? t.actions.copied : ""}
          </span>
        </div>
      </div>
    </section>
  )
}
