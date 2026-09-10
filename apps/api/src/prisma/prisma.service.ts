import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Wrapper وحيد لـPrismaClient — كل service كيستعمل هاد الـprovider، بلا `new PrismaClient()` مباشرة
// فأي مكان آخر (تفادي عدة connections).
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * حماية إضافية على مستوى التطبيق (application-level) — تفرض tenantId
   * أوتوماتيك على كل query لموديل معزول، بدل الاعتماد فقط على الانضباط
   * اليدوي (كل service يكتب `where: { tenantId }` بنفسو، قابل للنسيان).
   *
   * ⚠️ قرار معماري: بدّلنا خطة الاعتماد على PostgreSQL RLS الخام
   * (`SET LOCAL app.current_tenant_id`) بهاد الـextension، لأن الربط الحقيقي
   * مع RLS كيحتاج معاملة (transaction) أو connection مخصصة لكل request —
   * معقد بزاف مع connection pooling ديال Prisma. هاد الـextension كيعطي
   * نفس الحماية عمليا (بلا نسيان tenantId)، بمجهود أقل. RLS SQL
   * (`prisma/rls/001_enable_rls.sql`) خاصها تبقى مفعّلة كطبقة دفاع ثانية
   * (defense-in-depth) — بلا اعتماد عليها وحدها.
   *
   * الموديلات المدعومة هنا هي بالضبط اللي عندها `tenant_id` مباشر —
   * انظر docs/03-database-schema.md § قواعد إجبارية #1.
   */
  forTenant(tenantId: string) {
    const TENANT_SCOPED_MODELS = new Set([
      'User', 'Store', 'Category', 'Product', 'StockAdjustment', 'Customer',
      'Order', 'ShippingCarrier', 'Subscription', 'PlatformInvoice',
    ]);

    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (!TENANT_SCOPED_MODELS.has(model)) return query(args);

            const readOrWriteWithWhere = [
              'findFirst', 'findMany', 'findUnique', 'findUniqueOrThrow',
              'update', 'updateMany', 'delete', 'deleteMany', 'count',
            ];

            if (readOrWriteWithWhere.includes(operation)) {
              const typedArgs = args as { where?: Record<string, unknown> };
              typedArgs.where = { ...typedArgs.where, tenantId };
            } else if (operation === 'create') {
              const typedArgs = args as { data?: Record<string, unknown> };
              typedArgs.data = { ...typedArgs.data, tenantId };
            }

            return query(args);
          },
        },
      },
    });
  }
}
