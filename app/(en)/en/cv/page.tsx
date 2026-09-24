import type { Metadata } from "next"
import CvPage from "@/components/site/cv-page"
import { getDictionary } from "@/content/dictionaries"
import { pageAlternates } from "@/lib/metadata"

export const metadata: Metadata = {
  title: getDictionary("en").cv.title,
  alternates: pageAlternates("en", "/cv"),
}

export default function Page() {
  return <CvPage locale="en" />
}
