"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const whatsappNumber = "5511997135477"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const text = `Olá, me chamo ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`

    // Abre ainda dentro do clique, senão bloqueadores de pop-up (Safari) barram a janela
    window.open(whatsappURL, "_blank", "noopener,noreferrer")

    setFormData({ name: "", email: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="contact" className="py-28">
      <h2 className="section-title mb-8 text-[22px] font-semibold">Contato</h2>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Coluna de informações de contato */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Vamos conversar?</h3>
            <p className="text-[#9aa4b2] mb-6">
              Estou sempre aberto a discutir novos projetos, oportunidades criativas ou parcerias.
            </p>
          </div>

          <div className="grid gap-4">
            {/* Email */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Email</h4>
                  <a
                    href="mailto:wallysson.dev@gmail.com"
                    className="text-[#9aa4b2] hover:text-white transition-colors duration-200 text-sm"
                  >
                    wallysson.dev@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Telefone */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Telefone</h4>
                  <a
                    href="tel:+5511997135477"
                    className="text-[#9aa4b2] hover:text-white transition-colors duration-200 text-sm"
                  >
                    +55 (11) 99713-5477
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            <a
              href="https://github.com/WallyssonSousa"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-white/[0.02] to-white/[0.01] border border-white/[0.05] text-[#9aa4b2] hover:text-white hover:border-white/10 transition-all duration-200 hover:-translate-y-[1px] text-sm"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/wallyssonsousa/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-white/[0.02] to-white/[0.01] border border-white/[0.05] text-[#9aa4b2] hover:text-white hover:border-white/10 transition-all duration-200 hover:-translate-y-[1px] text-sm"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Formulário */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] space-y-6">
              <h3 className="text-lg font-semibold text-white mb-6">Envie uma mensagem</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white placeholder-[#9aa4b2] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white placeholder-[#9aa4b2] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white placeholder-[#9aa4b2] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none"
                    placeholder="Conte-me sobre seu projeto..."
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar via WhatsApp
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
