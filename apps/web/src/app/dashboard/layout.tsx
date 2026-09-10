// ⚠️ Dashboard بره من [locale] routing عمدا — هي أداة داخلية للتاجر، بلا
// متطلبات SSR/SEO (انظر docs/04-seo-strategy.md، اللي كيهم الـstorefront فقط).
// انظر docs/02-architecture.md § Store Builder "الفرق بين Editor وRenderer"
// — نفس المنطق يتطبق هنا: Dashboard = CSR بحرية كاملة.
import { AuthProvider } from '@/lib/auth-context';
import '../globals.css';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
