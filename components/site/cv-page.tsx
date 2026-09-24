import Link from "next/link"
import { Download } from "lucide-react"
import Header from "@/components/header"
import { getDictionary } from "@/content/dictionaries"
import { contactInfo, getTimeline } from "@/data/profile"
import { getProjects } from "@/data/projects"
import { allTechs, CATEGORIES } from "@/data/techs"
import { localePath, SITE_URL, type Locale } from "@/lib/i18n"
import { cvPdfPath } from "@/components/site/cv-paths"

const sectionTitle =
  "mb-3 border-b border-slate-200 pb-1.5 text-[11px] font-bold tracking-[0.16em] text-blue-700 uppercase print:mb-2 print:pb-1"

// Currículo em formato de folha A4: na tela flutua sobre a rede neural; na impressão/PDF sai limpo.
// Todo o conteúdo vem dos mesmos dados do portfólio.
export default function CvPage({ locale }: { locale: Locale }) {
  const d = getDictionary(locale)
  const t = d.cv
  const timeline = getTimeline(locale)
  const work = timeline.filter((i) => i.kind === "work")
  const education = timeline.filter((i) => i.kind === "education")
  const projects = getProjects(locale)
  const site = SITE_URL.replace(/^https?:\/\//, "")
  const skills = (id: string) =>
    id === "study"
      ? allTechs.filter((x) => x.studying).map((x) => x.name)
      : CATEGORIES.find((c) => c.id === id)!.techs.filter((x) => !x.studying).map((x) => x.name)

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b1020] to-[#071024] text-[#e6eef8] print:bg-none print:bg-white">
      <div className="print:hidden">
        <Header locale={locale} />
      </div>

      <main className="relative z-10 mx-auto max-w-[860px] px-4 pt-24 pb-20 sm:px-6 print:max-w-none print:p-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={localePath(locale)}
            className="glass inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[#cdd6e3] transition hover:border-white/20 hover:text-white"
          >
            {t.back}
          </Link>
          <a
            href={cvPdfPath(locale)}
            download
            className="btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] px-5 py-2.5 text-sm font-bold text-[#061025] shadow-[0_8px_32px_rgba(59,130,246,0.18)]"
          >
            <Download size={16} />
            {t.download}
          </a>
        </div>

        <article className="rounded-xl bg-white px-8 py-10 text-[13px] leading-relaxed text-slate-700 shadow-[0_20px_80px_rgba(2,6,23,0.6)] sm:px-12 print:rounded-none print:px-0 print:py-0 print:text-[11.5px] print:leading-[1.45] print:shadow-none">
          <header className="mb-6 print:mb-4">
            <h1 className="text-[30px] leading-tight font-extrabold text-slate-900">Wallysson Sousa</h1>
            <p className="mt-1 text-[15px] font-semibold text-blue-700">
              {locale === "pt" ? "Desenvolvedor Backend · Full Stack" : "Backend Developer · Full Stack"}
            </p>
            <div className="mt-2 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc]" />
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-slate-500">
              <span>{t.location}</span>
              <span>·</span>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              <span>·</span>
              <span>{contactInfo.phoneLabel}</span>
              <span>·</span>
              <a href={contactInfo.linkedin}>linkedin.com/in/wallyssonsousa</a>
              <span>·</span>
              <a href={contactInfo.github}>github.com/WallyssonSousa</a>
              <span>·</span>
              <a href={SITE_URL}>{site}</a>
            </p>
          </header>

          <section className="mb-5 print:mb-3.5 break-inside-avoid">
            <h2 className={sectionTitle}>{t.summaryTitle}</h2>
            <p>{t.summary}</p>
          </section>

          <section className="mb-5 print:mb-3.5">
            <h2 className={sectionTitle}>{t.experience}</h2>
            <div className="space-y-4 print:space-y-2.5">
              {work.map((w) => (
                <div key={w.title + w.place} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="font-bold text-slate-900">
                      {w.title} <span className="font-semibold text-slate-500">· {w.place}</span>
                    </p>
                    <p className="text-[12px] text-slate-500">{w.period}</p>
                  </div>
                  {w.details && <p className="mt-1">{w.details}</p>}
                  {w.responsibilities && (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 marker:text-blue-500">
                      {w.responsibilities.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {w.tags && <p className="mt-1.5 text-[12px] text-slate-500">{w.tags.join(" · ")}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-5 print:mb-3.5">
            <h2 className={sectionTitle}>{t.projects}</h2>
            <div className="space-y-3 print:space-y-2">
              {projects.map((p) => (
                <div key={p.slug} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="font-bold text-slate-900">
                      {p.title}{" "}
                      <span className="font-semibold text-slate-500">
                        · {p.context} · {d.projects.status[p.status]}
                      </span>
                    </p>
                    <p className="text-[12px] text-slate-500">{p.year}</p>
                  </div>
                  <p className="mt-0.5">{p.summary}</p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {p.tags.join(" · ")}
                    {p.live && (
                      <>
                        {" · "}
                        <a href={p.live} className="text-blue-700 underline underline-offset-2">
                          {p.live.replace(/^https?:\/\//, "")}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-5 print:mb-3.5">
            <h2 className={sectionTitle}>{t.education}</h2>
            <div className="space-y-2.5">
              {education.map((e) => (
                <div key={e.title} className="flex flex-wrap items-baseline justify-between gap-x-4 break-inside-avoid">
                  <p className="font-bold text-slate-900">
                    {e.title} <span className="font-semibold text-slate-500">· {e.place}</span>
                  </p>
                  <p className="text-[12px] text-slate-500">{e.period}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="break-inside-avoid">
            <h2 className={sectionTitle}>{t.skills}</h2>
            <dl className="space-y-1">
              {(["backend", "frontend", "data", "study"] as const).map((id) => (
                <div key={id} className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-slate-900">{t.skillGroups[id]}:</dt>
                  <dd>{skills(id).join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>
      </main>
    </div>
  )
}
