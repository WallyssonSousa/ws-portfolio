export type ArchLayer = {
  label: string
  nodes: string[]
}

export type Endpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  description?: string
}

export type Project = {
  slug: string
  title: string
  summary: string
  description: string
  kind: "Full Stack" | "Back-end"
  context: string
  year: number
  status: "No ar" | "Em desenvolvimento"
  architecture: ArchLayer[] // camadas da capa em diagrama, da entrada para os dados
  pattern: string
  tags: string[]
  highlights: string[]
  endpoints?: Endpoint[]
  images?: string[]
  repos: { label: string; url: string }[]
  live?: string
}

export const projects: Project[] = [
  {
    slug: "seller",
    title: "Seller",
    summary: "Plataforma de vendas com cadastro de lojistas por CNPJ, ativação por SMS, produtos e vendas.",
    description:
      "Sistema full stack de gestão para lojistas: o seller se cadastra com CNPJ, ativa a conta com um código enviado por SMS e passa a gerenciar produtos e vendas. Projeto da disciplina de Framework Full Stack da Impacta, com API em Flask e interface em Next.js.",
    kind: "Full Stack",
    context: "Faculdade · Impacta",
    year: 2025,
    status: "No ar",
    architecture: [
      { label: "interface", nodes: ["Next.js", "shadcn/ui"] },
      { label: "api", nodes: ["Flask", "JWT", "Twilio SMS"] },
      { label: "dados", nodes: ["SQLAlchemy", "PostgreSQL"] },
    ],
    pattern: "API REST + SPA",
    tags: ["Next.js", "TypeScript", "Flask", "PostgreSQL", "JWT", "Twilio"],
    highlights: [
      "Ativação de conta por código via SMS (Twilio)",
      "Rotas que alteram dados protegidas por JWT (Flask-JWT-Extended)",
      "Produtos com inativação lógica e vendas com validação de status",
      "14 endpoints REST para sellers, produtos e vendas",
    ],
    endpoints: [
      { method: "POST", path: "/auth/users", description: "Cadastra seller (nome, CNPJ, e-mail, celular)" },
      { method: "POST", path: "/auth/users/verificar", description: "Ativa a conta com o código recebido por SMS" },
      { method: "POST", path: "/auth/login", description: "Autentica e devolve o token JWT" },
      { method: "GET", path: "/product", description: "Lista produtos" },
      { method: "POST", path: "/product", description: "Cria produto" },
      { method: "PATCH", path: "/product/:id/inactivate", description: "Inativa produto" },
      { method: "GET", path: "/sale", description: "Lista vendas" },
      { method: "POST", path: "/sale", description: "Registra venda" },
    ],
    repos: [
      { label: "API", url: "https://github.com/WallyssonSousa/seller" },
      { label: "Front-end", url: "https://github.com/WallyssonSousa/seller-frontend" },
    ],
    live: "https://seller-frontend-dusky.vercel.app",
  },
  {
    slug: "flow-agenda",
    title: "Flow Agenda",
    summary: "API de agendamento multi-tenant em NestJS, com autenticação por access e refresh token com rotação.",
    description:
      "Back-end de uma plataforma SaaS de agendamento pensada para negócios como barbearias: cada cadastro cria um tenant com seu usuário dono. Construída em NestJS com TypeORM e PostgreSQL, migrations versionadas, seed de demonstração e documentação Swagger.",
    kind: "Back-end",
    context: "Projeto pessoal",
    year: 2026,
    status: "Em desenvolvimento",
    architecture: [
      { label: "cliente", nodes: ["Swagger", "REST"] },
      { label: "api", nodes: ["NestJS", "Passport JWT", "Throttler"] },
      { label: "domínio", nodes: ["Tenants", "Roles"] },
      { label: "dados", nodes: ["TypeORM", "PostgreSQL"] },
    ],
    pattern: "Modular (NestJS) · multi-tenant",
    tags: ["NestJS", "TypeScript", "TypeORM", "PostgreSQL", "Docker", "Swagger"],
    highlights: [
      "Multi-tenant: o registro cria o tenant e o usuário OWNER",
      "Access e refresh token com rotação automática e revogação no logout",
      "Senhas com Argon2, Helmet e rate limit (Throttler)",
      "Migrations versionadas, seed de demo e banco em Docker",
    ],
    endpoints: [
      { method: "POST", path: "/api/v1/auth/register", description: "Cria tenant + usuário OWNER" },
      { method: "POST", path: "/api/v1/auth/login", description: "Retorna access + refresh token" },
      { method: "POST", path: "/api/v1/auth/refresh", description: "Renova tokens (rotação automática)" },
      { method: "POST", path: "/api/v1/auth/logout", description: "Revoga o refresh token" },
      { method: "GET", path: "/api/v1/auth/me", description: "Dados do usuário autenticado" },
      { method: "POST", path: "/api/v1/auth/forgot-password", description: "Recuperação de senha" },
    ],
    repos: [{ label: "Repositório", url: "https://github.com/WallyssonSousa/flow-agenda" }],
  },
  {
    slug: "org-academic",
    title: "Org Academic",
    summary: "Registro de notas de provas, simulados e tarefas, com a evolução acompanhada em gráficos.",
    description:
      "Plataforma para estudantes organizarem a vida acadêmica: registrar notas de provas, simulados e tarefas, consultar o histórico e acompanhar a evolução em gráficos. Interface em Next.js e API em Python com Flask e SQLAlchemy.",
    kind: "Full Stack",
    context: "Projeto pessoal",
    year: 2025,
    status: "No ar",
    architecture: [
      { label: "interface", nodes: ["Next.js", "Recharts"] },
      { label: "validação", nodes: ["React Hook Form", "Zod"] },
      { label: "api", nodes: ["Flask"] },
      { label: "dados", nodes: ["SQLAlchemy"] },
    ],
    pattern: "API REST + SPA",
    tags: ["Next.js", "TypeScript", "Tailwind", "Recharts", "Python", "Flask"],
    highlights: [
      "Gráficos de evolução do desempenho (Recharts)",
      "Formulários validados com React Hook Form + Zod",
      "Histórico de resultados e tela de análise",
      "Sessão autenticada via cookie",
    ],
    images: [
      "/tela-de-login-org-academic.png",
      "/capa-org-academica.png",
      "/criar-resultado.png",
      "/historico-org-academic.png",
      "/analise-org-academic.png",
      "/contato-dev-org-academic.png",
    ],
    repos: [{ label: "Repositório", url: "https://github.com/WallyssonSousa/org_academica" }],
    live: "https://org-academica.vercel.app",
  },
  {
    slug: "task-manager",
    title: "Task Manager",
    summary: "To-do avançado pensado como SaaS, com back-end em arquitetura hexagonal.",
    description:
      "Plataforma de gestão de tarefas pessoais e colaborativas, pensada para evoluir como SaaS. O back-end separa domínio, casos de uso, infraestrutura e adaptadores (arquitetura hexagonal) sobre Express, TypeORM e PostgreSQL. A interface é em Next.js.",
    kind: "Full Stack",
    context: "Projeto pessoal",
    year: 2026,
    status: "Em desenvolvimento",
    architecture: [
      { label: "interface", nodes: ["Next.js", "shadcn/ui"] },
      { label: "adaptadores", nodes: ["Express", "Zod"] },
      { label: "domínio", nodes: ["Use cases", "Entities"] },
      { label: "infra", nodes: ["TypeORM", "PostgreSQL", "Nodemailer"] },
    ],
    pattern: "Arquitetura hexagonal",
    tags: ["Next.js", "Express", "TypeScript", "TypeORM", "PostgreSQL", "Zod"],
    highlights: [
      "Domínio independente de framework: entidades, value objects e contratos de repositório",
      "Camada de casos de uso separada do domínio (ex.: CreateTask, ShareList)",
      "Validação com Zod, logs estruturados com Pino, e-mails com Nodemailer",
      "Commits padronizados com Husky, commitlint e Commitizen",
    ],
    repos: [
      { label: "API", url: "https://github.com/WallyssonSousa/advanced-to-do_list-backend" },
      { label: "Front-end", url: "https://github.com/WallyssonSousa/advanced_to-do_list-frontend" },
    ],
  },
]
