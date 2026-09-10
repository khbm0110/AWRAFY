import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * COD — طريقة الدفع الافتراضية فـPhase 1 (انظر docs/01-tech-stack.md).
   * بلا webhook (الدفع كيتم عند التسليم)، الحالة كتتبدل يدويا من `confirmed` لـ`paid` بعد التسليم.
   */
  async createCodPayment(tenantId: string, orderId: string) {
    const order = await this.ordersService.findOne(tenantId, orderId); // كيتأكد الملكية
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'cod',
        status: 'pending', // كيتبدل لـ'paid' يدويا بعد التسليم الفعلي
        amount: order.total,
        webhookVerified: false, // COD ماعندهاش webhook — القيمة هادي دايما false ليه
      },
    });
  }

  async findByOrder(tenantId: string, orderId: string) {
    await this.ordersService.findOne(tenantId, orderId); // تأكيد الملكية
    return this.prisma.payment.findMany({ where: { orderId } });
  }

  // ⚠️ TODO Phase 1: تكامل CMI حقيقي هنا — webhook verification إجبارية
  // (انظر docs/07-security-checklist.md § Payments) — ماشي مبني بعد،
  // فحاجز حاليا "CMI — العقد التجاري" ماتصلحش
}
