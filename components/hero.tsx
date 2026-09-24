import type React from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { getDictionary } from "@/content/dictionaries"
import { contactInfo } from "@/data/profile"
import { localePath, type Locale } from "@/lib/i18n"

// Quebra o texto em <span>s com atraso escalonado (animação em CSS, ver .word-in no globals.css)
function Words({ text, start, step }: { text: string; start: number; step: number }) {
  return text.split(" ").map((word, i) => (
    <span key={i}>
      <span className="word-in" style={{ "--d": `${start + i * step}ms` } as React.CSSProperties}>
        {word}
      </span>{" "}
    </span>
  ))
}

export default function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).hero
  const headlineWords = t.headline.split(" ").length

  return (
    <section id="home" className="hero relative isolate grid min-h-screen items-center px-6 pt-32">
      {/* Spotlight que segue o mouse; exibido e movido pelo PageEffects */}
      <div
        id="hero-spotlight"
        hidden
        aria-hidden
        className="absolute left-0 top-0 w-[520px] h-[520px] -ml-[260px] -mt-[260px] rounded-full pointer-events-none mix-blend-screen blur-[2px] opacity-60 -z-10"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent 70%)" }}
      />
      <div className="hero-inner mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-[1fr_420px]">
        <div className="relative">
          {/* Esmaece a rede neural atrás do texto (preso ao bloco, funciona em qualquer tela):
              a rede segue viva nas bordas e o título fica limpo. Abaixo do spotlight (-z-20). */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[18%] -inset-y-[35%] -z-20 bg-[radial-gradient(ellipse_at_center,rgba(11,16,32,0.94)_0%,rgba(11,16,32,0.78)_42%,rgba(11,16,32,0)_72%)]"
          />
          <h1 className="headline m-0 text-[clamp(28px,6vw,52px)] leading-[1.08] font-semibold tracking-[-0.02em]">
            <Words text={t.headline} start={100} step={30} />
            <span className="word-in" style={{ "--d": `${100 + headlineWords * 30}ms` } as React.CSSProperties}>
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] bg-clip-text text-transparent">{t.highlight}</span>.
            </span>
          </h1>

          <p className="sub mt-3 max-w-[540px] text-[15px] text-[#9aa4b2] sm:text-[16px]">
            <Words text={t.sub} start={300} step={15} />
          </p>

          <div className="ctas mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#projects"
              className="btn relative overflow-hidden rounded-xl border-0 bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] px-5 py-3 text-center font-bold text-[#061025] shadow-[0_8px_32px_rgba(59,130,246,0.12)]"
            >
              {t.ctaProjects}
            </a>
            <a
              className="btn ghost relative overflow-hidden rounded-xl border border-white/10 bg-transparent px-5 py-3 font-semibold text-[#9aa4b2] text-center"
              href="#contact"
            >
              {t.ctaContact}
            </a>
          </div>
        </div>

        <div>
          <div
            className="card-hero group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-6 backdrop-blur-xl transition-all hover:border-white/20"
            id="profile-card"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 via-transparent to-[#7dd3fc]/5 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] font-extrabold text-xl text-white">
                  WS
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Wallysson Sousa</div>
                  <div className="text-sm text-[#9aa4b2]">{t.role}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-[#cdd6e3]">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                  <span className="neuron-live absolute inset-0 rounded-full bg-[#7dd3fc]/60" />
                  <span className="relative m-auto h-1.5 w-1.5 rounded-full bg-[#7dd3fc]" />
                </span>
                <span>
                  {t.currentPrefix} <span className="font-semibold text-white">L5 Network</span>
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={contactInfo.github}
                    target="_blank"
                    rel="noreferrer"
                    className="chip inline-flex items-center justify-center rounded-full bg-white/5 px-4 py-2 text-sm text-[#9aa4b2] transition-all hover:bg-white/10 hover:text-white"
                  >
                    GitHub
                  </a>
                  <a
                    href={contactInfo.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="chip inline-flex items-center justify-center rounded-full bg-white/5 px-4 py-2 text-sm text-[#9aa4b2] transition-all hover:bg-white/10 hover:text-white"
                  >
                    LinkedIn
                  </a>
                  <Link
                    href={localePath(locale, "/cv")}
                    className="chip inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-sm text-[#9aa4b2] transition-all hover:bg-white/10 hover:text-white"
                  >
                    <FileText size={14} />
                    {t.cv}
                  </Link>
                </div>
                <a
                  href="#about"
                  className="group flex items-center gap-1 text-sm text-[#9aa4b2] transition-colors hover:text-white"
                >
                  {t.more}
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
