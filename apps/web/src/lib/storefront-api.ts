import { headers } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/**
 * Server-side fetch helper لـ`/storefront/*` endpoints — بلا JWT (زبون بلا حساب).
 *
 * ⚠️ حل تحديد الـtenant حاليا مؤقت للتطوير المحلي فقط:
 * - Production: الـAPI (`PublicTenantGuard`) خصها تحدد tenant من الدومين الحقيقي
 *   (Host header) — هذا كيحتاج بنية custom domains (DNS wildcard/CNAME لكل متجر)
 *   اللي مازال ماتبنات، انظر tasks/phase-1-core.md § Store Builder.
 * - Local dev: كنستعملو `STOREFRONT_TENANT_ID` env var مباشرة كـ`x-tenant-id`
 *   header (نفس dev fallback الموجود فـ`PublicTenantGuard`، معطل تلقائيا
 *   فـproduction). خصك تحط tenant ID حقيقي فـ.env بعد ما تخلق tenant تجريبي.
 */
function resolveTenantHeader(): Record<string, string> {
  const devTenantId = process.env.STOREFRONT_TENANT_ID;
  if (devTenantId) return { 'x-tenant-id': devTenantId };

  // Production path — كنعاودو نبعثو نفس الـHost اللي جا بيه الزبون
  const incomingHost = headers().get('host');
  return incomingHost ? { host: incomingHost } : {};
}

async function storefrontFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/storefront${path}`, {
      headers: resolveTenantHeader(),
      next: { revalidate: 60 }, // ISR — انظر docs/04-seo-strategy.md § Rendering
    } as RequestInit & { next: { revalidate: number } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null; // الـAPI مامتاحش (مثلا فـbuild time بلا سيرفر شغال) — بلا crash
  }
}

export type StorefrontProduct = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  slug: string;
  price: string;
  currency: string;
  status: string;
};

export type PaginatedProducts = {
  items: StorefrontProduct[];
  pagination: { page: number; totalPages: number; total: number };
};

export function getStorefrontProducts(page = 1) {
  return storefrontFetch<PaginatedProducts>(`/products?page=${page}&limit=20`);
}

export function getStorefrontProductBySlug(slug: string) {
  return storefrontFetch<StorefrontProduct>(`/products/${slug}`);
}
