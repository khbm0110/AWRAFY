import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // /ar/... /fr/... /en/... — انظر docs/06-i18n-guidelines.md
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
