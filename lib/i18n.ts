export type Locale = "pt" | "en"

export const locales: Locale[] = ["pt", "en"]

export const htmlLang: Record<Locale, string> = { pt: "pt-BR", en: "en" }
export const ogLocale: Record<Locale, string> = { pt: "pt_BR", en: "en_US" }

// Português na raiz ("/"), inglês em "/en"
export function localePath(locale: Locale, path = "/") {
  if (locale === "pt") return path
  return path === "/" ? "/en" : `/en${path}`
}

// Caminho equivalente no outro idioma (troca de idioma mantendo a página)
export function switchLocalePath(pathname: string, to: Locale) {
  const base = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname
  return localePath(to, base)
}

export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt"
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wallysson-sousa.vercel.app"
