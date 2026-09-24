import { homeOgImage, ogContentType, ogSize } from "@/lib/og"

export const alt = "Wallysson Sousa · Desenvolvedor Full Stack"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return homeOgImage("pt")
}
