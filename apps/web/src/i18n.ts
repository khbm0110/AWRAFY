import { getRequestConfig } from 'next-intl/server';

// اللغات الرسمية — انظر docs/06-i18n-guidelines.md
export const locales = ['ar', 'fr', 'en'] as const;
export const defaultLocale = 'ar' as const;

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
