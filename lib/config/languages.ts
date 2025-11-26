/**
 * Central configuration for supported languages across the application
 * This is the single source of truth for all language-related functionality
 */

export interface Language {
  code: string
  label: string
  enabled: boolean
  displayOrder: number
}

/**
 * All supported languages in the system
 * Add new languages here and set enabled: true to make them available
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', label: 'English', enabled: true, displayOrder: 1 },
  { code: 'de', label: 'German', enabled: true, displayOrder: 2 },
  { code: 'fr', label: 'French', enabled: true, displayOrder: 3 },
  { code: 'es', label: 'Spanish', enabled: true, displayOrder: 4 },
  { code: 'pt', label: 'Portuguese', enabled: true, displayOrder: 5 },
  { code: 'ja', label: 'Japanese', enabled: true, displayOrder: 6 },
  { code: 'cn', label: 'Chinese', enabled: false, displayOrder: 7 },
]

/**
 * Get only enabled languages
 * Use this in dropdowns, filters, and queries
 */
export const ENABLED_LANGUAGES = SUPPORTED_LANGUAGES.filter(lang => lang.enabled)

/**
 * Get array of enabled language codes
 * Useful for database queries: WHERE language IN (...)
 */
export const ENABLED_LANGUAGE_CODES = ENABLED_LANGUAGES.map(lang => lang.code)

/**
 * Get language label by code
 */
export function getLanguageLabel(code: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
  return language?.label || code.toUpperCase()
}

/**
 * Check if a language code is enabled
 */
export function isLanguageEnabled(code: string): boolean {
  return ENABLED_LANGUAGE_CODES.includes(code)
}
