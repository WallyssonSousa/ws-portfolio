import type { Project } from "@/data/projects"

// Status sempre com ícone + texto, nunca só cor
export default function ProjectStatus({ status }: { status: Project["status"] }) {
  const live = status === "No ar"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
        live ? "border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#67e8f9]" : "border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#c4b5fd]"
      }`}
    >
      <span aria-hidden>{live ? "●" : "◐"}</span>
      {status}
    </span>
  )
}
