import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders';
import { SendConfirmationDto } from './dto/send-confirmation.dto';

// حدود بسيطة لتعديل trust_score — heuristic أولية، خصها تتحسن بعد بيانات حقيقية
// انظر docs/03-database-schema.md § customers.trust_score
const TRUST_SCORE_DELTA = {
  confirmed: 0.05,
  no_response: -0.05,
  rejected: -0.1,
} as const;

@Injectable()
export class OrderConfirmationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * تأكيد الطلب قبل الشحن — ضروري لـCOD فالمغرب (انظر docs/03-database-schema.md).
   * كيخلق سجل confirmation بحالة pending، الرد الفعلي كيجي عبر recordResponse
   * (webhook من WhatsApp، رد SMS، أو نتيجة مكالمة يدوية).
   */
  async send(tenantId: string, dto: SendConfirmationDto) {
    const order = await this.ordersService.findOne(tenantId, dto.orderId);

    return this.prisma.orderConfirmation.create({
      data: { orderId: order.id, channel: dto.channel },
    });
  }

  /**
   * تسجيل رد الزبون — كيبدل حالة الطلب وtrust_score ديال العميل فنفس transaction.
   */
  async recordResponse(
    tenantId: string,
    confirmationId: string,
    status: 'confirmed' | 'no_response' | 'rejected',
  ) {
    const confirmation = await this.prisma.orderConfirmation.findFirst({
      where: { id: confirmationId, order: { tenantId } }, // tenant isolation عبر العلاقة
      include: { order: true },
    });
    if (!confirmation) throw new NotFoundException('Confirmation not found');

    const newOrderStatus = status === 'confirmed' ? 'confirmed' : 'cancelled';

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.orderConfirmation.update({
        where: { id: confirmationId },
        data: { status, confirmedAt: new Date() },
      });

      await tx.order.update({
        where: { id: confirmation.orderId },
        data: { status: status === 'no_response' ? confirmation.order.status : newOrderStatus },
      });

      if (confirmation.order.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: confirmation.order.customerId },
        });
        if (customer) {
          const delta = TRUST_SCORE_DELTA[status];
          const clamped = Math.min(
            1,
            Math.max(0, Number(customer.trustScore) + delta),
          );
          await tx.customer.update({
            where: { id: customer.id },
            data: { trustScore: clamped },
          });
        }
      }

      return updated;
    });
  }

  async findByOrder(tenantId: string, orderId: string) {
    await this.ordersService.findOne(tenantId, orderId);
    return this.prisma.orderConfirmation.findMany({ where: { orderId } });
  }
}
