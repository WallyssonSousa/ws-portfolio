import type { Metadata, Viewport } from "next";
import PageEffects from "@/components/page-effects";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wallysson Sousa · Desenvolvedor Full Stack",
    template: "%s · Wallysson Sousa",
  },
  description:
    "Portfólio de Wallysson Sousa, desenvolvedor Full Stack. Interfaces e backends com foco em performance, design e escalabilidade.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Wallysson Sousa · Desenvolvedor Full Stack",
    description: "Interfaces e backends com foco em performance, design e escalabilidade.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {/* Depois do conteúdo para o canvas de fundo pintar sobre o gradiente da página e sob o <main> */}
        <PageEffects />
      </body>
    </html>
  );
}
