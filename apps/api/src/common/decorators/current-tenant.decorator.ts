import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// كيستخرج tenantId من الـrequest بعد ما TenantGuard يتحقق منو
// استعمال: async findAll(@CurrentTenant() tenantId: string) { ... }
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);
