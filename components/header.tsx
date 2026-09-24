"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Languages, Menu, X } from "lucide-react";
import { getDictionary } from "@/content/dictionaries";
import { localePath, switchLocalePath, type Locale } from "@/lib/i18n";

interface HeaderProps {
  locale: Locale;
  onExplore?: () => void; // entra no modo rede neural (só existe na home)
}

export default function Header({ locale, onExplore }: HeaderProps) {
  const t = getDictionary(locale).nav;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const home = localePath(locale);
  const isHome = pathname === home;

  const NAV_ITEMS = [
    { id: "home", label: t.home },
    { id: "tech-stack", label: t.stack },
    { id: "projects", label: t.projects },
    { id: "about", label: t.about },
    { id: "contact", label: t.contact },
  ];

  // Na home a âncora rola a página; nas outras rotas volta para a home já na seção.
  const hrefFor = (id: string) => (isHome ? `#${id}` : `${home === "/" ? "" : home}/#${id}`);
  const otherLocale: Locale = locale === "pt" ? "en" : "pt";
  const switchHref = switchLocalePath(pathname, otherLocale);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[linear-gradient(180deg,rgba(11,16,32,0.6),rgba(11,16,32,0.2))] backdrop-blur-md px-6 py-3">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between">
        {/* Logo e nome */}
        <Link href={home} className="brand flex items-center gap-3 font-semibold">
          <div className="logo flex h-11 w-11 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#3b82f6,#7dd3fc)] text-[15px] font-extrabold text-[#061025]">
            WS
          </div>
          <div>
            <div className="text-[14px]">Wallysson Sousa</div>
            <div className="text-[12px] text-[#9aa4b2]">{t.role}</div>
          </div>
        </Link>

        {/* Menu desktop */}
        <nav className="relative hidden md:block">
          <ul id="menu" className="relative flex list-none gap-[18px] p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.id} className="opacity-90 text-[14px]">
                <Link href={hrefFor(item.id)}>{item.label}</Link>
              </li>
            ))}
          </ul>
          {/* Sublinhado do item ativo, posicionado pelo PageEffects */}
          <div
            id="menu-underline"
            aria-hidden
            className="absolute bottom-[-6px] left-0 h-[3px] w-0 rounded-md bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc] opacity-0 pointer-events-none"
          />
        </nav>

        <div className="flex items-center gap-2">
          {/* Troca de idioma, mantendo a mesma página (layouts raiz diferentes: navegação completa) */}
          <a
            href={switchHref}
            hrefLang={otherLocale === "en" ? "en" : "pt-BR"}
            aria-label={t.switchLabel}
            title={t.switchLabel}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-[#cdd6e3] transition hover:border-[#3b82f6]/40 hover:bg-white/10 hover:text-white"
          >
            <Languages size={14} />
            {t.switchTo}
          </a>

          {/* Modo rede neural: o conteúdo se dissolve e a rede do fundo fica em primeiro plano */}
          {onExplore && (
            <button
              onClick={onExplore}
              title={t.exploreTitle}
              className="group hidden md:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:border-[#7dd3fc]/40 hover:bg-white/10 hover:text-[#7dd3fc]"
            >
              <BrainCircuit size={16} className="transition-transform duration-300 group-hover:scale-110" />
              {t.explore}
            </button>
          )}

          {/* Botão mobile menu */}
          <button
            className="md:hidden flex items-center justify-center p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? t.closeMenu : t.openMenu}
          aria-expanded={isOpen}
        >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden mt-3 rounded-lg border border-white/10 bg-[rgba(11,16,32,0.95)] backdrop-blur-lg">
          <ul className="flex flex-col gap-4 p-4 text-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={hrefFor(item.id)} onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            {onExplore && (
              <li>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onExplore();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  <BrainCircuit size={16} />
                  {t.explore}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
