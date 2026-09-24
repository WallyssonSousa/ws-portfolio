import type React from "react"
import Link from "next/link"
import { CheckCircle2, Target, Workflow } from "lucide-react"
import Header from "@/components/header"
import ArchDiagram from "@/components/arch-diagram"
import ProjectGallery from "@/components/project-gallery"
import ProjectStatus from "@/components/project-status"
import { getDictionary } from "@/content/dictionaries"
import type { Project } from "@/data/projects"
import { localePath, type Locale } from "@/lib/i18n"

const cardTitle = "mb-5 text-xs font-semibold tracking-[0.14em] text-[#9aa4b2] uppercase"

// Entrada aplicada em cada cartão (e não num contêiner): um ancestral animando opacity isolaria
// os cartões do que está atrás, e o vidro deixaria de desfocar a rede neural do fundo.
const enter =
  "translate-y-8 animate-[fadeUp_0.8s_ease_forwards] opacity-0 motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100"
const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

export default function ProjectPage({ project, next, locale }: { project: Project; next: Project; locale: Locale }) {
  const d = getDictionary(locale)
  const t = d.projectPage

  const facts = [
    { label: t.factLabels.kind, value: d.projects.kind[project.kind] },
    { label: t.factLabels.context, value: project.context },
    { label: t.factLabels.year, value: String(project.year) },
    { label: t.factLabels.architecture, value: project.pattern },
    { label: t.factLabels.layers, value: project.architecture.map((l) => l.label).join(" → ") },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b1020] to-[#071024] text-[#e6eef8]">
      <Header locale={locale} />

      <main className="relative z-10 mx-auto max-w-[1150px] px-6 pt-24 pb-24">
        <div className="mb-8">
          <Link
            href={`${localePath(locale) === "/" ? "" : localePath(locale)}/#projects`}
            className="glass inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[#cdd6e3] transition hover:border-white/20 hover:text-white"
          >
            {t.back}
          </Link>
        </div>

        {/* Cabeçalho + arquitetura viva */}
        <section className={`glass overflow-hidden rounded-2xl ${enter}`}>
          <div className="relative border-b border-white/10 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(100%_80%_at_100%_100%,rgba(125,211,252,0.16),transparent_60%)] px-4 py-6 sm:h-[340px] sm:py-4">
            <ArchDiagram layers={project.architecture} live label={t.architectureAria} />
          </div>

          <div className="grid gap-10 p-8 sm:p-10 md:grid-cols-[1fr_300px]">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#9aa4b2]">
                <ProjectStatus status={project.status} label={d.projects.status[project.status]} />
                <span>{project.year}</span>
                <span aria-hidden>·</span>
                <span>{d.projects.kind[project.kind]}</span>
                <span aria-hidden>·</span>
                <span>{project.context}</span>
              </div>
              <h1 className="bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] bg-clip-text pb-1 text-3xl leading-tight font-extrabold text-transparent md:text-5xl">
                {project.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#cdd6e3]/90">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#cdd6e3]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <aside className="flex flex-col gap-3">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="btn relative overflow-hidden rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] px-4 py-3 text-center font-bold text-[#061025] shadow-[0_8px_32px_rgba(59,130,246,0.18)]"
                >
                  {t.access}
                </a>
              )}
              {project.repos.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-3 text-center font-semibold text-white/90 transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                >
                  GitHub · {r.label}
                </a>
              ))}
            </aside>
          </div>
        </section>

        {/* Estudo de caso: desafio → decisões → resultado, como três neurônios ligados por uma sinapse */}
        <section className={`glass relative mt-6 overflow-hidden rounded-2xl p-7 sm:p-9 ${enter}`} style={delay(100)}>
          <h2 className={cardTitle}>{t.caseStudy}</h2>

          <div className="relative grid gap-8 md:grid-cols-[1fr_1.35fr_1fr] md:gap-6">
            {/* Sinapse horizontal (desktop) e vertical (celular) com um pulso percorrendo */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[19px] right-[8%] left-[8%] hidden h-px overflow-hidden bg-gradient-to-r from-[#3b82f6]/60 via-[#5cabf9]/40 to-[#7dd3fc]/60 md:block"
            >
              {/* Faixa com a largura da sinapse que desliza por transform (compositor); o pulso fica na ponta */}
              <span className="case-pulse absolute inset-0">
                <span className="absolute top-[-2px] right-0 h-[5px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#e6eef8] to-transparent" />
              </span>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute top-5 bottom-5 left-[19px] w-px bg-gradient-to-b from-[#3b82f6]/60 via-[#5cabf9]/40 to-[#7dd3fc]/60 md:hidden"
            />

            <CaseStep icon={<Target size={16} />} label={t.challenge}>
              <p className="text-sm leading-relaxed text-[#cdd6e3]">{project.caseStudy.challenge}</p>
            </CaseStep>

            <CaseStep icon={<Workflow size={16} />} label={t.decisions}>
              <ol className="space-y-4">
                {project.caseStudy.decisions.map((dec) => (
                  <li key={dec.title}>
                    <p className="text-sm font-semibold text-white">{dec.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#9aa4b2]">{dec.detail}</p>
                  </li>
                ))}
              </ol>
            </CaseStep>

            <CaseStep icon={<CheckCircle2 size={16} />} label={t.outcome}>
              <p className="text-sm leading-relaxed text-[#cdd6e3]">{project.caseStudy.outcome}</p>
            </CaseStep>
          </div>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <section className={`glass rounded-2xl p-7 ${enter}`} style={delay(160)}>
            <h2 className={cardTitle}>{t.highlights}</h2>
            <ol className="space-y-4">
              {project.highlights.map((h, i) => (
                <li key={h} className="flex gap-4">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] text-[11px] font-bold text-[#061025]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-[#cdd6e3]">{h}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={`glass rounded-2xl p-7 ${enter}`} style={delay(220)}>
            <h2 className={cardTitle}>{t.facts}</h2>
            <dl className="divide-y divide-white/5">
              {facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-6 py-2.5 text-sm first:pt-0 last:pb-0">
                  <dt className="text-[#9aa4b2]">{f.label}</dt>
                  <dd className="text-right text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {project.endpoints && (
          <section className={`glass mt-6 overflow-hidden rounded-2xl ${enter}`} style={delay(280)}>
            <h2 className={`${cardTitle} mb-0 flex items-center justify-between border-b border-white/10 px-7 py-5`}>
              {t.endpoints}
              <span className="font-normal tracking-normal normal-case">{t.endpointsCount(project.endpoints.length)}</span>
            </h2>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t.endpointsCaption(project.title)}</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">{t.method}</th>
                  <th scope="col">{t.route}</th>
                  <th scope="col">{t.description}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {project.endpoints.map((e) => (
                  <tr key={e.method + e.path} className="transition-colors hover:bg-white/[0.03]">
                    <td className="w-24 py-3 pl-7 align-top sm:align-middle">
                      <span className="rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-0.5 font-mono text-[11px] text-[#bfdbfe]">
                        {e.method}
                      </span>
                    </td>
                    <td className="py-3 pr-7 sm:pr-4">
                      <span className="font-mono text-[13px] break-all text-white sm:whitespace-nowrap">{e.path}</span>
                      {/* No celular a descrição desce para baixo da rota */}
                      <span className="mt-1 block text-[#9aa4b2] sm:hidden">{e.description}</span>
                    </td>
                    <td className="hidden py-3 pr-7 text-[#9aa4b2] sm:table-cell">{e.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {project.images && project.images.length > 0 && (
          <div className={`mt-6 ${enter}`} style={delay(280)}>
            <ProjectGallery images={project.images} title={project.title} locale={locale} />
          </div>
        )}

        <Link
          href={localePath(locale, `/projects/${next.slug}`)}
          className={`glass group mt-10 flex items-center justify-between rounded-2xl px-7 py-6 transition hover:border-white/20 ${enter}`}
          style={delay(360)}
        >
          <span className="text-sm text-[#9aa4b2]">{t.next}</span>
          <span className="flex items-center gap-3 text-xl font-bold">
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] bg-clip-text text-transparent">{next.title}</span>
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </Link>
      </main>
    </div>
  )
}

function CaseStep({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-14 md:pl-0">
      {/* Neurônio do passo */}
      <div className="absolute top-0 left-0 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7dd3fc] p-[2px] md:relative md:mb-4">
        <span className="grid h-full w-full place-items-center rounded-full bg-[#0b1020] text-[#93c5fd]">{icon}</span>
      </div>
      <p className="mb-3 text-sm font-semibold text-white">{label}</p>
      {children}
    </div>
  )
}
