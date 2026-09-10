import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * كينقص المخزون بشكل آمن (atomic) — كيستعمل conditional update
   * (`WHERE stock >= quantity`) بدل read-then-write، باش يتفادى race condition
   * إذا جو 2 طلبات فنفس الوقت لآخر وحدة فالمخزون.
   *
   * ⚠️ كيتنادى من داخل transaction ديال orders.service.ts — كيقبل `tx` (نفس
   * الـtransaction client)، ماشي `this.prisma` — باش order + stock decrement
   * يكونو atomic سوا (إذا وحد فشل، الجوج كيترجعو).
   */
  async decrementForOrder(
    tx: Prisma.TransactionClient,
    variantId: string,
    quantity: number,
  ) {
    const result = await tx.productVariant.updateMany({
      where: { id: variantId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    if (result.count === 0) {
      throw new BadRequestException(
        `المخزون غير كافي للـvariant ${variantId}`,
      );
    }
  }

  /**
   * تعديل يدوي — حل جزئي لمشكل المحل الفيزيائي (offline_sale)، ماشي جزء من
   * تدفق الطلب أونلاين. انظر docs/03-database-schema.md § stock_adjustments.
   */
  async createAdjustment(
    tenantId: string,
    dto: CreateAdjustmentDto,
    actorId?: string,
  ) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: dto.variantId, product: { tenantId } }, // tenant isolation عبر العلاقة (بلا tenantId مباشر فـProductVariant)
    });
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.forTenant(tenantId).$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: { increment: dto.quantityChange } },
      });

      if (updated.stock < 0) {
        // كنرجعو للخلف — الـtransaction كتبطل الكل
        throw new BadRequestException('المخزون ما يقدرش يكون سالب');
      }

      await tx.stockAdjustment.create({
        data: {
          tenantId,
          variantId: dto.variantId,
          quantityChange: dto.quantityChange,
          reason: dto.reason,
          note: dto.note,
          actorId,
        },
      });

      return updated;
    });
  }

  async listAdjustments(tenantId: string, variantId?: string) {
    return this.prisma.forTenant(tenantId).stockAdjustment.findMany({
      where: variantId ? { variantId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}
