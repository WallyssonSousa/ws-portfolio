import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProjectPage from "@/components/site/project-page"
import { getProjects, projectSlugs } from "@/data/projects"
import type { Locale } from "@/lib/i18n"
import { pageAlternates } from "@/lib/metadata"

// Lógica compartilhada pelas rotas de projeto em português e inglês
export type ProjectRouteProps = { params: Promise<{ slug: string }> }

export const projectStaticParams = () => projectSlugs.map((slug) => ({ slug }))

export async function projectMetadata(locale: Locale, { params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjects(locale).find((p) => p.slug === slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.summary,
    alternates: pageAlternates(locale, `/projects/${slug}`),
    openGraph: { title: project.title, description: project.summary, type: "article" },
  }
}

export async function renderProject(locale: Locale, { params }: ProjectRouteProps) {
  const { slug } = await params
  const projects = getProjects(locale)
  const index = projects.findIndex((p) => p.slug === slug)
  if (index === -1) notFound()
  return <ProjectPage project={projects[index]} next={projects[(index + 1) % projects.length]} locale={locale} />
}
