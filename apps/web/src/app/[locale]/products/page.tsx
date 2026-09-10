import Link from 'next/link';
import { getStorefrontProducts } from '@/lib/storefront-api';
import { pickLocalized } from '@/lib/i18n-content';

// Server Component بلا 'use client' — SSR/ISR إجباري، انظر docs/04-seo-strategy.md
export default async function ProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const data = await getStorefrontProducts();

  if (!data || data.items.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-gray-500">لا كاين منتجات حاليا.</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">المنتجات</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {data.items.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/products/${product.slug}`}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <h2 className="font-medium mb-1">
              {pickLocalized(product.title, locale)}
            </h2>
            <p className="text-gray-600">
              {product.price} {product.currency}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export async function generateMetadata() {
  return {
    title: 'المنتجات — awrafy',
    description: 'تصفح كل المنتجات المتوفرة فالمتجر.',
  };
}
