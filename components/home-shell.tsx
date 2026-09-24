"use client"

import { useState } from "react"
import Header from "@/components/header"

// Guarda apenas o estado do botão "Sair"; o conteúdo chega pronto do servidor via children.
export default function HomeShell({ children }: { children: React.ReactNode }) {
  const [hasExited, setHasExited] = useState(false)

  if (hasExited) return null

  return (
    <>
      <Header onExit={() => setHasExited(true)} />
      {children}
    </>
  )
}
