export type Project = {
  slug: string
  title: string
  description: string
  tags: string[]
  cover: string
  images: string[]
  repo?: string
  live?: string
}

export const projects: Project[] = [
  {
    slug: "org-academic",
    title: "Org Academic",
    description: "Plataforma para guardar notas de provas, simulados, e tarefas e etc. Além de acompanhar evolução através de gráficos.",
    tags: ["Next.js", "Typescript", "TailwindCSS", "Shadcn", "SQLAlchemy", "Python", "Flask"],
    cover: "/capa-org-academica.png",
    images: ["/tela-de-login-org-academic.png", "/capa-org-academica.png",
       "/criar-resultado.png", "/historico-org-academic.png", "/analise-org-academic.png", "/contato-dev-org-academic.png"],
    repo: "https://github.com/WallyssonSousa/org_academica.git",
    live: "https://org-academica.vercel.app/",
  },
]
