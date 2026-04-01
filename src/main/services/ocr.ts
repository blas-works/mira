import Tesseract from 'tesseract.js'

const VALID_LANGUAGES = new Set(['eng', 'spa'])

function validateLanguages(languages: string[]): string {
  for (const lang of languages) {
    if (!VALID_LANGUAGES.has(lang)) {
      throw new Error(`Invalid OCR language: ${lang}`)
    }
  }
  return languages.join('+')
}

export async function recognizeText(dataURL: string, languages: string[]): Promise<string> {
  const lang = validateLanguages(languages)

  const result = await Tesseract.recognize(dataURL, lang, {
    logger: () => {}
  })

  return result.data.text.trim()
}
