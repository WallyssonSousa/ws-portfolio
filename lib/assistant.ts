// Assistente local do portfólio: responde a partir dos dados do próprio site, sem API externa.
// Reconhece a intenção por palavras-chave (pt/en) e detecta tecnologias e projetos citados na pergunta.

import { allTechs, CATEGORIES } from "@/data/techs"
import { contactInfo, getTimeline } from "@/data/profile"
import { getProjects, type Project } from "@/data/projects"
import { localePath, type Locale } from "@/lib/i18n"

export type AssistantLink = { label: string; href: string }
export type AssistantAnswer = { text: string; links?: AssistantLink[]; suggestions?: string[] }

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.#+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

// Frase contém a palavra/expressão inteira (evita "ts" casar dentro de "projetos")
const has = (text: string, term: string) => new RegExp(`(^|[\\s-])${term.replace(/[.+#]/g, "\\$&")}($|[\\s?!.,-])`).test(text)

type Intent =
  | "greet"
  | "identity"
  | "job"
  | "education"
  | "complex"
  | "projects"
  | "contact"
  | "location"
  | "experience"
  | "backend"
  | "frontend"
  | "stack"
  | "cv"
  | "availability"

// Ordem = prioridade em caso de empate
const INTENTS: [Intent, string[]][] = [
  ["identity", ["voce e", "quem e voce", "o que voce e", "e uma ia", "chatgpt", "robo", "bot", "are you", "who are you", "what are you"]],
  ["cv", ["curriculo", "cv", "resume", "pdf"]],
  ["availability", ["disponivel", "disponibilidade", "freela", "freelance", "aberto a", "available", "availability", "open to"]],
  ["contact", ["contato", "contatar", "contratar", "email", "e-mail", "whatsapp", "telefone", "falar com", "linkedin", "contact", "reach", "hire", "phone", "talk to", "get in touch"]],
  ["complex", ["complexo", "dificil", "desafiador", "melhor projeto", "mais importante", "orgulho", "complex", "hardest", "best project", "challenging", "proud"]],
  ["job", ["trabalha", "trabalho", "emprego", "empresa", "cargo", "funcao", "atualmente", "l5", "work", "works", "job", "company", "currently", "role", "position", "employer"]],
  ["education", ["formacao", "faculdade", "curso", "estudou", "graduacao", "formado", "etec", "impacta", "tecnico", "education", "college", "degree", "studied", "university", "graduated"]],
  ["experience", ["experiencia", "anos", "senioridade", "nivel", "junior", "pleno", "experience", "years", "seniority", "level"]],
  ["location", ["onde mora", "mora", "cidade", "localizacao", "remoto", "where does he live", "location", "based", "remote", "city"]],
  ["backend", ["backend", "back-end", "back end", "api", "apis", "servidor", "server"]],
  ["frontend", ["frontend", "front-end", "front end", "interface", "interfaces", "ui"]],
  ["projects", ["projetos", "projeto", "portfolio", "construiu", "criou", "fez", "projects", "project", "built", "made"]],
  ["stack", ["stack", "tecnologias", "linguagens", "ferramentas", "sabe", "domina", "technologies", "languages", "tools", "skills", "know"]],
  ["greet", ["oi", "ola", "opa", "e ai", "bom dia", "boa tarde", "boa noite", "hello", "hi", "hey", "good morning"]],
]

// Nomes alternativos de tecnologias (todos normalizados) → nome canônico
const TECH_ALIASES: Record<string, string> = {
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express",
  "express.js": "Express",
  expressjs: "Express",
  mysql: "MySQL",
  redis: "Redis",
  docker: "Docker",
  angular: "Angular",
  github: "GitHub",
  git: "GitHub",
  postman: "Postman",
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  react: "React",
  tailwind: "Tailwind",
  nest: "NestJS",
  nestjs: "NestJS",
  "nest.js": "NestJS",
  python: "Python",
  flask: "Flask",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  java: "Java",
  spring: "Spring Boot",
  "spring boot": "Spring Boot",
  go: "Go",
  golang: "Go",
  fastapi: "FastAPI",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  kotlin: "Kotlin",
  typeorm: "TypeORM",
  sqlalchemy: "SQLAlchemy",
  jwt: "JWT",
  twilio: "Twilio",
  zod: "Zod",
  swagger: "Swagger",
  recharts: "Recharts",
  "react native": "React Native",
}

const PROJECT_ALIASES: Record<string, string> = {
  seller: "seller",
  "flow agenda": "flow-agenda",
  flow: "flow-agenda",
  agenda: "flow-agenda",
  "org academic": "org-academic",
  "org academica": "org-academic",
  org: "org-academic",
  "task manager": "task-manager",
  "to-do": "task-manager",
  todo: "task-manager",
  tarefas: "task-manager",
}

function detectTech(q: string) {
  // Expressões com duas palavras primeiro ("spring boot", "react native")
  const keys = Object.keys(TECH_ALIASES).sort((a, b) => b.length - a.length)
  for (const k of keys) if (has(q, k)) return TECH_ALIASES[k]
  return null
}

function detectProject(q: string, projects: Project[]) {
  const keys = Object.keys(PROJECT_ALIASES).sort((a, b) => b.length - a.length)
  for (const k of keys) if (has(q, k)) return projects.find((p) => p.slug === PROJECT_ALIASES[k]) ?? null
  return null
}

function detectIntent(q: string): Intent | null {
  let best: Intent | null = null
  let bestScore = 0
  for (const [intent, words] of INTENTS) {
    const score = words.reduce((n, w) => n + (has(q, w) ? w.split(" ").length : 0), 0)
    if (score > bestScore) {
      best = intent
      bestScore = score
    }
  }
  return best
}

// "Modelagem..." → "modelagem...", mas "APIs..." continua "APIs..."
const lowerFirst = (s: string) => (s[1] && s[1] === s[1].toLowerCase() ? s.charAt(0).toLowerCase() + s.slice(1) : s)

const list = (items: string[], locale: Locale) => {
  if (items.length <= 1) return items.join("")
  const and = locale === "pt" ? " e " : " and "
  return `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`
}

export function answer(question: string, locale: Locale): AssistantAnswer {
  const pt = locale === "pt"
  const q = normalize(question)
  const projects = getProjects(locale)
  const timeline = getTimeline(locale)
  const current = timeline.find((t) => t.current)!
  const education = timeline.filter((t) => t.kind === "education")
  const years = new Date().getFullYear() - contactInfo.codingSince
  const home = localePath(locale) === "/" ? "" : localePath(locale)
  const projectLink = (p: Project) => ({ label: p.title, href: localePath(locale, `/projects/${p.slug}`) })
  const contactLink = { label: pt ? "Ir para o contato" : "Go to contact", href: `${home}/#contact` }
  const cvLink = { label: pt ? "Ver currículo" : "See résumé", href: localePath(locale, "/cv") }

  const project = detectProject(q, projects)
  const tech = detectTech(q)
  const intent = detectIntent(q)

  // Projeto citado pelo nome
  if (project && intent !== "contact") {
    const cs = project.caseStudy
    return {
      text: pt
        ? `${project.title}: ${project.summary}\n\nDesafio: ${cs.challenge}\n\nPrincipais decisões: ${list(cs.decisions.map((d) => d.title.toLowerCase()), locale)}.\n\nStack: ${project.tags.join(", ")}.`
        : `${project.title}: ${project.summary}\n\nChallenge: ${cs.challenge}\n\nKey decisions: ${list(cs.decisions.map((d) => d.title.toLowerCase()), locale)}.\n\nStack: ${project.tags.join(", ")}.`,
      links: [projectLink(project), ...(project.live ? [{ label: pt ? "Ver no ar" : "See it live", href: project.live }] : [])],
    }
  }

  // Tecnologia citada: onde ela aparece (trabalho, projetos, estudos)
  if (tech && !["contact", "cv", "identity"].includes(intent ?? "")) {
    const atWork = current.tags?.includes(tech)
    const known = allTechs.find((t) => t.name === tech)
    const studying = known?.studying
    const area = CATEGORIES.find((c) => c.techs.some((t) => t.name === tech))
    const areaLabel = area
      ? { frontend: "front-end", data: pt ? "dados e DevOps" : "data and DevOps", backend: "back-end" }[area.id]
      : ""
    const inProjects = projects.filter(
      (p) => p.tags.includes(tech) || p.architecture.some((l) => l.nodes.some((n) => normalize(n).includes(normalize(tech)))),
    )
    const before = timeline.filter((t) => !t.current && t.kind === "work" && t.tags?.includes(tech))

    const parts: string[] = []
    if (atWork) parts.push(pt ? `usa ${tech} no dia a dia na ${current.place}` : `uses ${tech} day to day at ${current.place}`)
    if (inProjects.length)
      parts.push(pt ? `usou em ${list(inProjects.map((p) => p.title), locale)}` : `used it in ${list(inProjects.map((p) => p.title), locale)}`)
    if (before.length) parts.push(pt ? `trabalhou com ela na ${before[0].place}` : `worked with it at ${before[0].place}`)
    if (!parts.length && known && !studying)
      parts.push(pt ? `tem ${tech} na stack de ${areaLabel}` : `has ${tech} in his ${areaLabel} stack`)

    if (parts.length) {
      return {
        text: pt ? `Sim! Ele ${list(parts, locale)}.` : `Yes! He ${list(parts, locale)}.`,
        links: inProjects.slice(0, 2).map(projectLink),
      }
    }
    if (studying) {
      return {
        text: pt
          ? `${tech} está na lista de estudos dele: é uma das próximas tecnologias que ele está aprendendo, ainda sem projeto publicado.`
          : `${tech} is on his study list: one of the next technologies he's learning, with no published project yet.`,
      }
    }
    return {
      text: pt
        ? `Não encontrei ${tech} nos projetos, na experiência ou nos estudos dele. O foco hoje é Node.js, Express, MySQL, Redis, Docker e Angular no trabalho, e TypeScript, Next.js, NestJS e Python nos projetos.`
        : `I couldn't find ${tech} in his projects, experience or studies. His focus today is Node.js, Express, MySQL, Redis, Docker and Angular at work, and TypeScript, Next.js, NestJS and Python in projects.`,
    }
  }

  switch (intent) {
    case "identity":
      return {
        text: pt
          ? "Sou o assistente deste portfólio. Não sou uma IA generativa: rodo no seu navegador e respondo a partir dos dados do próprio site (projetos, trajetória e tecnologias)."
          : "I'm this portfolio's assistant. I'm not a generative AI: I run in your browser and answer from the site's own data (projects, journey and technologies).",
      }
    case "greet":
      return {
        text: pt
          ? "Olá! Posso contar sobre os projetos, a experiência na L5 Network, a formação ou as tecnologias do Wallysson. O que você quer saber?"
          : "Hi! I can tell you about Wallysson's projects, his experience at L5 Network, his education or his technologies. What would you like to know?",
      }
    case "job":
      return {
        text: pt
          ? `Hoje ele é ${current.title} na ${current.place} (${current.period}), atuando principalmente no back-end e também no front-end. No dia a dia: ${list((current.responsibilities ?? []).map(lowerFirst), locale)}.`
          : `He's currently a ${current.title} at ${current.place} (${current.period}), working mainly on the back-end and also on the front-end. Day to day: ${list((current.responsibilities ?? []).map(lowerFirst), locale)}.`,
        links: [{ label: pt ? "Ver trajetória" : "See journey", href: `${home}/#about` }],
      }
    case "education":
      return {
        text: education.map((e) => `${e.title} — ${e.place} (${e.period})`).join("\n"),
        links: [{ label: pt ? "Ver trajetória" : "See journey", href: `${home}/#about` }],
      }
    case "experience": {
      const work = timeline.filter((t) => t.kind === "work")
      return {
        text: pt
          ? `Ele programa desde ${contactInfo.codingSince} (${years} anos), começando na Etec. Profissionalmente: ${work.map((w) => `${w.title} na ${w.place} (${w.period})`).join("; ")}.`
          : `He's been coding since ${contactInfo.codingSince} (${years} years), starting at Etec. Professionally: ${work.map((w) => `${w.title} at ${w.place} (${w.period})`).join("; ")}.`,
      }
    }
    case "complex": {
      const flow = projects.find((p) => p.slug === "flow-agenda")!
      const task = projects.find((p) => p.slug === "task-manager")!
      return {
        text: pt
          ? `Os mais complexos são o ${flow.title} (multi-tenant em NestJS, com access e refresh token com rotação, Argon2 e rate limit) e o ${task.title} (back-end em arquitetura hexagonal, com domínio isolado do framework).`
          : `The most complex are ${flow.title} (multi-tenant NestJS, access and refresh tokens with rotation, Argon2 and rate limiting) and ${task.title} (hexagonal-architecture back-end with a framework-independent domain).`,
        links: [projectLink(flow), projectLink(task)],
      }
    }
    case "projects":
      return {
        text:
          (pt ? "Projetos em destaque:\n" : "Featured projects:\n") + projects.map((p) => `• ${p.title} — ${p.summary}`).join("\n"),
        links: projects.map(projectLink),
      }
    case "backend": {
      const back = projects.filter((p) => p.kind === "backend" || p.architecture.some((l) => /api|domin/i.test(l.label)))
      return {
        text: pt
          ? `O back-end é o foco dele: na ${current.place} trabalha com Node.js, Express, MySQL, Redis e Docker. Nos projetos, usa NestJS, Express, Flask, TypeORM, SQLAlchemy e PostgreSQL, com autenticação JWT e arquiteturas modular e hexagonal.`
          : `Back-end is his focus: at ${current.place} he works with Node.js, Express, MySQL, Redis and Docker. In projects he uses NestJS, Express, Flask, TypeORM, SQLAlchemy and PostgreSQL, with JWT auth and modular and hexagonal architectures.`,
        links: back.slice(0, 2).map(projectLink),
      }
    }
    case "frontend":
      return {
        text: pt
          ? `No front-end ele usa Angular no trabalho, na ${current.place}, e Next.js, React, TypeScript e Tailwind nos projetos (Seller, Org Academic e Task Manager).`
          : `On the front-end he uses Angular at work at ${current.place}, and Next.js, React, TypeScript and Tailwind in projects (Seller, Org Academic and Task Manager).`,
      }
    case "stack": {
      const byId = (id: string) => CATEGORIES.find((c) => c.id === id)!.techs.filter((t) => !t.studying).map((t) => t.name)
      const learning = allTechs.filter((t) => t.studying).map((t) => t.name)
      return {
        text: pt
          ? `Back-end: ${list(byId("backend"), locale)}.\nFront-end: ${list(byId("frontend"), locale)}.\nDados & DevOps: ${list(byId("data"), locale)}.\nEstudando: ${list(learning, locale)}.`
          : `Back-end: ${list(byId("backend"), locale)}.\nFront-end: ${list(byId("frontend"), locale)}.\nData & DevOps: ${list(byId("data"), locale)}.\nStudying: ${list(learning, locale)}.`,
        links: [{ label: pt ? "Ver tecnologias" : "See technologies", href: `${home}/#tech-stack` }],
      }
    }
    case "location":
      return {
        text: pt ? "Ele é de São Paulo, SP, Brasil." : "He's based in São Paulo, SP, Brazil.",
      }
    case "cv":
      return {
        text: pt
          ? "O currículo completo está disponível no site, com versão em PDF para baixar."
          : "The full résumé is on the site, with a PDF version to download.",
        links: [cvLink],
      }
    case "availability":
      return {
        text: pt
          ? `Hoje ele trabalha na ${current.place}. Para propostas e oportunidades, o melhor é falar direto com ele pelo e-mail ${contactInfo.email} ou pelo WhatsApp.`
          : `He currently works at ${current.place}. For proposals and opportunities, it's best to reach him directly at ${contactInfo.email} or on WhatsApp.`,
        links: [contactLink],
      }
    case "contact":
      return {
        text: pt
          ? `E-mail: ${contactInfo.email}\nWhatsApp: ${contactInfo.phoneLabel}\nLinkedIn: in/wallyssonsousa\nGitHub: WallyssonSousa`
          : `Email: ${contactInfo.email}\nWhatsApp: ${contactInfo.phoneLabel}\nLinkedIn: in/wallyssonsousa\nGitHub: WallyssonSousa`,
        links: [contactLink, { label: "LinkedIn", href: contactInfo.linkedin }],
      }
  }

  // Pergunta sobre alguma tecnologia que não está no portfólio ("conhece Rust?")
  if (/\b(sabe|conhece|usa|usou|trabalha com|domina|know|knows|use|used|work with)\b/.test(q)) {
    return {
      text: pt
        ? "Não encontrei essa tecnologia nos projetos, na experiência ou nos estudos dele. O foco hoje é Node.js, Express, MySQL, Redis, Docker e Angular no trabalho, e TypeScript, Next.js, NestJS e Python nos projetos."
        : "I couldn't find that technology in his projects, experience or studies. His focus today is Node.js, Express, MySQL, Redis, Docker and Angular at work, and TypeScript, Next.js, NestJS and Python in projects.",
      links: [{ label: pt ? "Ver tecnologias" : "See technologies", href: `${home}/#tech-stack` }],
    }
  }

  return {
    text: pt
      ? "Não tenho essa informação por aqui. Posso falar sobre projetos, tecnologias, experiência, formação ou contato."
      : "I don't have that information here. I can talk about projects, technologies, experience, education or contact.",
  }
}
