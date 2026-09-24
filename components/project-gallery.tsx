"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Galeria com crossfade: as imagens ficam empilhadas e só a opacidade muda.
// Só a atual e a próxima são montadas, então as demais não são baixadas antes da hora.
export default function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(2)

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), 6000)
    return () => clearInterval(interval)
  }, [images.length])

  useEffect(() => {
    setMounted((m) => Math.max(m, current + 2))
  }, [current])

  return (
    <div className="relative overflow-hidden rounded-t-2xl border-b border-white/10 bg-white/[0.02]">
      <div className="relative h-[360px] md:h-[420px] w-full">
        {images.slice(0, mounted).map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`Imagem ${i + 1} do projeto ${title}`}
            fill
            sizes="(min-width: 1150px) 1100px, 100vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
      </div>
    </div>
  )
}
