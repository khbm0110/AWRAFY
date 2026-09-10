import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles('owner') — يحدد الأدوار المسموح لها بالوصول لـroute معينة.
 * كيخدم مع RolesGuard (لازم TenantGuard يجري قبلو باش request.user.role تكون موجودة).
 * استعمال: @UseGuards(TenantGuard, RolesGuard) @Roles('owner')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
