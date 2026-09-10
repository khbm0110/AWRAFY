'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { api, ApiError } from '@/lib/api-client';

type Order = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  customer: { name: string | null; phone: string | null } | null;
};

type OrdersResponse = {
  items: Order[];
  pagination: { page: number; totalPages: number; total: number };
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'فالانتظار',
  confirmed: 'مؤكد',
  shipped: 'فالشحن',
  delivered: 'توصل',
  cancelled: 'ملغي',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<OrdersResponse>('/orders?limit=50')
      .then((res) => setOrders(res.items))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'خطأ فجلب الطلبات'),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedShell>
      <h1 className="text-xl font-bold mb-6 text-gray-900">الطلبات</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">...جاري التحميل</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">مازال بلا طلبات</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 rounded text-sm">
          <thead>
            <tr className="text-right text-gray-500 border-b border-gray-200">
              <th className="p-3 font-medium">الزبون</th>
              <th className="p-3 font-medium">المجموع</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 last:border-0">
                <td className="p-3">
                  {o.customer?.name ?? o.customer?.phone ?? '—'}
                </td>
                <td className="p-3">{o.total} MAD</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString('ar-MA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ProtectedShell>
  );
}
