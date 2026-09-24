// Tecnologias das órbitas (Tecnologias & Ferramentas), agrupadas por área.
// Também usadas pelo assistente e pelo currículo.
export interface Tech {
  name: string
  color: string
  shadowColor?: string
  // Ainda em estudo: não aparece na interface, mas evita que o assistente e o currículo
  // digam que ele "usa" algo que só está aprendendo
  studying?: boolean
}

export type OrbitId = "frontend" | "data" | "backend"

export interface OrbitCategory {
  id: OrbitId
  techs: Tech[]
  radiusRatio: number
  speed: number
  tilt: number
}

// Da órbita interna para a externa: a externa é a maior, então recebe o grupo com mais tecnologias
export const CATEGORIES: OrbitCategory[] = [
  {
    id: "frontend",
    techs: [
      { name: "TypeScript", color: "#3178C6", shadowColor: "rgba(49, 120, 198, 0.4)" },
      { name: "Angular", color: "#DD0031", shadowColor: "rgba(221, 0, 49, 0.4)" },
      { name: "Next.js", color: "#FFFFFF", shadowColor: "rgba(255, 255, 255, 0.3)" },
      { name: "React", color: "#61DAFB", shadowColor: "rgba(97, 218, 251, 0.4)" },
      { name: "Tailwind", color: "#38BDF8", shadowColor: "rgba(56, 189, 248, 0.4)" },
      { name: "Kotlin", color: "#A97BFF", shadowColor: "rgba(169, 123, 255, 0.4)", studying: true },
    ],
    radiusRatio: 0.35, // 35% do raio base
    speed: 0.0005,
    tilt: 0.6,
  },
  {
    id: "data",
    techs: [
      { name: "MySQL", color: "#00758F", shadowColor: "rgba(0, 117, 143, 0.45)" },
      { name: "PostgreSQL", color: "#336791", shadowColor: "rgba(51, 103, 145, 0.4)" },
      { name: "Redis", color: "#DC382D", shadowColor: "rgba(220, 56, 45, 0.4)" },
      { name: "MongoDB", color: "#47A248", shadowColor: "rgba(71, 162, 72, 0.4)", studying: true },
      { name: "Docker", color: "#2496ED", shadowColor: "rgba(36, 150, 237, 0.4)" },
      { name: "GitHub", color: "#E6EDF3", shadowColor: "rgba(230, 237, 243, 0.3)" },
      { name: "Postman", color: "#FF6C37", shadowColor: "rgba(255, 108, 55, 0.4)" },
    ],
    radiusRatio: 0.55, // 55% do raio base
    speed: 0.0004,
    tilt: 0.5,
  },
  {
    id: "backend",
    techs: [
      { name: "Node.js", color: "#5FA04E", shadowColor: "rgba(95, 160, 78, 0.4)" },
      { name: "Express", color: "#E6EDF3", shadowColor: "rgba(230, 237, 243, 0.3)" },
      { name: "NestJS", color: "#E0234E", shadowColor: "rgba(224, 35, 78, 0.4)" },
      { name: "Python", color: "#3776AB", shadowColor: "rgba(55, 118, 171, 0.4)" },
      { name: "Flask", color: "#FFFFFF", shadowColor: "rgba(255, 255, 255, 0.3)" },
      { name: "FastAPI", color: "#009688", shadowColor: "rgba(0, 150, 136, 0.4)", studying: true },
      { name: "Java", color: "#ED8B00", shadowColor: "rgba(237, 139, 0, 0.4)", studying: true },
      { name: "Spring Boot", color: "#6DB33F", shadowColor: "rgba(109, 179, 63, 0.4)", studying: true },
      { name: "Go", color: "#00ADD8", shadowColor: "rgba(0, 173, 216, 0.4)", studying: true },
    ],
    radiusRatio: 0.75, // 75% do raio base
    speed: 0.0003,
    tilt: 0.4,
  },
]

export const allTechs = CATEGORIES.flatMap((c) => c.techs)
