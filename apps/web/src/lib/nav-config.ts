/**
 * بنية الـsidebar — مطابقة حرفيا لـ docs/09-admin-dashboard-structure.md.
 * القاعدة: أقسام Phase لاحقة (بلا backend module بعد) تبان "قريبا"،
 * ماشي مخفية — باش البنية العامة واضحة من البداية للتاجر.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: string; // emoji بسيط — يتبدل بـicon library حقيقية لاحقا
  status: 'active' | 'coming-soon';
  ownerOnly?: boolean; // انظر docs/09 § قواعد التصميم — Permissions
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'الرئيسية', icon: '📊', status: 'active' },
  { href: '/dashboard/orders', label: 'الطلبات', icon: '📦', status: 'active' },
  { href: '/dashboard/products', label: 'المنتجات', icon: '🛍️', status: 'active' },
  { href: '/dashboard/design', label: 'تصميم المتجر', icon: '🎨', status: 'coming-soon' },
  { href: '/dashboard/customers', label: 'العملاء', icon: '👥', status: 'active' },
  { href: '/dashboard/marketing', label: 'التسويق', icon: '📣', status: 'coming-soon' },
  { href: '/dashboard/shipping', label: 'الشحن', icon: '🚚', status: 'active' },
  { href: '/dashboard/billing', label: 'الدفع والفوترة', icon: '💳', status: 'active', ownerOnly: true },
  { href: '/dashboard/reviews', label: 'التقييمات', icon: '⭐', status: 'coming-soon' },
  { href: '/dashboard/analytics', label: 'التحليلات', icon: '📈', status: 'coming-soon' },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: '⚙️', status: 'active', ownerOnly: true },
  { href: '/dashboard/support', label: 'الدعم', icon: '🎧', status: 'coming-soon' },
];
