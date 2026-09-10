'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { api, ApiError } from '@/lib/api-client';

type Customer = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  trustScore: string;
};

type CustomersResponse = {
  items: Customer[];
  pagination: { page: number; totalPages: number; total: number };
};

function trustBadge(score: string) {
  const n = Number(score);
  if (n >= 0.8) return 'bg-green-100 text-green-700';
  if (n >= 0.5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CustomersResponse>('/customers?limit=50')
      .then((res) => setCustomers(res.items))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'خطأ فجلب العملاء'),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedShell>
      <h1 className="text-xl font-bold mb-6 text-gray-900">العملاء</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">...جاري التحميل</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-gray-500">مازال بلا عملاء</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 rounded text-sm">
          <thead>
            <tr className="text-right text-gray-500 border-b border-gray-200">
              <th className="p-3 font-medium">الاسم</th>
              <th className="p-3 font-medium">التيليفون</th>
              <th className="p-3 font-medium">Trust Score</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0">
                <td className="p-3">{c.name ?? '—'}</td>
                <td className="p-3" dir="ltr">{c.phone ?? '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${trustBadge(c.trustScore)}`}>
                    {c.trustScore}
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
