import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * TenantGuard — إجباري على كل route فـtenant scope (بلا استثناء).
 * انظر docs/02-architecture.md § Multi-tenancy و docs/07-security-checklist.md § Multi-tenancy Isolation.
 *
 * كيقرا JWT، كيستخرج tenantId، وكيحطو فـrequest.tenantId باش أي service
 * يقدر يستعملو مباشرة عبر @CurrentTenant(). بلا tenantId صحيح = 401،
 * بلا استثناء حتى للـadmin routes (هادوك عندهم AdminGuard منفصل تماما).
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = this.jwtService.verify(token);

      if (!payload.tenantId) {
        throw new UnauthorizedException('Token missing tenantId');
      }

      request.tenantId = payload.tenantId;
      request.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
