'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api-client';

type Carrier = { id: string; name: string; active: boolean };

export default function ShippingPage() {
  const { role } = useAuth();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<Carrier[]>('/shipping-carriers');
      setCarriers(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطأ فجلب شركات الشحن');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/shipping-carriers', { name });
      setName('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطأ فإضافة شركة الشحن');
    }
  }

  const canManageCarriers = role === 'owner'; // @Roles('owner') فـShippingController

  return (
    <ProtectedShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">شركات الشحن</h1>
        {canManageCarriers && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded"
          >
            {showForm ? 'إلغاء' : '+ شركة شحن'}
          </button>
        )}
      </div>

      {!canManageCarriers && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
          إضافة/تعديل شركات الشحن متاحة غير لمالك المتجر.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded p-4 mb-6 flex gap-3 items-end">
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">اسم الشركة</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ozonexpress"
              className="border border-gray-300 rounded px-2 py-1.5"
            />
          </label>
          <button type="submit" className="bg-gray-900 text-white text-sm px-4 py-2 rounded">
            حفظ
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">...جاري التحميل</p>
      ) : carriers.length === 0 ? (
        <p className="text-sm text-gray-500">مازال بلا شركات شحن مضافة</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {carriers.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded p-4">
              <div className="font-medium">{c.name}</div>
              <span className={`text-xs ${c.active ? 'text-green-600' : 'text-gray-400'}`}>
                {c.active ? 'مفعّلة' : 'معطّلة'}
              </span>
            </div>
          ))}
        </div>
      )}
    </ProtectedShell>
  );
}
