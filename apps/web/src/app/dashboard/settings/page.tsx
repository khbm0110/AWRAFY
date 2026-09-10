'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ProtectedShell } from '@/components/dashboard/protected-shell';
import { api, ApiError } from '@/lib/api-client';

type Store = {
  id: string;
  name: string;
  defaultLocale: string;
  supportedLocales: string[];
};

export default function SettingsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [name, setName] = useState('');
  const [defaultLocale, setDefaultLocale] = useState('ar');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Store>('/stores/me')
      .then((s) => {
        setStore(s);
        setName(s.name);
        setDefaultLocale(s.defaultLocale);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'خطأ فجلب إعدادات المتجر'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.patch('/stores/me', { name, defaultLocale });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'خطأ فحفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  }

  if (!store) {
    return (
      <ProtectedShell>
        <p className="text-sm text-gray-500">...جاري التحميل</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </ProtectedShell>
    );
  }

  return (
    <ProtectedShell>
      <h1 className="text-xl font-bold mb-6 text-gray-900">إعدادات المتجر</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded p-5 max-w-md space-y-4">
        <label className="block text-sm">
          <span className="block text-gray-600 mb-1">اسم المتجر</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="block text-gray-600 mb-1">اللغة الافتراضية</span>
          <select
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">تحفظت الإعدادات ✓</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? '...' : 'حفظ'}
        </button>
      </form>
    </ProtectedShell>
  );
}
