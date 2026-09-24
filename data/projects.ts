import type { Locale } from "@/lib/i18n"

export type ArchLayer = {
  label: string
  nodes: string[]
}

export type Endpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  description?: string
}

export type CaseStudy = {
  challenge: string
  decisions: { title: string; detail: string }[]
  outcome: string
}

// Formato consumido pelos componentes: já no idioma pedido
export type Project = {
  slug: string
  title: string
  summary: string
  description: string
  kind: "fullstack" | "backend"
  context: string
  year: number
  status: "live" | "dev"
  architecture: ArchLayer[]
  pattern: string
  tags: string[]
  highlights: string[]
  caseStudy: CaseStudy
  endpoints?: Endpoint[]
  images?: string[]
  repos: { label: string; url: string }[]
  live?: string
}

type Copy = {
  summary: string
  description: string
  context: string
  pattern: string
  layers: string[] // rótulos das camadas, na mesma ordem de `architecture`
  highlights: string[]
  endpoints?: string[] // descrições, na mesma ordem de `endpoints`
  repos: string[] // rótulos, na mesma ordem de `repos`
  caseStudy: CaseStudy
}

type ProjectSource = {
  slug: string
  title: string
  kind: Project["kind"]
  year: number
  status: Project["status"]
  architecture: string[][] // nós de cada camada
  tags: string[]
  endpoints?: Omit<Endpoint, "description">[]
  images?: string[]
  repos: string[]
  live?: string
  copy: Record<Locale, Copy>
}

const sources: ProjectSource[] = [
  {
    slug: "seller",
    title: "Seller",
    kind: "fullstack",
    year: 2025,
    status: "live",
    architecture: [
      ["Next.js", "shadcn/ui"],
      ["Flask", "JWT", "Twilio SMS"],
      ["SQLAlchemy", "PostgreSQL"],
    ],
    tags: ["Next.js", "TypeScript", "Flask", "PostgreSQL", "JWT", "Twilio"],
    endpoints: [
      { method: "POST", path: "/auth/users" },
      { method: "POST", path: "/auth/users/verificar" },
      { method: "POST", path: "/auth/login" },
      { method: "GET", path: "/product" },
      { method: "POST", path: "/product" },
      { method: "PATCH", path: "/product/:id/inactivate" },
      { method: "GET", path: "/sale" },
      { method: "POST", path: "/sale" },
    ],
    repos: ["https://github.com/WallyssonSousa/seller", "https://github.com/WallyssonSousa/seller-frontend"],
    live: "https://seller-frontend-dusky.vercel.app",
    copy: {
      pt: {
        summary: "Plataforma de vendas com cadastro de lojistas por CNPJ, ativação por SMS, produtos e vendas.",
        description:
          "Sistema full stack de gestão para lojistas: o seller se cadastra com CNPJ, ativa a conta com um código enviado por SMS e passa a gerenciar produtos e vendas. Projeto da disciplina de Framework Full Stack da Impacta, com API em Flask e interface em Next.js.",
        context: "Faculdade · Impacta",
        pattern: "API REST + SPA",
        layers: ["interface", "api", "dados"],
        highlights: [
          "Ativação de conta por código via SMS (Twilio)",
          "Rotas que alteram dados protegidas por JWT (Flask-JWT-Extended)",
          "Produtos com inativação lógica e vendas com validação de status",
          "14 endpoints REST para sellers, produtos e vendas",
        ],
        endpoints: [
          "Cadastra seller (nome, CNPJ, e-mail, celular)",
          "Ativa a conta com o código recebido por SMS",
          "Autentica e devolve o token JWT",
          "Lista produtos",
          "Cria produto",
          "Inativa produto",
          "Lista vendas",
          "Registra venda",
        ],
        repos: ["API", "Front-end"],
        caseStudy: {
          challenge:
            "Lojistas precisavam de um cadastro confiável: validar a loja antes de liberar vendas e impedir que qualquer pessoa alterasse produtos e pedidos.",
          decisions: [
            {
              title: "Ativação por SMS",
              detail:
                "O cadastro exige CNPJ e celular, e a conta só fica ativa depois do código enviado via Twilio. Cadastros falsos são barrados logo na entrada.",
            },
            {
              title: "Token só onde altera dados",
              detail:
                "Criar, editar e inativar exigem JWT (Flask-JWT-Extended). A API continua simples de consumir e as operações sensíveis ficam protegidas.",
            },
            {
              title: "Inativar em vez de apagar",
              detail: "Produtos são inativados, não excluídos, preservando o histórico das vendas já registradas.",
            },
          ],
          outcome:
            "API com 14 endpoints consumida por um front em Next.js publicado na Vercel, entregue como projeto da disciplina de Framework Full Stack.",
        },
      },
      en: {
        summary: "Sales platform with merchant sign-up by company ID (CNPJ), SMS activation, products and sales.",
        description:
          "Full stack management system for merchants: the seller signs up with their company ID (CNPJ), activates the account with a code sent by SMS and then manages products and sales. Built for the Full Stack Framework course at Impacta, with a Flask API and a Next.js interface.",
        context: "College · Impacta",
        pattern: "REST API + SPA",
        layers: ["interface", "api", "data"],
        highlights: [
          "Account activation with an SMS code (Twilio)",
          "Data-changing routes protected by JWT (Flask-JWT-Extended)",
          "Soft-deleted products and status-validated sales",
          "14 REST endpoints for sellers, products and sales",
        ],
        endpoints: [
          "Registers a seller (name, CNPJ, email, phone)",
          "Activates the account with the SMS code",
          "Authenticates and returns the JWT",
          "Lists products",
          "Creates a product",
          "Deactivates a product",
          "Lists sales",
          "Records a sale",
        ],
        repos: ["API", "Front-end"],
        caseStudy: {
          challenge:
            "Merchants needed a trustworthy sign-up: validate the store before allowing sales and stop anyone from changing products and orders.",
          decisions: [
            {
              title: "SMS activation",
              detail:
                "Sign-up requires a company ID and phone number, and the account only becomes active after a code sent via Twilio, so fake sign-ups are stopped at the door.",
            },
            {
              title: "Tokens only where data changes",
              detail:
                "Creating, editing and deactivating require a JWT (Flask-JWT-Extended), keeping the API simple to consume while protecting sensitive operations.",
            },
            {
              title: "Deactivate instead of delete",
              detail: "Products are deactivated rather than deleted, preserving the history of recorded sales.",
            },
          ],
          outcome:
            "A 14-endpoint API consumed by a Next.js front-end deployed on Vercel, delivered as the Full Stack Framework course project.",
        },
      },
    },
  },
  {
    slug: "flow-agenda",
    title: "Flow Agenda",
    kind: "backend",
    year: 2026,
    status: "dev",
    architecture: [
      ["Swagger", "REST"],
      ["NestJS", "Passport JWT", "Throttler"],
      ["Tenants", "Roles"],
      ["TypeORM", "PostgreSQL"],
    ],
    tags: ["NestJS", "TypeScript", "TypeORM", "PostgreSQL", "Docker", "Swagger"],
    endpoints: [
      { method: "POST", path: "/api/v1/auth/register" },
      { method: "POST", path: "/api/v1/auth/login" },
      { method: "POST", path: "/api/v1/auth/refresh" },
      { method: "POST", path: "/api/v1/auth/logout" },
      { method: "GET", path: "/api/v1/auth/me" },
      { method: "POST", path: "/api/v1/auth/forgot-password" },
    ],
    repos: ["https://github.com/WallyssonSousa/flow-agenda"],
    copy: {
      pt: {
        summary: "API de agendamento multi-tenant em NestJS, com autenticação por access e refresh token com rotação.",
        description:
          "Back-end de uma plataforma SaaS de agendamento pensada para negócios como barbearias: cada cadastro cria um tenant com seu usuário dono. Construída em NestJS com TypeORM e PostgreSQL, migrations versionadas, seed de demonstração e documentação Swagger.",
        context: "Projeto pessoal",
        pattern: "Modular (NestJS) · multi-tenant",
        layers: ["cliente", "api", "domínio", "dados"],
        highlights: [
          "Multi-tenant: o registro cria o tenant e o usuário OWNER",
          "Access e refresh token com rotação automática e revogação no logout",
          "Senhas com Argon2, Helmet e rate limit (Throttler)",
          "Migrations versionadas, seed de demo e banco em Docker",
        ],
        endpoints: [
          "Cria tenant + usuário OWNER",
          "Retorna access + refresh token",
          "Renova tokens (rotação automática)",
          "Revoga o refresh token",
          "Dados do usuário autenticado",
          "Recuperação de senha",
        ],
        repos: ["Repositório"],
        caseStudy: {
          challenge:
            "Um SaaS de agendamento atende vários negócios ao mesmo tempo: os dados de uma barbearia não podem vazar para outra, e a sessão precisa ser segura sem obrigar o usuário a fazer login toda hora.",
          decisions: [
            {
              title: "Multi-tenant desde o registro",
              detail:
                "Cada cadastro cria um tenant e seu usuário OWNER; papéis (roles) e guards do NestJS controlam o que cada usuário acessa.",
            },
            {
              title: "Access + refresh token com rotação",
              detail:
                "O access token é curto e o refresh token é trocado a cada uso e revogado no logout: um token vazado perde a validade rápido.",
            },
            {
              title: "Defesa em camadas",
              detail: "Senhas com Argon2, headers com Helmet e rate limit (Throttler) contra força bruta no login.",
            },
            {
              title: "Banco reproduzível",
              detail: "Migrations versionadas, seed de demonstração e PostgreSQL em Docker: qualquer pessoa sobe o ambiente em minutos.",
            },
          ],
          outcome:
            "Base de autenticação e multi-tenancy pronta para os módulos de agenda, documentada no Swagger e reproduzível com Docker.",
        },
      },
      en: {
        summary: "Multi-tenant scheduling API in NestJS, with access and refresh token authentication with rotation.",
        description:
          "Back-end of a SaaS scheduling platform designed for businesses such as barbershops: each sign-up creates a tenant with its owner user. Built with NestJS, TypeORM and PostgreSQL, versioned migrations, a demo seed and Swagger docs.",
        context: "Personal project",
        pattern: "Modular (NestJS) · multi-tenant",
        layers: ["client", "api", "domain", "data"],
        highlights: [
          "Multi-tenant: sign-up creates the tenant and its OWNER user",
          "Access and refresh tokens with automatic rotation and logout revocation",
          "Argon2 passwords, Helmet and rate limiting (Throttler)",
          "Versioned migrations, demo seed and a Dockerized database",
        ],
        endpoints: [
          "Creates tenant + OWNER user",
          "Returns access + refresh token",
          "Renews tokens (automatic rotation)",
          "Revokes the refresh token",
          "Authenticated user data",
          "Password recovery",
        ],
        repos: ["Repository"],
        caseStudy: {
          challenge:
            "A scheduling SaaS serves many businesses at once: one barbershop's data can't leak to another, and sessions must be secure without forcing users to log in all the time.",
          decisions: [
            {
              title: "Multi-tenant from sign-up",
              detail: "Each sign-up creates a tenant and its OWNER user; NestJS roles and guards control what each user can reach.",
            },
            {
              title: "Access + refresh tokens with rotation",
              detail:
                "Short-lived access tokens, and refresh tokens swapped on every use and revoked on logout: a leaked token expires fast.",
            },
            {
              title: "Defense in layers",
              detail: "Argon2 password hashing, Helmet headers and rate limiting (Throttler) against brute-force logins.",
            },
            {
              title: "Reproducible database",
              detail: "Versioned migrations, a demo seed and PostgreSQL in Docker: anyone can spin up the environment in minutes.",
            },
          ],
          outcome:
            "An authentication and multi-tenancy foundation ready for the scheduling modules, documented in Swagger and reproducible with Docker.",
        },
      },
    },
  },
  {
    slug: "org-academic",
    title: "Org Academic",
    kind: "fullstack",
    year: 2025,
    status: "live",
    architecture: [
      ["Next.js", "Recharts"],
      ["React Hook Form", "Zod"],
      ["Flask"],
      ["SQLAlchemy"],
    ],
    tags: ["Next.js", "TypeScript", "Tailwind", "Recharts", "Python", "Flask"],
    images: [
      "/tela-de-login-org-academic.png",
      "/capa-org-academica.png",
      "/criar-resultado.png",
      "/historico-org-academic.png",
      "/analise-org-academic.png",
      "/contato-dev-org-academic.png",
    ],
    repos: ["https://github.com/WallyssonSousa/org_academica"],
    live: "https://org-academica.vercel.app",
    copy: {
      pt: {
        summary: "Registro de notas de provas, simulados e tarefas, com a evolução acompanhada em gráficos.",
        description:
          "Plataforma para estudantes organizarem a vida acadêmica: registrar notas de provas, simulados e tarefas, consultar o histórico e acompanhar a evolução em gráficos. Interface em Next.js e API em Python com Flask e SQLAlchemy.",
        context: "Projeto pessoal",
        pattern: "API REST + SPA",
        layers: ["interface", "validação", "api", "dados"],
        highlights: [
          "Gráficos de evolução do desempenho (Recharts)",
          "Formulários validados com React Hook Form + Zod",
          "Histórico de resultados e tela de análise",
          "Sessão autenticada via cookie",
        ],
        repos: ["Repositório"],
        caseStudy: {
          challenge:
            "Estudantes anotam notas de provas e simulados em lugares diferentes e não conseguem enxergar a própria evolução ao longo do tempo.",
          decisions: [
            {
              title: "Gráficos no centro",
              detail: "O histórico vira gráficos de evolução com Recharts: o aluno vê tendência, não só uma lista de números.",
            },
            {
              title: "Validação antes da API",
              detail: "React Hook Form + Zod validam cada resultado no formulário, evitando dados inconsistentes no banco.",
            },
            {
              title: "API separada em Python",
              detail: "Back-end em Flask com SQLAlchemy, independente da interface em Next.js e fácil de evoluir.",
            },
          ],
          outcome:
            "Plataforma no ar na Vercel com o fluxo completo: login, registro de resultados, histórico e análise de desempenho.",
        },
      },
      en: {
        summary: "Track exam, mock test and assignment grades, with progress shown in charts.",
        description:
          "A platform for students to organize their academic life: record grades from exams, mock tests and assignments, browse the history and follow their progress in charts. Next.js interface and a Python API with Flask and SQLAlchemy.",
        context: "Personal project",
        pattern: "REST API + SPA",
        layers: ["interface", "validation", "api", "data"],
        highlights: [
          "Performance progress charts (Recharts)",
          "Forms validated with React Hook Form + Zod",
          "Results history and analysis screen",
          "Cookie-based authenticated session",
        ],
        repos: ["Repository"],
        caseStudy: {
          challenge: "Students write down exam and mock test grades in different places and can't see how they're progressing over time.",
          decisions: [
            {
              title: "Charts at the center",
              detail: "The history becomes progress charts with Recharts: students see trends, not just a list of numbers.",
            },
            {
              title: "Validation before the API",
              detail: "React Hook Form + Zod validate each result in the form, keeping inconsistent data out of the database.",
            },
            {
              title: "A separate Python API",
              detail: "A Flask back-end with SQLAlchemy, independent from the Next.js interface and easy to evolve.",
            },
          ],
          outcome: "Live on Vercel with the full flow: login, recording results, history and performance analysis.",
        },
      },
    },
  },
  {
    slug: "task-manager",
    title: "Task Manager",
    kind: "fullstack",
    year: 2026,
    status: "dev",
    architecture: [
      ["Next.js", "shadcn/ui"],
      ["Express", "Zod"],
      ["Use cases", "Entities"],
      ["TypeORM", "PostgreSQL", "Nodemailer"],
    ],
    tags: ["Next.js", "Express", "TypeScript", "TypeORM", "PostgreSQL", "Zod"],
    repos: [
      "https://github.com/WallyssonSousa/advanced-to-do_list-backend",
      "https://github.com/WallyssonSousa/advanced_to-do_list-frontend",
    ],
    copy: {
      pt: {
        summary: "To-do avançado pensado como SaaS, com back-end em arquitetura hexagonal.",
        description:
          "Plataforma de gestão de tarefas pessoais e colaborativas, pensada para evoluir como SaaS. O back-end separa domínio, casos de uso, infraestrutura e adaptadores (arquitetura hexagonal) sobre Express, TypeORM e PostgreSQL. A interface é em Next.js.",
        context: "Projeto pessoal",
        pattern: "Arquitetura hexagonal",
        layers: ["interface", "adaptadores", "domínio", "infra"],
        highlights: [
          "Domínio independente de framework: entidades, value objects e contratos de repositório",
          "Camada de casos de uso separada do domínio (ex.: CreateTask, ShareList)",
          "Validação com Zod, logs estruturados com Pino, e-mails com Nodemailer",
          "Commits padronizados com Husky, commitlint e Commitizen",
        ],
        repos: ["API", "Front-end"],
        caseStudy: {
          challenge:
            "Um to-do que pretende virar SaaS (listas compartilhadas, tarefas recorrentes, integração com Google Calendar) precisa crescer sem que as regras de negócio fiquem presas ao framework.",
          decisions: [
            {
              title: "Arquitetura hexagonal",
              detail:
                "Entidades, value objects e contratos de repositório ficam isolados de Express e TypeORM: trocar banco ou framework não toca nas regras.",
            },
            {
              title: "Casos de uso explícitos",
              detail: "Cada ação do sistema é um caso de uso próprio, fácil de testar e de encontrar no código.",
            },
            {
              title: "Qualidade no fluxo",
              detail: "Zod na entrada, logs estruturados com Pino e commits padronizados com Husky, commitlint e Commitizen.",
            },
          ],
          outcome: "Uma base de back-end preparada para evoluir em módulos, ainda em desenvolvimento.",
        },
      },
      en: {
        summary: "An advanced to-do app designed as a SaaS, with a hexagonal-architecture back-end.",
        description:
          "A personal and collaborative task management platform designed to grow into a SaaS. The back-end separates domain, use cases, infrastructure and adapters (hexagonal architecture) on top of Express, TypeORM and PostgreSQL. The interface is built with Next.js.",
        context: "Personal project",
        pattern: "Hexagonal architecture",
        layers: ["interface", "adapters", "domain", "infra"],
        highlights: [
          "Framework-independent domain: entities, value objects and repository contracts",
          "Use-case layer separated from the domain (e.g. CreateTask, ShareList)",
          "Zod validation, structured logs with Pino, emails with Nodemailer",
          "Standardized commits with Husky, commitlint and Commitizen",
        ],
        repos: ["API", "Front-end"],
        caseStudy: {
          challenge:
            "A to-do app meant to become a SaaS (shared lists, recurring tasks, Google Calendar integration) has to grow without its business rules getting tied to the framework.",
          decisions: [
            {
              title: "Hexagonal architecture",
              detail:
                "Entities, value objects and repository contracts are isolated from Express and TypeORM: swapping the database or framework doesn't touch the rules.",
            },
            {
              title: "Explicit use cases",
              detail: "Every action in the system is its own use case, easy to test and to find in the code.",
            },
            {
              title: "Quality in the workflow",
              detail: "Zod at the edges, structured logs with Pino and standardized commits with Husky, commitlint and Commitizen.",
            },
          ],
          outcome: "A back-end foundation ready to grow in modules, still in development.",
        },
      },
    },
  },
]

export function getProjects(locale: Locale): Project[] {
  return sources.map((s) => {
    const c = s.copy[locale]
    return {
      slug: s.slug,
      title: s.title,
      summary: c.summary,
      description: c.description,
      kind: s.kind,
      context: c.context,
      year: s.year,
      status: s.status,
      architecture: s.architecture.map((nodes, i) => ({ label: c.layers[i], nodes })),
      pattern: c.pattern,
      tags: s.tags,
      highlights: c.highlights,
      caseStudy: c.caseStudy,
      endpoints: s.endpoints?.map((e, i) => ({ ...e, description: c.endpoints?.[i] })),
      images: s.images,
      repos: s.repos.map((url, i) => ({ url, label: c.repos[i] })),
      live: s.live,
    }
  })
}

export const projectSlugs = sources.map((s) => s.slug)
