import { ProtectedShell } from './protected-shell';

/**
 * صفحة "قريبا" — للأقسام الموثقة فـdocs/09-admin-dashboard-structure.md
 * بصح بلا backend module مبني بعد. القاعدة: نبان بالبنية الكاملة، ماشي
 * نخفي القسم، باش التاجر يفهم الخريطة الكاملة ديال المنصة من البداية.
 */
export function ComingSoonPage({
  title,
  modules,
  description,
}: {
  title: string;
  modules: string[];
  description: string;
}) {
  return (
    <ProtectedShell>
      <div className="max-w-lg">
        <h1 className="text-xl font-bold mb-2 text-gray-900">{title}</h1>
        <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded mb-4">
          قريبا
        </span>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-xs text-gray-500 mb-2">Modules ديال هاد القسم (Phase لاحقة):</div>
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ProtectedShell>
  );
}
