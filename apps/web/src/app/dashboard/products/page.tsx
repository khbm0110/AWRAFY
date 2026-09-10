'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { api, ApiError } from '@/lib/api-client';

type Product = {
  id: string;
  title: Record<string, string>;
  price: string;
  status: string;
  slug: string;
};

type ProductsResponse = {
  items: Product[];
  pagination: { page: number; totalPages: number; total: number };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await api.get<ProductsResponse>('/products?limit=50');
      setProducts(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطأ فجلب المنتجات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProtectedShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">المنتجات</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded"
        >
          {showForm ? 'إلغاء' : '+ منتج جديد'}
        </button>
      </div>

      {showForm && (
        <CreateProductForm
          onCreated={() => {
            setShowForm(false);
            loadProducts();
          }}
        />
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">...جاري التحميل</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">مازال بلا منتجات</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 rounded text-sm">
          <thead>
            <tr className="text-right text-gray-500 border-b border-gray-200">
              <th className="p-3 font-medium">الاسم</th>
              <th className="p-3 font-medium">السعر</th>
              <th className="p-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0">
                <td className="p-3">{p.title.ar ?? p.title.fr ?? p.title.en}</td>
                <td className="p-3">{p.price} MAD</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      p.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ProtectedShell>
  );
}

function CreateProductForm({ onCreated }: { onCreated: () => void }) {
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/products', {
        title: { ar: titleAr },
        slug,
        price: Number(price),
        status: 'active',
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطأ فإنشاء المنتج');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded p-4 mb-6 flex gap-3 items-end flex-wrap"
    >
      <label className="text-sm">
        <span className="block text-gray-600 mb-1">الاسم (عربي)</span>
        <input
          required
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-600 mb-1">Slug</span>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5"
          placeholder="mon-produit"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-600 mb-1">السعر (MAD)</span>
        <input
          required
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 w-28"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="bg-gray-900 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? '...' : 'حفظ'}
      </button>
      {error && <p className="text-sm text-red-600 w-full">{error}</p>}
    </form>
  );
}
