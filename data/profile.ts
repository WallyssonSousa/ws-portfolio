import type { Locale } from "@/lib/i18n"

export const contactInfo = {
  email: "wallysson.dev@gmail.com",
  whatsapp: "5511997135477",
  phoneLabel: "+55 (11) 99713-5477",
  github: "https://github.com/WallyssonSousa",
  linkedin: "https://www.linkedin.com/in/wallyssonsousa/",
  instagram: "https://www.instagram.com/wallyssonsousa_/",
  codingSince: 2021,
}

export type TimelineItem = {
  period: string
  title: string
  place: string
  kind: "work" | "education"
  current?: boolean
  details?: string
  responsibilities?: string[]
  tags?: string[]
}

type TimelineSource = {
  kind: TimelineItem["kind"]
  current?: boolean
  tags?: string[]
  copy: Record<Locale, Pick<TimelineItem, "period" | "title" | "place" | "details" | "responsibilities">>
}

// Mais recente primeiro
const timelineSource: TimelineSource[] = [
  {
    kind: "work",
    current: true,
    tags: ["Node.js", "Express", "MySQL", "Redis", "Docker", "Angular"],
    copy: {
      pt: {
        period: "2025 — atual",
        title: "Desenvolvedor Backend",
        place: "L5 Network",
        details:
          "Atuo principalmente no back-end, com APIs em Node.js e Express sobre MySQL, cache com Redis e ambientes em Docker. Também desenvolvo no front-end com Angular.",
        responsibilities: [
          "APIs REST em Node.js e Express",
          "Modelagem e consultas em MySQL, com cache em Redis",
          "Ambientes de desenvolvimento e deploy com Docker",
          "Telas e integrações no front-end com Angular",
        ],
      },
      en: {
        period: "2025 — present",
        title: "Backend Developer",
        place: "L5 Network",
        details:
          "I work mainly on the back-end, building APIs with Node.js and Express on top of MySQL, caching with Redis and running environments in Docker. I also work on the front-end with Angular.",
        responsibilities: [
          "REST APIs with Node.js and Express",
          "MySQL modeling and queries, with Redis caching",
          "Development and deployment environments with Docker",
          "Front-end screens and integrations with Angular",
        ],
      },
    },
  },
  {
    kind: "education",
    tags: ["Full Stack", "Arquitetura Hexagonal", "Microsserviços", "Docker"],
    copy: {
      pt: {
        period: "2024 — 2026",
        title: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
        place: "Faculdade Impacta",
        details:
          "Desenvolvimento web e mobile, APIs RESTful, bancos relacionais, microsserviços, arquiteturas MVC e hexagonal, Docker e metodologias ágeis.",
      },
      en: {
        period: "2024 — 2026",
        title: "Associate Degree in Systems Analysis and Development",
        place: "Faculdade Impacta",
        details:
          "Web and mobile development, RESTful APIs, relational databases, microservices, MVC and hexagonal architectures, Docker and agile methodologies.",
      },
    },
  },
  {
    kind: "work",
    tags: ["Next.js", "TypeScript", "JavaScript", "Express", "MySQL", "React Native", "Docker"],
    copy: {
      pt: {
        period: "2025",
        title: "Estagiário em Desenvolvimento de Software",
        place: "Soft Clever",
        details:
          "Aplicações web para empresas de vendas e financeiro integradas ao ERP Sirius, apps de PDV com API local e web, e manutenção de sistemas legados no front e no back.",
      },
      en: {
        period: "2025",
        title: "Software Development Intern",
        place: "Soft Clever",
        details:
          "Web applications for sales and finance companies integrated with the Sirius ERP, point-of-sale apps with local and web APIs, and maintenance of legacy systems on the front and back end.",
      },
    },
  },
  {
    kind: "education",
    copy: {
      pt: {
        period: "2021 — 2023",
        title: "Técnico em Desenvolvimento de Sistemas",
        place: "Etec Jardim Paulistano",
        details: "Primeiro contato com programação: lógica, algoritmos, desenvolvimento web e mobile, análise de sistemas e banco de dados.",
      },
      en: {
        period: "2021 — 2023",
        title: "Technical Degree in Systems Development",
        place: "Etec Jardim Paulistano",
        details: "My first contact with programming: logic, algorithms, web and mobile development, systems analysis and databases.",
      },
    },
  },
]

export function getTimeline(locale: Locale): TimelineItem[] {
  return timelineSource.map((s) => ({ kind: s.kind, current: s.current, tags: s.tags, ...s.copy[locale] }))
}
