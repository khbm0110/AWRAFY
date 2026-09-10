import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomersService } from '../customers';
import { InventoryService } from '../inventory';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * إنشاء طلب — القواعد الإجبارية (انظر docs/03-database-schema.md وdocs/07-security-checklist.md):
   * 1. idempotency_key: retry بلا تكرار الطلب
   * 2. السعر يتحسب من الـDB (products.price)، بلا ثقة فـsعر جاي من الـclient
   * 3. tenant isolation عبر forTenant() — انظر prisma.service.ts
   * 4. order + stock decrement فنفس الـtransaction — إذا المخزون ناقص، الطلب
   *    كامل كيترجع للخلف (بلا "order أنشأ بصح المخزون مانقصش")
   */
  async create(tenantId: string, dto: CreateOrderDto) {
    const db = this.prisma.forTenant(tenantId);

    // خطوة 1: idempotency — إذا الطلب تكرر بنفس المفتاح *لنفس التاجر*، رجع
    // الطلب الموجود بدل خلق واحد جديد. ⚠️ tenantId هنا إجباري فالفحص —
    // بلاها، تصادم نادر بين تاجرين مختلفين (client كيولد نفس المفتاح
    // بالصدفة) يقدر يسرب طلب تاجر لآخر.
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: dto.idempotencyKey, tenantId },
    });
    if (existing) return existing;

    // خطوة 2: العميل (findOrCreate بالتيليفون)
    const customer = await this.customersService.findOrCreate(tenantId, {
      phone: dto.customer.phone,
      name: dto.customer.name,
      email: dto.customer.email,
    });

    // خطوة 3: جلب المنتجات من الـDB، السعر الحقيقي فقط، بلا ثقة فـclient
    const productIds = dto.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, status: 'active' }, // tenantId أوتوماتيك
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'شي منتج مامتوفرش أو ماشي فحالة active',
      );
    }

    const priceMap = new Map(products.map((p) => [p.id, p.price]));
    const total = dto.items.reduce((sum, item) => {
      const price = priceMap.get(item.productId)!;
      return sum + Number(price) * item.quantity;
    }, 0);

    // خطوة 4: transaction وحدة عبر forTenant().$transaction — order + order_items
    // + stock decrement سوا. إذا decrementForOrder رمى استثناء، Prisma كيرجع
    // كل حاجة للخلف تلقائيا.
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId: customer.id, // tenantId تزاد أوتوماتيك عبر forTenant
          total,
          idempotencyKey: dto.idempotencyKey,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: priceMap.get(item.productId)!,
            })),
          },
        },
        include: { items: true, customer: true },
      });

      for (const item of dto.items) {
        if (item.variantId) {
          await this.inventoryService.decrementForOrder(
            tx,
            item.variantId,
            item.quantity,
          );
        }
      }

      return created;
    });

    return order;
  }

  async findAll(tenantId: string, query: ListOrdersDto) {
    const db = this.prisma.forTenant(tenantId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = query.status ? { status: query.status } : {};

    const [items, total] = await this.prisma.$transaction([
      db.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, customer: true },
      }),
      db.order.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.forTenant(tenantId).order.findFirst({
      where: { id },
      include: { items: true, customer: true, payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    await this.findOne(tenantId, id); // كيتأكد الملكية
    return this.prisma.forTenant(tenantId).order.update({
      where: { id },
      data: { status },
    });
  }
}
