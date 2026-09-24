import type { Project } from "@/data/projects"

// Status sempre com ícone + texto, nunca só cor
export default function ProjectStatus({ status, label }: { status: Project["status"]; label: string }) {
  const live = status === "live"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
        live ? "border-[#7dd3fc]/30 bg-[#7dd3fc]/10 text-[#7dd3fc]" : "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#bfdbfe]"
      }`}
    >
      <span aria-hidden>{live ? "●" : "◐"}</span>
      {label}
    </span>
  )
}
