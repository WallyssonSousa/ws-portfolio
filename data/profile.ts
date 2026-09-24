export type TimelineItem = {
  period: string
  title: string
  place: string
  kind: "trabalho" | "formação"
  current?: boolean
  details?: string
  tags?: string[]
}

// Mais recente primeiro
export const timeline: TimelineItem[] = [
  {
    period: "2025 — atual",
    title: "Desenvolvedor Backend",
    place: "L5 Network",
    kind: "trabalho",
    current: true,
    details:
      "Atuo principalmente no back-end, com APIs em Node.js e Express sobre MySQL, cache com Redis e ambientes em Docker. Também desenvolvo no front-end com Angular.",
    tags: ["Node.js", "Express", "MySQL", "Redis", "Docker", "Angular"],
  },
  {
    period: "2024 — 2026",
    title: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
    place: "Faculdade Impacta",
    kind: "formação",
    details:
      "Desenvolvimento web e mobile, APIs RESTful, bancos relacionais, microsserviços, arquiteturas MVC e hexagonal, Docker e metodologias ágeis.",
    tags: ["Full Stack", "Arquitetura Hexagonal", "Microsserviços", "Docker"],
  },
  {
    period: "2025",
    title: "Estagiário em Desenvolvimento de Software",
    place: "Soft Clever",
    kind: "trabalho",
    details:
      "Aplicações web para empresas de vendas e financeiro integradas ao ERP Sirius, apps de PDV com API local e web, e manutenção de sistemas legados no front e no back.",
    tags: ["Next.js", "TypeScript", "Express", "MySQL", "React Native", "Docker"],
  },
  {
    period: "2021 — 2023",
    title: "Técnico em Desenvolvimento de Sistemas",
    place: "Etec Jardim Paulistano",
    kind: "formação",
    details: "Primeiro contato com programação: lógica, algoritmos, desenvolvimento web e mobile, análise de sistemas e banco de dados.",
  },
]
