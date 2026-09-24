import type React from "react"

import ArchDiagram from "@/components/arch-diagram"
import ProjectStatus from "@/components/project-status"
import Link from "next/link"
import { getProjects, type Project } from "@/data/projects"
import { getDictionary, type Dictionary } from "@/content/dictionaries"
import { localePath, type Locale } from "@/lib/i18n"

export default function Projects({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).projects
  return (
    <section id="projects" className="py-28">
      <h2 className="mb-3 text-center text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
        {t.title}{" "}
        <span className="bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] bg-clip-text text-transparent">{t.highlight}</span>
      </h2>

      <div className="projects mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {getProjects(locale).map((p) => (
          <ProjectCard key={p.slug} project={p} locale={locale} t={t} />
        ))}
      </div>
    </section>
  )
}

// O brilho (--mouse-x/--mouse-y) e o tilt são controlados pelo PageEffects via [data-tilt].
function ProjectCard({ project, locale, t }: { project: Project; locale: Locale; t: Dictionary["projects"] }) {
  return (
    <article
      className="project-card section-fade group relative transform-gpu glass overflow-hidden rounded-xl transition-all duration-500 opacity-0 translate-y-8 blur-[4px] hover:border-white/20"
      data-tilt
      aria-label={`${t.openAria} ${project.title}`}
      style={
        {
          "--mouse-x": "0px",
          "--mouse-y": "0px",
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-[-2px] rounded-xl opacity-50 blur-xl"
          style={{
            background:
              "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(59,130,246,0.12), transparent 40%)",
          }}
        />
      </div>

      <div className="relative h-64 overflow-hidden border-b border-white/5 sm:h-56">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#0b1020]/60 to-transparent" />

        {/* Capa: a arquitetura do projeto desenhada como uma rede neural */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(100%_80%_at_100%_100%,rgba(125,211,252,0.16),transparent_60%)]" />
        <div className="absolute inset-0 px-2 pt-6 pb-2 transition-transform duration-700 ease-out group-hover:scale-105">
          <ArchDiagram layers={project.architecture} />
        </div>

        <div className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        <div className="absolute inset-0 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full">
          <div className="h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm" />
        </div>
      </div>

      <div className="relative p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#9aa4b2]">
          <ProjectStatus status={project.status} label={t.status[project.status]} />
          <span>{project.year}</span>
          <span aria-hidden>·</span>
          <span>{t.kind[project.kind]}</span>
        </div>

        <h3 className="mb-2 text-lg font-semibold transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#b4bcc8] group-hover:to-[#b4bcc8] group-hover:bg-clip-text group-hover:text-transparent">
          {project.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#9aa4b2] transition-colors duration-300 group-hover:text-[#b4bcc8]">
          {project.summary}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <span
              key={tag}
              className="tag inline-flex items-center rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#9aa4b2] transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:text-[#b4bcc8]"
              style={{
                transitionDelay: `${i * 30}ms`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[rgba(59,130,246,0.12)] to-[rgba(59,130,246,0.12)] transition-all duration-500 group-hover:w-full" />
      </div>

      <Link
        href={localePath(locale, `/projects/${project.slug}`)}
        className="absolute inset-0 z-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/70 rounded-xl"
        aria-label={`${t.detailsAria} ${project.title}`}
      />

      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/5 transition-all duration-300 group-hover:ring-2 group-hover:ring-[#3b82f6]/20" />
    </article>
  )
}
