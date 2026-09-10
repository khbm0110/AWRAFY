import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService.create', () => {
  it('كيرجع الطلب الموجود إذا idempotencyKey تكرر (بلا خلق order جديد)', async () => {
    const existingOrder = { id: 'order-existing', idempotencyKey: 'key-1' };

    const mockPrisma = {
      order: { findUnique: jest.fn().mockResolvedValue(existingOrder) },
      forTenant: jest.fn(), // ما خصهاش تتنادى أصلا فهاد السيناريو
    } as any;

    const mockCustomers = { findOrCreate: jest.fn() } as any;
    const mockInventory = { decrementForOrder: jest.fn() } as any;

    const service = new OrdersService(mockPrisma, mockCustomers, mockInventory);

    const result = await service.create('tenant-1', {
      customer: { phone: '+212600000000' },
      items: [{ productId: 'p1', quantity: 1 }],
      idempotencyKey: 'key-1',
    } as any);

    expect(result).toBe(existingOrder);
    expect(mockCustomers.findOrCreate).not.toHaveBeenCalled(); // بلا عميل جديد = بلا order جديد فعليا
  });

  it('كيحسب السعر من الـDB (products.price)، بلا ثقة فسعر جاي من DTO', async () => {
    const mockOrderCreate = jest.fn().mockResolvedValue({ id: 'order-1', items: [] });
    const mockTx = { order: { create: mockOrderCreate } };

    const mockDb = {
      product: {
        findMany: jest.fn().mockResolvedValue([{ id: 'p1', price: 150 }]),
      },
      $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    };

    const mockPrisma = {
      order: { findUnique: jest.fn().mockResolvedValue(null) },
      forTenant: jest.fn().mockReturnValue(mockDb),
    } as any;

    const mockCustomers = {
      findOrCreate: jest.fn().mockResolvedValue({ id: 'customer-1' }),
    } as any;
    const mockInventory = { decrementForOrder: jest.fn() } as any;

    const service = new OrdersService(mockPrisma, mockCustomers, mockInventory);

    await service.create('tenant-1', {
      customer: { phone: '+212600000000' },
      // ⚠️ ماكاينش price فالـDTO أصلا — الـservice ما كيقبلوش من الـclient
      items: [{ productId: 'p1', quantity: 3 }],
      idempotencyKey: 'key-2',
    } as any);

    // total = 150 * 3 = 450، محسوبة من products.price، ماشي من أي مصدر آخر
    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ total: 450 }),
      }),
    );
  });

  it('كيرمي BadRequestException إذا شي منتج مامتوفرش', async () => {
    const mockDb = {
      product: { findMany: jest.fn().mockResolvedValue([]) }, // بلا نتائج
    };

    const mockPrisma = {
      order: { findUnique: jest.fn().mockResolvedValue(null) },
      forTenant: jest.fn().mockReturnValue(mockDb),
    } as any;

    const mockCustomers = {
      findOrCreate: jest.fn().mockResolvedValue({ id: 'customer-1' }),
    } as any;
    const mockInventory = { decrementForOrder: jest.fn() } as any;

    const service = new OrdersService(mockPrisma, mockCustomers, mockInventory);

    await expect(
      service.create('tenant-1', {
        customer: { phone: '+212600000000' },
        items: [{ productId: 'p-mafash', quantity: 1 }],
        idempotencyKey: 'key-3',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
