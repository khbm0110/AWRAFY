import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function buildContext(userRole: string | undefined, requiredRoles: string[] | undefined) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: userRole ? { role: userRole } : undefined }),
    }),
  } as unknown as ExecutionContext;

  return { reflector, context };
}

describe('RolesGuard', () => {
  it('كيسمح بالمرور إذا بلا @Roles() على الـroute', () => {
    const { reflector, context } = buildContext('staff', undefined);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('كيسمح إذا role ديال المستخدم فلائحة الأدوار المسموحة', () => {
    const { reflector, context } = buildContext('owner', ['owner']);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('كيرمي ForbiddenException إذا role ماشي فاللائحة المسموحة', () => {
    const { reflector, context } = buildContext('staff', ['owner']);
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('كيرمي ForbiddenException إذا بلا user أصلا (بلا role)', () => {
    const { reflector, context } = buildContext(undefined, ['owner']);
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
