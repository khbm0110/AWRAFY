import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * `this.prisma.forTenant(tenantId)` — extension كتفرض tenantId أوتوماتيك
   * على كل query (create/find/update/delete)، حتى لو نسينا نكتبها يدويا.
   * انظر prisma.service.ts § forTenant للتفاصيل المعمارية الكاملة.
   */
  async create(tenantId: string, dto: CreateProductDto) {
    const db = this.prisma.forTenant(tenantId);

    const existing = await db.product.findUnique({
      where: { tenantId_slug: { tenantId, slug: dto.slug } },
    });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" already used فهاد المتجر`);
    }

    const { variants, ...productData } = dto;

    return db.product.create({
      data: {
        ...productData,
        currency: dto.currency ?? 'MAD',
        status: dto.status ?? 'draft',
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: { variants: true },
    });
  }

  // Pagination إجبارية — انظر docs/08-code-quality-performance.md § Backend
  async findAll(tenantId: string, query: ListProductsDto) {
    const db = this.prisma.forTenant(tenantId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = query.status ? { status: query.status } : {}; // tenantId تزاد أوتوماتيك عبر forTenant

    const [items, total] = await this.prisma.$transaction([
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { variants: true },
      }),
      db.product.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.forTenant(tenantId).product.findFirst({
      where: { id }, // tenantId تزاد أوتوماتيك — دفاع إضافي فوق RLS
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /**
   * كيرجع المنتج بأي status (draft يشمل) — القرار "واش نعرضو للزبون" مسؤولية
   * الـcaller (مثلا modules/storefront-api كيتحقق status === 'active' بيدو).
   */
  async findBySlug(tenantId: string, slug: string) {
    const product = await this.prisma.forTenant(tenantId).product.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id); // كيتأكد الملكية قبل التعديل

    const { variants, ...productData } = dto;

    return this.prisma.forTenant(tenantId).product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.forTenant(tenantId).product.delete({ where: { id } });
  }
}
