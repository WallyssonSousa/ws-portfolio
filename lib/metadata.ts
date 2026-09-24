import type { Metadata, Viewport } from "next"
import { getDictionary } from "@/content/dictionaries"
import { localePath, ogLocale, SITE_URL, type Locale } from "@/lib/i18n"

export const viewport: Viewport = {
  themeColor: "#0b1020",
  colorScheme: "dark",
}

// Metadados base de cada idioma. A imagem de compartilhamento vem do opengraph-image.tsx da rota.
export function rootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale).meta
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: "%s · Wallysson Sousa" },
    description: t.description,
    alternates: {
      canonical: localePath(locale),
      languages: { "pt-BR": "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Wallysson Sousa",
      locale: ogLocale[locale],
      alternateLocale: ogLocale[locale === "pt" ? "en" : "pt"],
      url: localePath(locale),
      title: t.title,
      description: t.description,
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  }
}

// Alternativas de idioma de uma página interna (ex.: "/projects/seller")
export function pageAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: { "pt-BR": localePath("pt", path), en: localePath("en", path) },
  }
}
