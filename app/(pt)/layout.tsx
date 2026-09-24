import type { Metadata } from "next"
import RootDocument from "@/components/site/root-document"
import { rootMetadata } from "@/lib/metadata"
import "../globals.css"

export { viewport } from "@/lib/metadata"

export const metadata: Metadata = rootMetadata("pt")

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument locale="pt">{children}</RootDocument>
}
