"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getDictionary } from "@/content/dictionaries"
import type { Locale } from "@/lib/i18n"

// Galeria com crossfade e navegação manual. Só a imagem atual e a próxima são montadas,
// então as demais não são baixadas antes da hora.
export default function ProjectGallery({ images, title, locale }: { images: string[]; title: string; locale: Locale }) {
  const t = getDictionary(locale).projectPage
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(2)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (images.length <= 1 || paused) return
    const interval = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), 5000)
    return () => clearInterval(interval)
  }, [images.length, paused])

  useEffect(() => {
    setMounted((m) => Math.max(m, current + 2))
  }, [current])

  const go = (i: number) => {
    setPaused(true)
    setCurrent((i + images.length) % images.length)
  }

  return (
    <figure className="glass overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] w-full bg-[#071024]">
        {images.slice(0, mounted).map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={t.screenAlt(i + 1, images.length, title)}
            fill
            sizes="(min-width: 1150px) 1100px, 100vw"
            priority={i === 0}
            className={`object-cover object-top transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <figcaption className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-[#9aa4b2]">
        <span>
          {t.screen} <span className="text-white">{current + 1}</span> {t.of} {images.length}
        </span>
        {images.length > 1 && (
          <span className="flex items-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={t.showScreen(i + 1)}
                aria-current={i === current}
                className="grid h-6 w-6 place-items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === current ? "w-5 bg-gradient-to-r from-[#3b82f6] to-[#7dd3fc]" : "w-1.5 bg-white/25"
                  }`}
                />
              </button>
            ))}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
