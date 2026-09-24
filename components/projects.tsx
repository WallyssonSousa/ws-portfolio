import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { projects, type Project } from "@/data/projects"

export default function Projects() {
  return (
    <section id="projects" className="py-28">
      <h2 className="mb-3 text-center text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
        Projetos em{" "}
        <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">Destaque</span>
      </h2>

      <div className="projects mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  )
}

// O brilho (--mouse-x/--mouse-y) e o tilt são controlados pelo PageEffects via [data-tilt].
function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="project-card section-fade group relative transform-gpu overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_6px_30px_rgba(2,6,23,0.35)] transition-all duration-500 opacity-0 translate-y-8 blur-[4px] hover:border-white/20"
      data-tilt
      aria-label={`Abrir projeto ${project.title}`}
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
              "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(139,92,246,0.12), transparent 40%)",
          }}
        />
      </div>

      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

        <Image
          src={project.cover || "/placeholder.png"}
          alt={`Capa do projeto ${project.title}`}
          fill
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
        />

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
        <h3 className="mb-2 text-lg font-semibold transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#b4bcc8] group-hover:to-[#b4bcc8] group-hover:bg-clip-text group-hover:text-transparent">
          {project.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#9aa4b2] transition-colors duration-300 group-hover:text-[#b4bcc8]">
          {project.description}
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

        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[rgba(139,92,246,0.12)] to-[rgba(139,92,246,0.12)] transition-all duration-500 group-hover:w-full" />
      </div>

      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/70 rounded-xl"
        aria-label={`Ver detalhes do projeto ${project.title}`}
      />

      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/5 transition-all duration-300 group-hover:ring-2 group-hover:ring-[#8b5cf6]/20" />
    </article>
  )
}
