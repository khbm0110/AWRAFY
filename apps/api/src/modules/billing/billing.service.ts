import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PLANS, PlanKey } from './plans';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * اشتراك جديد — تاجر وحد اشتراك فعّال وحد (`@unique tenant_id`).
   * Trial period يتحدد من `PLANS[planKey].trialDays` — انظر modules/billing/plans.ts.
   */
  async subscribe(tenantId: string, planKey: PlanKey) {
    // ملاحظة: tenantId هنا هو نفسو الحقل الفريد (@unique) — forTenant() كيزيدو
    // برضو بصح بلا تعارض (نفس القيمة). خصو يبقى مكتوب صراحة هنا لأن
    // TypeScript كيطلبو كـunique selector إجباري لـfindUnique/create.
    const existing = await this.prisma.forTenant(tenantId).subscription.findUnique({
      where: { tenantId },
    });
    if (existing) {
      throw new ConflictException('عندك اشتراك فعّال ديجا — استعمل تغيير الخطة بدل اشتراك جديد');
    }

    const plan = PLANS[planKey];
    const trialEndsAt = plan.trialDays
      ? new Date(Date.now() + plan.trialDays * DAY_MS)
      : null;

    // بلا trial: الاشتراك كيبدا active مباشرة (خطة Starter مجانية أصلا)
    const currentPeriodEnd = trialEndsAt ?? new Date(Date.now() + 30 * DAY_MS);

    return this.prisma.forTenant(tenantId).subscription.create({
      data: {
        tenantId,
        planKey,
        status: plan.trialDays ? 'trialing' : 'active',
        trialEndsAt,
        currentPeriodEnd,
      },
    });
  }

  async getCurrentSubscription(tenantId: string) {
    const subscription = await this.prisma.forTenant(tenantId).subscription.findUnique({
      where: { tenantId },
    });
    if (!subscription) throw new NotFoundException('بلا اشتراك فعّال');
    return { ...subscription, planDetails: PLANS[subscription.planKey as PlanKey] };
  }

  /**
   * Usage tracking أساسي — عدد حقيقي (count مباشر)، ماشي counter متراكم،
   * تفاديا لأي تعارض فالعد (undercounting/overcounting) بين الطلبات المتزامنة.
   */
  async checkUsageLimits(tenantId: string) {
    const subscription = await this.getCurrentSubscription(tenantId);
    const plan = subscription.planDetails;
    const db = this.prisma.forTenant(tenantId);

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [productsCount, ordersCount] = await Promise.all([
      db.product.count({}),
      db.order.count({ where: { createdAt: { gte: periodStart } } }),
    ]);

    return {
      products: { used: productsCount, limit: plan.maxProducts },
      ordersThisMonth: { used: ordersCount, limit: plan.maxOrdersPerMonth },
      withinLimits:
        productsCount <= plan.maxProducts && ordersCount <= plan.maxOrdersPerMonth,
    };
  }

  /**
   * ⚠️ TODO Phase 1: هاد الـmethod غادي يتنادى من BullMQ job دوري (شهريا)
   * بدل استدعاء يدوي — انظر docs/02-architecture.md § modules/notifications.
   * توليد PDF حقيقي مازال لا (pdfUrl فارغة حاليا).
   */
  async generateInvoice(tenantId: string) {
    const subscription = await this.prisma.forTenant(tenantId).subscription.findUnique({
      where: { tenantId },
    });
    if (!subscription) throw new NotFoundException('بلا اشتراك فعّال');

    const plan = PLANS[subscription.planKey as PlanKey];
    if (plan.priceMAD === 0) {
      throw new BadRequestException('خطة Starter مجانية — بلا فاتورة');
    }

    const periodStart = subscription.currentPeriodEnd;
    const periodEnd = new Date(periodStart.getTime() + 30 * DAY_MS);

    return this.prisma.forTenant(tenantId).platformInvoice.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        amount: plan.priceMAD,
        periodStart,
        periodEnd,
        pdfUrl: null, // ⚠️ TODO: توليد فعلي
      },
    });
  }

  async listInvoices(tenantId: string) {
    return this.prisma.forTenant(tenantId).platformInvoice.findMany({
      where: {},
      orderBy: { issuedAt: 'desc' },
    });
  }
}
