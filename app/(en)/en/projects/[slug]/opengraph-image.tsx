import { projectSlugs } from "@/data/projects"
import { ogContentType, ogSize, projectOgImage } from "@/lib/og"

export const alt = "Wallysson Sousa · Project"
export const size = ogSize
export const contentType = ogContentType

export const generateStaticParams = () => projectSlugs.map((slug) => ({ slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return projectOgImage("en", slug)
}
