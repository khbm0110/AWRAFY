import { notFound } from 'next/navigation';
import { getStorefrontProductBySlug } from '@/lib/storefront-api';
import { pickLocalized } from '@/lib/i18n-content';

type Props = {
  params: { locale: string; slug: string };
};

// Server Component بلا 'use client' — المحتوى (عنوان، سعر، وصف) خصو يكون
// موجود فـHTML الخام من أول response، بلا انتظار JavaScript.
// انظر docs/04-seo-strategy.md § القاعدة الذهبية
export default async function ProductPage({ params: { locale, slug } }: Props) {
  const product = await getStorefrontProductBySlug(slug);

  if (!product) notFound(); // 404 حقيقي server-side، بلا "loading skeleton" فارغ

  const title = pickLocalized(product.title, locale);
  const description = pickLocalized(product.description, locale);

  // JSON-LD Product schema — إجباري على كل صفحة منتج، انظر docs/04-seo-strategy.md § 4
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description || undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* JSON-LD — JSON.stringify هنا آمن (بلا user-generated HTML raw)، القيم
          كاملة strings/numbers من الـDB، بلا خطر XSS عبر هاد الـscript tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-gray-500 mb-6">
        {/* BreadcrumbList — إجباري برضو، انظر docs/04-seo-strategy.md § 4 */}
        <a href={`/${locale}`}>الرئيسية</a>
        {' / '}
        <a href={`/${locale}/products`}>المنتجات</a>
        {' / '}
        <span className="text-gray-900">{title}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <p className="text-xl text-gray-700 mb-6">
        {product.price} {product.currency}
      </p>
      {description && <p className="text-gray-600 leading-relaxed">{description}</p>}
    </main>
  );
}

// generateMetadata ديناميكية — من بيانات المنتج مباشرة، بلا fallback فارغ
// انظر docs/04-seo-strategy.md § 3 Meta Tags
export async function generateMetadata({ params: { locale, slug } }: Props) {
  const product = await getStorefrontProductBySlug(slug);
  if (!product) return {};

  const title = pickLocalized(product.title, locale);
  const description = pickLocalized(product.description, locale) || title;

  return {
    title: `${title} — awrafy`,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: {
      canonical: `/${locale}/products/${slug}`,
    },
  };
}
