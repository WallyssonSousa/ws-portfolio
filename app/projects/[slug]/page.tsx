import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import ProjectGallery from "@/components/project-gallery"
import { projects } from "@/data/projects"

type Props = { params: Promise<{ slug: string }> }

// Todas as páginas de projeto são geradas no build; slugs desconhecidos viram 404.
export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return {}
  return { title: project.title, description: project.description }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) notFound()

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b1020] to-[#071024] text-[#e6eef8]">
      <Header />

      <main className="relative z-10 mx-auto max-w-[1150px] px-6 pt-24 pb-24">
        <div className="mb-8">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 py-2 text-sm text-[#cdd6e3] transition hover:text-white hover:border-white/20"
          >
            ← Voltar para projetos
          </Link>
        </div>

        <section className="opacity-0 translate-y-8 animate-[fadeUp_0.8s_ease_forwards] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_6px_30px_rgba(2,6,23,0.35)]">
            {project.images.length > 0 && <ProjectGallery images={project.images} title={project.title} />}

            {/* Conteúdo */}
            <div className="grid gap-10 p-12 md:grid-cols-[1fr_320px] sm:p-10">
              <div>
                <h1 className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text pb-1 text-2xl font-extrabold leading-tight text-transparent md:text-5xl">
                  {project.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-[#cdd6e3]/90 leading-relaxed">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.filter(Boolean).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#cdd6e3]"
                    >
                      {t}
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
                    className="rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-3 text-center font-semibold text-white/90 transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    Acessar Projeto
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-3 text-center font-semibold text-white/90 transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  >
                    Ver Código no GitHub
                  </a>
                )}
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
