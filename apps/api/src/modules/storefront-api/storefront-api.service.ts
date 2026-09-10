import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService, ListProductsDto } from '../products';
import { CategoriesService } from '../categories';
import { OrdersService, CreateOrderDto } from '../orders';

/**
 * كل الـmethods هنا "public-safe" — الزبون النهائي بلا حساب/JWT.
 * القاعدة: بلا استثناء، بلا تسريب بيانات draft أو tenant آخر.
 * انظر common/guards/public-tenant.guard.ts للتفاصيل الأمنية.
 */
@Injectable()
export class StorefrontApiService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly ordersService: OrdersService,
  ) {}

  async listProducts(tenantId: string, query: ListProductsDto) {
    // status مفروضة 'active' دايما هنا — بلا اعتماد على query.status جاي من الـclient
    return this.productsService.findAll(tenantId, { ...query, status: 'active' });
  }

  async getProductBySlug(tenantId: string, slug: string) {
    const product = await this.productsService.findBySlug(tenantId, slug);
    if (product.status !== 'active') {
      // بلا فرق فـresponse بين "ماكاينش" و"draft" — تفادي تسريب معلومة
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async listCategories(tenantId: string) {
    return this.categoriesService.findAll(tenantId);
  }

  async createOrder(tenantId: string, dto: CreateOrderDto) {
    // OrdersService.create ديجا كتحسب السعر من الـDB وكتفرض idempotency —
    // بلا حاجة لطبقة حماية إضافية هنا
    return this.ordersService.create(tenantId, dto);
  }
}
