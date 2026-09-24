import type React from "react"
import Assistant from "@/components/assistant"
import PageEffects from "@/components/page-effects"
import { htmlLang, type Locale } from "@/lib/i18n"

// Documento raiz compartilhado pelos dois idiomas (cada idioma tem o seu layout raiz, para o <html lang> correto)
export default function RootDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={htmlLang[locale]}>
      <body>
        {children}
        {/* Depois do conteúdo para o canvas de fundo pintar sobre o gradiente da página e sob o <main> */}
        <PageEffects />
        <Assistant locale={locale} />
      </body>
    </html>
  )
}
