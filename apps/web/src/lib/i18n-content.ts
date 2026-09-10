/**
 * كيختار النص بلغة الصفحة الحالية، مع fallback — انظر docs/06-i18n-guidelines.md
 * "الـfallback: إذا locale ناقص، نرجعو للغة الافتراضية ديال المتجر... ماشي نص فارغ"
 */
export function pickLocalized(
  content: Record<string, string> | null | undefined,
  locale: string,
  fallbackOrder: string[] = ['ar', 'fr', 'en'],
): string {
  if (!content) return '';
  if (content[locale]) return content[locale];
  for (const fb of fallbackOrder) {
    if (content[fb]) return content[fb];
  }
  return Object.values(content)[0] ?? '';
}
