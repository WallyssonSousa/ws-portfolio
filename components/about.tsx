
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Calendar, GraduationCap, MapPin } from "lucide-react"

type AcademicItem = {
  title: string
  institution: string
  location?: string
  period: string
  details?: string
  highlights?: string[]
}

type PROFISSIONALItem = {
  role: string
  company: string
  location?: string
  period: string
  details?: string
  stack?: string[]
}

const ACADEMIC: AcademicItem[] = [
  {
    title: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
    institution: "Faculdade Impacta",
    location: "São Paulo, SP",
    period: "2024 — Em Andamento",
    details: "Tive aprendizado sólido em desenvolvimento web, mobile e banco de dados relacionais. Microserviços e boas práticas de engenharia de Software, além das práticas com arquitetura MVC e Hexagonal.",
    highlights: ["Desenvolvimento Web", "Desenvolvimento Full Stack", "APIs RESTful", "Banco de Dados Relacionais",
     "Microserviços", "Arquitetura Hexagonal", "Arquitetura MVC", "Engenharia de Software", "Desenvolvimento Mobile",
     "Docker", "Git e GitHub", "Metodologias Ágeis"],
  },
  {
    title: "Técnico em Desenvolvimento de Sistemas",
    institution: "Etec Jardim Paulistano",
    location: "São Paulo, SP",
    period: "2021 — 2023",
    details: "Meu primeiro contato com programação, tendo o conhecimento inicial e técnico em lógica de programação, algoritmos, desenvolvimento de sistemas, desenvolvimento mobile, análise de sistemas e banco de dados.",
    highlights: ["Lógica de Programação", "Banco de dados relacionais", "Desenvolvimento Web", "Desenvolvimento Mobile", "Análise de Sistemas", "Desenvolvimento de Sistemas"
     ],
  },
]

const PROFISSIONAL: PROFISSIONALItem[] = [
  {
    role: "Estagiário em Desenvolvimento de Software",
    company: "Soft Clever",
    location: "Presencial",
    period: "2025 - Atual",
    details: "Construção de aplicações web para empresas dos setores de vendas e financeiro. Aplicações que interagem com o ERP Sirius, da própria Soft Clever. Desenvolvimento de Aplicativos PDV, com integração de API local e web. Além de manutenção e melhora em aplicações legados, seja backend ou frontend.",
    stack: ["Next.js", "TypeScript", "MySQL", "Express", "Docker", "React Native", "Github", "Shadcn", "Figma", "Postman", "JavaScript", "Arquitetura MVC"],
  },
]

export default function About() {
  return (
    <section id="about" className="py-28">
      <h2 className="section-title mb-5 text-[22px]">Sobre mim</h2>
 
      <p className="section-fade m-0 max-w-3xl opacity-0 translate-y-8 blur-[4px] transition-all duration-700">
        Sou desenvolvedor com experiência em aplicações web, APIs e automação. Gosto de unir engenharia sólida com
        design e microinterações, mantendo performance e clareza como prioridades.
      </p>

      {/* Tabs para tópicos */}
      <div className="section-fade mt-8 opacity-0 translate-y-8 blur-[4px] transition-all duration-700">
        <Tabs defaultValue="academica" className="w-full">
          <TabsList className="flex w-full justify-start gap-2 rounded-xl bg-white/5 p-1.5">
            <TabsTrigger
              value="academica"
              className="text-white/80 hover:text-white data-[state=active]:text-gray-900 data-[state=active]:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.8))] data-[state=active]:border data-[state=active]:border-white/10 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
            >
              <GraduationCap className="mr-2 h-4 w-4 opacity-80" />
              Acadêmica
            </TabsTrigger>

            <TabsTrigger
              value="profissional"
              className="text-white/80 hover:text-white data-[state=active]:text-gray-900 data-[state=active]:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.8))] data-[state=active]:border data-[state=active]:border-white/10 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
            >
              <Briefcase className="mr-2 h-4 w-4 opacity-80" />
              Profissional
            </TabsTrigger>
          </TabsList>


          {/* Acadêmica */}
          <TabsContent value="academica" className="mt-6">
            <ul className="space-y-4">
              {ACADEMIC.map((item, i) => (
                <li
                  key={item.title + i}
                  className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5 shadow-[0_6px_30px_rgba(2,6,23,0.25)]"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[15px] font-semibold">
                        <GraduationCap className="h-4 w-4 opacity-80" />
                        {item.title}
                      </div>
                      <div className="mt-1 text-sm text-[#cdd6e3]">
                        {item.institution}
                        {item.location && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#9aa4b2]">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-[#cdd6e3]">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.period}
                    </div>
                  </div>

                  {(item.details || (item.highlights && item.highlights.length > 0)) && (
                    <Accordion type="single" collapsible className="mt-3">
                      <AccordionItem value="details">
                        <AccordionTrigger className="text-sm">Ver detalhes</AccordionTrigger>
                        <AccordionContent>
                          {item.details && <p className="text-sm text-[#cdd6e3]">{item.details}</p>}
                          {item.highlights && item.highlights.length > 0 && (
                            <ul className="mt-2 list-disc pl-5 text-sm text-[#cdd6e3]">
                              {item.highlights.map((h) => (
                                <li key={h}>{h}</li>
                              ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Profissional */}
          <TabsContent value="profissional" className="mt-6">
            <ul className="space-y-4">
              {PROFISSIONAL.map((item, i) => (
                <li
                  key={item.role + i}
                  className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5 shadow-[0_6px_30px_rgba(2,6,23,0.25)]"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[15px] font-semibold">
                        <Briefcase className="h-4 w-4 opacity-80" />
                        {item.role}
                      </div>
                      <div className="mt-1 text-sm text-[#cdd6e3]">
                        {item.company}
                        {item.location && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#9aa4b2]">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.location}
                          </span>
                        )}
                      </div>
                      {item.stack && item.stack.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.stack.map((s) => (
                            <span key={s} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#cdd6e3]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-[#cdd6e3]">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.period}
                    </div>
                  </div>

                  {item.details && (
                    <Accordion type="single" collapsible className="mt-3">
                      <AccordionItem value="details">
                        <AccordionTrigger className="text-sm">Principais responsabilidades</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-[#cdd6e3]">{item.details}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
