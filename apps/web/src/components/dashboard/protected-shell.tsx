'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { NAV_ITEMS } from '@/lib/nav-config';

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/dashboard/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">...جاري التحميل</div>;
  }

  if (!isAuthenticated) {
    return null; // كيتوجه لصفحة login فـuseEffect
  }

  // Permissions أساسية: owner كيشوف كلشي، staff غير الأقسام المسموحة
  // انظر docs/09-admin-dashboard-structure.md § قواعد التصميم
  // ⚠️ هاد الفلترة حاليا بسيطة (ownerOnly boolean) — staff_permissions
  // الدقيقة (حسب قسم) موثقة بصح ماتبناتش بعد كـmodel/backend حقيقي
  const visibleItems = NAV_ITEMS.filter((item) => !item.ownerOnly || role === 'owner');

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white p-5 flex flex-col">
        <div className="font-bold text-lg mb-8">awrafy</div>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isComingSoon = item.status === 'coming-soon';
            const isActive = pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                aria-disabled={isComingSoon}
                className={`px-3 py-2 rounded text-sm flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-gray-800 font-medium'
                    : isComingSoon
                      ? 'text-gray-500'
                      : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                {isComingSoon && (
                  <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                    قريبا
                  </span>
                )}
              </a>
            );
          })}
        </nav>
        <div className="text-xs text-gray-500 mb-2">
          {role === 'owner' ? 'مالك المتجر' : role === 'staff' ? 'موظف' : role}
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-white text-right"
        >
          تسجيل الخروج
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
