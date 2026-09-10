import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * كيلقى العميل بالتيليفون (المعرف الأساسي فالمغرب لـCOD)، ولا كيخلقو جديد.
   * كيستعملها modules/orders عند أول طلب.
   */
  async findOrCreate(
    tenantId: string,
    data: { phone: string; name?: string; email?: string },
  ) {
    const db = this.prisma.forTenant(tenantId);

    const existing = await db.customer.findFirst({
      where: { phone: data.phone }, // tenantId تزاد أوتوماتيك عبر forTenant
    });
    if (existing) return existing;

    return db.customer.create({ data });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.forTenant(tenantId).customer.findFirst({ where: { id } });
  }

  // Pagination إجبارية — انظر docs/08-code-quality-performance.md § Backend
  async findAll(tenantId: string, page = 1, limit = 20) {
    const db = this.prisma.forTenant(tenantId);

    const [items, total] = await this.prisma.$transaction([
      db.customer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      db.customer.count({}),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
