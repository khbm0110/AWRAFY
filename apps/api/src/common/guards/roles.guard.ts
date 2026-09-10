import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard — كيتحقق من `request.user.role` (مزودة من TenantGuard) مقابل
 * `@Roles(...)` decorator. خصو يجري **بعد** TenantGuard دايما
 * (Guards فـNestJS كيجريو بالترتيب اللي كتبتهم بيه فـ@UseGuards).
 *
 * بلا @Roles() على route = بلا قيد إضافي (كل role مسموح، TenantGuard كافي).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `هاد العملية محتاجة صلاحية: ${requiredRoles.join(' أو ')}`,
      );
    }

    return true;
  }
}
