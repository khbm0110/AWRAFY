import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

// Server Component بلا 'use client' — SSR إجباري، انظر docs/04-seo-strategy.md
export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('home');

  return (
    <main>
      <h1>{t('title')}</h1>
      <Link href={`/${locale}/products`}>{t('cta')}</Link>
    </main>
  );
}

// مثال generateMetadata ديناميكية — نفس المنطق يتطبق على صفحات المنتج (seo_metadata table)
export async function generateMetadata() {
  return {
    title: 'awrafy — منصتك التجارية',
    description: 'متجر إلكتروني سريع، مفهرس فـGoogle من أول يوم.',
  };
}
