'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { api } from '@/lib/api-client';

type Usage = {
  products: { used: number; limit: number };
  ordersThisMonth: { used: number; limit: number };
  withinLimits: boolean;
};

export default function DashboardHomePage() {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    api.get<Usage>('/billing/usage').then(setUsage).catch(() => {
      // بلا اشتراك فعّال — طبيعي لتاجر جديد، بلا حاجة نعرضو error مزعج
    });
  }, []);

  return (
    <ProtectedShell>
      <h1 className="text-xl font-bold mb-6 text-gray-900">لوحة التحكم</h1>

      {usage && (
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div className="bg-white p-4 rounded border border-gray-200">
            <div className="text-xs text-gray-500">المنتجات</div>
            <div className="text-lg font-bold mt-1">
              {usage.products.used}
              {Number.isFinite(usage.products.limit) && (
                <span className="text-gray-400 font-normal">
                  {' '}
                  / {usage.products.limit}
                </span>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <div className="text-xs text-gray-500">الطلبات هاد الشهر</div>
            <div className="text-lg font-bold mt-1">
              {usage.ordersThisMonth.used}
              {Number.isFinite(usage.ordersThisMonth.limit) && (
                <span className="text-gray-400 font-normal">
                  {' '}
                  / {usage.ordersThisMonth.limit}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedShell>
  );
}
