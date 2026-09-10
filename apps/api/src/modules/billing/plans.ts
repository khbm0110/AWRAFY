/**
 * خطط الاشتراك — 2-3 خطط بحدود واضحة (انظر tasks/phase-1-core.md § SaaS Billing).
 * static config ماشي جدول DB — أبسط للـPhase 1، نبدلوها لجدول إذا احتجنا
 * تخصيص ديناميكي (خطط مخصصة لعملاء كبار) لاحقا.
 */
export const PLANS = {
  starter: {
    name: 'Starter',
    priceMAD: 0,
    maxProducts: 30,
    maxOrdersPerMonth: 100,
    trialDays: 0, // بلاش أصلا، بلا حاجة لـtrial
  },
  growth: {
    name: 'Growth',
    priceMAD: 199,
    maxProducts: 500,
    maxOrdersPerMonth: 2000,
    trialDays: 14,
  },
  pro: {
    name: 'Pro',
    priceMAD: 499,
    maxProducts: Infinity,
    maxOrdersPerMonth: Infinity,
    trialDays: 14,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function isValidPlanKey(key: string): key is PlanKey {
  return key in PLANS;
}
