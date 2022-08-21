import * as deepl from 'deepl-node'
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node'
import logger from './logger'

export const Translator = new deepl.Translator(process.env.DEEPL_API_KEY!)

export const translateText = async (
  text: string,
  from: SourceLanguageCode | null,
  to: TargetLanguageCode
) => {
  try {
    const translatedText = await Translator.translateText(text, from, to)
    return translatedText.text
  } catch (error) {
    logger.error('Error while translating text', error)
    return null
  }
}
