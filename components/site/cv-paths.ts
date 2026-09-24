import type { Locale } from "@/lib/i18n"

// Caminho do PDF do currículo em cada idioma (arquivos em public/cv)
export const cvPdfPath = (locale: Locale) =>
  locale === "pt" ? "/cv/Wallysson-Sousa-Curriculo.pdf" : "/cv/Wallysson-Sousa-Resume.pdf"
