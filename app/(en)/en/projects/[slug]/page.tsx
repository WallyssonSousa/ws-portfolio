import {
  projectMetadata,
  projectStaticParams,
  renderProject,
  type ProjectRouteProps,
} from "@/lib/project-route"

// Todas as páginas de projeto são geradas no build; slugs desconhecidos viram 404.
export const dynamicParams = false
export const generateStaticParams = projectStaticParams
export const generateMetadata = (props: ProjectRouteProps) => projectMetadata("en", props)

export default function Page(props: ProjectRouteProps) {
  return renderProject("en", props)
}
