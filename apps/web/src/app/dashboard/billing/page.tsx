'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { api, ApiError } from '@/lib/api-client';

type Subscription = {
  planKey: string;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string;
  planDetails: { name: string; priceMAD: number };
};

type Usage = {
  products: { used: number; limit: number };
  ordersThisMonth: { used: number; limit: number };
  withinLimits: boolean;
};

const PLANS = [
  { key: 'starter', name: 'Starter', price: 0, features: ['30 منتج', '100 طلب/شهر'] },
  { key: 'growth', name: 'Growth', price: 199, features: ['500 منتج', '2000 طلب/شهر', '14 يوم تجربة'] },
  { key: 'pro', name: 'Pro', price: 499, features: ['بلا حدود', '14 يوم تجربة'] },
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  async function load() {
    try {
      const sub = await api.get<Subscription>('/billing/subscription');
      setSubscription(sub);
    } catch {
      setSubscription(null); // بلا اشتراك فعّال — طبيعي لتاجر جديد
    }
    try {
      const u = await api.get<Usage>('/billing/usage');
      setUsage(u);
    } catch {
      // بلا اشتراك = بلا usage بعد
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubscribe(planKey: string) {
    setSubscribing(planKey);
    setError(null);
    try {
      await api.post('/billing/subscribe', { planKey });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطأ فالاشتراك');
    } finally {
      setSubscribing(null);
    }
  }

  return (
    <ProtectedShell>
      <h1 className="text-xl font-bold mb-6 text-gray-900">الدفع والفوترة</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {subscription && (
        <div className="bg-white border border-gray-200 rounded p-4 mb-6">
          <div className="text-xs text-gray-500 mb-1">الخطة الحالية</div>
          <div className="text-lg font-bold">
            {subscription.planDetails.name} — {subscription.status}
          </div>
          {usage && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-gray-500">المنتجات</div>
                <div className="text-sm font-medium">
                  {usage.products.used} / {Number.isFinite(usage.products.limit) ? usage.products.limit : '∞'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">الطلبات هاد الشهر</div>
                <div className="text-sm font-medium">
                  {usage.ordersThisMonth.used} / {Number.isFinite(usage.ordersThisMonth.limit) ? usage.ordersThisMonth.limit : '∞'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!subscription && (
        <div className="grid grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.key} className="bg-white border border-gray-200 rounded p-5">
              <div className="font-bold mb-1">{plan.name}</div>
              <div className="text-2xl font-bold mb-3">
                {plan.price === 0 ? 'مجانا' : `${plan.price} MAD`}
                {plan.price > 0 && <span className="text-xs text-gray-400 font-normal">/شهر</span>}
              </div>
              <ul className="text-xs text-gray-600 mb-4 space-y-1">
                {plan.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={subscribing === plan.key}
                className="w-full bg-gray-900 text-white text-sm py-2 rounded disabled:opacity-50"
              >
                {subscribing === plan.key ? '...' : 'اختيار'}
              </button>
            </div>
          ))}
        </div>
      )}
    </ProtectedShell>
  );
}
