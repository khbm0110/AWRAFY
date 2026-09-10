import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PublicTenantGuard — لـendpoints الـstorefront العمومية (بلا JWT، الزبون بلا حساب).
 * انظر docs/02-architecture.md § common/middleware "Tenant resolver (domain/subdomain)".
 *
 * الفرق عن TenantGuard: هنا كنحددو الـtenant من الدومين/الـsubdomain اللي جا منو
 * الـrequest، ماشي من token. الأمان هنا مختلف: بلا identity للزبون، غير
 * "شكون التاجر اللي كيزور المتجر ديالو".
 */
@Injectable()
export class PublicTenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ⚠️ DEV ONLY — بديل مؤقت للتطوير المحلي بلا DNS حقيقي مربوط.
    // فـproduction، الـtenant خصو يتحدد من الدومين الحقيقي فقط (Host header)،
    // بلا header قابل للتلاعب من الـclient — احذف هاد الفرع قبل أي deploy حقيقي.
    if (process.env.NODE_ENV !== 'production') {
      const devTenantId = request.headers['x-tenant-id'];
      if (devTenantId) {
        request.tenantId = devTenantId;
        return true;
      }
    }

    const host = request.headers['host']?.split(':')[0]; // بلا الـport
    if (!host) throw new NotFoundException('Store not found');

    const tenant = await this.prisma.tenant.findFirst({
      where: { domain: host, status: 'active' },
    });
    if (!tenant) throw new NotFoundException('Store not found');

    request.tenantId = tenant.id;
    return true;
  }
}
