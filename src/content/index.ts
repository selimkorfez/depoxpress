import en, { type Dict } from './en'
import tr from './tr'
import type { Locale } from '@/lib/routes'

const dictionaries: Record<Locale, Dict> = { en, tr }

export function getDict(locale: Locale): Dict {
  return dictionaries[locale]
}

export type { Dict }
