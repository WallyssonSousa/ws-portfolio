"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

interface HeaderProps {
  onExit?: () => void; // ação do botão "Sair" (só existe na home)
}

const NAV_ITEMS = [
  { id: "home", label: "Início" },
  { id: "tech-stack", label: "Tecnologias" },
  { id: "projects", label: "Projetos" },
  { id: "about", label: "Sobre" },
  { id: "contact", label: "Contato" },
];

export default function Header({ onExit }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isHome = usePathname() === "/";

  // Na home a âncora rola a página; nas outras rotas volta para a home já na seção.
  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[linear-gradient(180deg,rgba(11,16,32,0.6),rgba(11,16,32,0.2))] backdrop-blur-md px-6 py-3">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between">
        {/* Logo e nome */}
        <Link href="/" className="brand flex items-center gap-3 font-semibold">
          <div className="logo flex h-11 w-11 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#06b6d4)] font-extrabold text-[#061025]">
            W
          </div>
          <div>
            <div className="text-[14px]">Wallysson Sousa</div>
            <div className="text-[12px] text-[#9aa4b2]">Dev Full Stack</div>
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
            className="absolute bottom-[-6px] left-0 h-[3px] w-0 rounded-md bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] opacity-0 pointer-events-none"
          />
        </nav>

        {/* Botão "Sair" */}
        {onExit ? (
          <button
            onClick={onExit}
            className="hidden md:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 hover:text-[#06b6d4]"
          >
            <LogOut size={16} />
            Sair
          </button>
        ) : (
          <div className="hidden md:block w-[76px]" aria-hidden />
        )}

        {/* Botão mobile menu */}
        <button
          className="md:hidden flex items-center justify-center p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            {onExit && (
              <li>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onExit();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
