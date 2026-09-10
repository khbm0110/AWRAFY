import { BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';

describe('BillingService.checkUsageLimits', () => {
  it('withinLimits=false إذا عدد المنتجات تجاوز حد الخطة', async () => {
    const db = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          tenantId: 't1',
          planKey: 'starter', // maxProducts: 30
        }),
      },
      product: { count: jest.fn().mockResolvedValue(35) }, // تجاوز الحد
      order: { count: jest.fn().mockResolvedValue(5) },
    };

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new BillingService(mockPrisma);

    const usage = await service.checkUsageLimits('t1');

    expect(usage.products.used).toBe(35);
    expect(usage.products.limit).toBe(30);
    expect(usage.withinLimits).toBe(false); // 35 > 30
  });

  it('withinLimits=true إذا الاستعمال جوا الحدود', async () => {
    const db = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue({ tenantId: 't1', planKey: 'growth' }), // maxProducts: 500
      },
      product: { count: jest.fn().mockResolvedValue(10) },
      order: { count: jest.fn().mockResolvedValue(3) },
    };

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new BillingService(mockPrisma);

    const usage = await service.checkUsageLimits('t1');
    expect(usage.withinLimits).toBe(true);
  });
});

describe('BillingService.generateInvoice', () => {
  it('كيرمي BadRequestException لخطة Starter المجانية (بلا فاتورة)', async () => {
    const db = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'sub-1',
          tenantId: 't1',
          planKey: 'starter', // priceMAD: 0
          currentPeriodEnd: new Date(),
        }),
      },
    };

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new BillingService(mockPrisma);

    await expect(service.generateInvoice('t1')).rejects.toThrow(BadRequestException);
  });

  it('كيخلق فاتورة بسعر الخطة لخطة مدفوعة', async () => {
    const mockCreate = jest.fn().mockResolvedValue({ id: 'inv-1' });
    const db = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'sub-1',
          tenantId: 't1',
          planKey: 'growth', // priceMAD: 199
          currentPeriodEnd: new Date('2026-01-01'),
        }),
      },
      platformInvoice: { create: mockCreate },
    };

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new BillingService(mockPrisma);

    await service.generateInvoice('t1');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 199 }),
      }),
    );
  });
});
