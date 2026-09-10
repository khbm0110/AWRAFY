import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

function buildMockJwt() {
  return {
    sign: jest.fn().mockReturnValue('signed-token'),
    verify: jest.fn(),
  };
}

function buildMockConfig() {
  return { get: jest.fn((key: string, fallback?: any) => fallback ?? key) };
}

describe('AuthService.signup', () => {
  it('كيرمي ConflictException إذا الإيميل مستعمل ديجا', async () => {
    const mockPrisma = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'existing-user' }) },
    } as any;

    const service = new AuthService(mockPrisma, buildMockJwt() as any, buildMockConfig() as any);

    await expect(
      service.signup({
        storeName: 'متجري',
        email: 'taken@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('كيدير hash لكلمة السر بـbcrypt قبل التخزين — بلا plain text أبدا', async () => {
    let capturedPasswordHash = '';

    const mockTx = {
      tenant: { create: jest.fn().mockResolvedValue({ id: 'tenant-1' }) },
      store: { create: jest.fn().mockResolvedValue({ id: 'store-1' }) },
      user: {
        create: jest.fn().mockImplementation(({ data }: any) => {
          capturedPasswordHash = data.passwordHash;
          return Promise.resolve({ id: 'user-1', role: 'owner' });
        }),
      },
    };

    const mockPrisma = {
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    } as any;

    const service = new AuthService(mockPrisma, buildMockJwt() as any, buildMockConfig() as any);

    await service.signup({
      storeName: 'متجري',
      email: 'new@example.com',
      password: 'plainTextPassword123',
    });

    expect(capturedPasswordHash).not.toBe('plainTextPassword123'); // بلا plain text
    expect(capturedPasswordHash.startsWith('$2b$')).toBe(true); // bcrypt hash format
    await expect(
      bcrypt.compare('plainTextPassword123', capturedPasswordHash),
    ).resolves.toBe(true);
  });
});

describe('AuthService.login — 2FA branching', () => {
  it('كيرجع requires2FA=true بلا tokens نهائيين إذا totpEnabled=true', async () => {
    const mockPrisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'user-1',
          passwordHash: await bcrypt.hash('correctPassword', 12),
          totpEnabled: true,
        }),
      },
    } as any;

    const service = new AuthService(mockPrisma, buildMockJwt() as any, buildMockConfig() as any);

    const result = await service.login({
      email: 'user@example.com',
      password: 'correctPassword',
    });

    expect(result).toEqual({ requires2FA: true, tempToken: 'signed-token' });
  });

  it('كيرمي UnauthorizedException إذا كلمة السر غالطة', async () => {
    const mockPrisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'user-1',
          passwordHash: await bcrypt.hash('correctPassword', 12),
          totpEnabled: false,
        }),
      },
    } as any;

    const service = new AuthService(mockPrisma, buildMockJwt() as any, buildMockConfig() as any);

    await expect(
      service.login({ email: 'user@example.com', password: 'wrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
