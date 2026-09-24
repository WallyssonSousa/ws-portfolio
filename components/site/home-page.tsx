import About from "@/components/about"
import Contact from "@/components/contact"
import Hero from "@/components/hero"
import HomeShell from "@/components/home-shell"
import Projects from "@/components/projects"
import TechStack from "@/components/stacks"
import { getDictionary } from "@/content/dictionaries"
import type { Locale } from "@/lib/i18n"

export default function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b1020] to-[#071024] text-[#e6eef8] overflow-x-hidden">
      <HomeShell locale={locale}>
        <main className="relative z-10 mx-auto max-w-[1100px] px-10">
          <Hero locale={locale} />
          <TechStack locale={locale} />
          <Projects locale={locale} />
          <About locale={locale} />
          <Contact locale={locale} />
          <footer className="py-10 text-center text-[#9aa4b2]">{t.footer}</footer>
        </main>
      </HomeShell>
    </div>
  )
}
