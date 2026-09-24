import { homeOgImage, ogContentType, ogSize } from "@/lib/og"

export const alt = "Wallysson Sousa · Full Stack Developer"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return homeOgImage("en")
}
