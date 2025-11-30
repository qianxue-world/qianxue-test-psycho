import { createContext, useContext } from 'react'
import { Language, Translations } from './types'
import { zh } from './zh'
import { en } from './en'
import { ja } from './ja'

export type { Language, Translations }

export const translations: Record<Language, Translations> = {
  zh,
  en,
  ja,
}

export const languageNames: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
}

export const languageFlags: Record<Language, string> = {
  zh: '🇨🇳',
  en: '🇺🇸',
  ja: '🇯🇵',
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

export const I18nContext = createContext<I18nContextType>({
  language: 'zh',
  setLanguage: () => {},
  t: zh,
})

export const useI18n = () => useContext(I18nContext)
