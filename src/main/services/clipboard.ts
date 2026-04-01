import { clipboard, nativeImage } from 'electron'

export function copyImageToClipboard(dataURL: string): void {
  const image = nativeImage.createFromDataURL(dataURL)
  clipboard.writeImage(image)
}

export function copyTextToClipboard(text: string): void {
  clipboard.writeText(text)
}
