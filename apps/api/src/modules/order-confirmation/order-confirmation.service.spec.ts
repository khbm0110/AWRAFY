import { OrderConfirmationService } from './order-confirmation.service';

function buildMockTx(customer: { id: string; trustScore: number } | null) {
  return {
    orderConfirmation: {
      update: jest.fn().mockResolvedValue({ id: 'confirmation-1' }),
    },
    order: { update: jest.fn() },
    customer: {
      findUnique: jest.fn().mockResolvedValue(customer),
      update: jest.fn(),
    },
  };
}

describe('OrderConfirmationService.recordResponse — trust_score clamping', () => {
  const baseConfirmation = {
    id: 'confirmation-1',
    orderId: 'order-1',
    order: { tenantId: 'tenant-1', customerId: 'customer-1', status: 'pending' },
  };

  it('ماكيخرجش فوق 1.00 حتى مع confirmed متكررة', async () => {
    const mockTx = buildMockTx({ id: 'customer-1', trustScore: 0.98 });
    const mockPrisma = {
      orderConfirmation: { findFirst: jest.fn().mockResolvedValue(baseConfirmation) },
      $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    } as any;
    const mockOrders = { findOne: jest.fn() } as any;

    const service = new OrderConfirmationService(mockPrisma, mockOrders);
    await service.recordResponse('tenant-1', 'confirmation-1', 'confirmed');

    // 0.98 + 0.05 = 1.03 بلا clamp، بصح خصها توقف عند 1.00 بالضبط
    expect(mockTx.customer.update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { trustScore: 1 },
    });
  });

  it('ماكيخرجش تحت 0.00 حتى مع rejected متكررة', async () => {
    const mockTx = buildMockTx({ id: 'customer-1', trustScore: 0.05 });
    const mockPrisma = {
      orderConfirmation: { findFirst: jest.fn().mockResolvedValue(baseConfirmation) },
      $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    } as any;
    const mockOrders = { findOne: jest.fn() } as any;

    const service = new OrderConfirmationService(mockPrisma, mockOrders);
    await service.recordResponse('tenant-1', 'confirmation-1', 'rejected');

    // 0.05 - 0.1 = -0.05 بلا clamp، بصح خصها توقف عند 0.00 بالضبط
    expect(mockTx.customer.update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { trustScore: 0 },
    });
  });

  it('كيبدل order.status لـ"confirmed" ملي الرد confirmed', async () => {
    const mockTx = buildMockTx({ id: 'customer-1', trustScore: 0.5 });
    const mockPrisma = {
      orderConfirmation: { findFirst: jest.fn().mockResolvedValue(baseConfirmation) },
      $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    } as any;
    const mockOrders = { findOne: jest.fn() } as any;

    const service = new OrderConfirmationService(mockPrisma, mockOrders);
    await service.recordResponse('tenant-1', 'confirmation-1', 'confirmed');

    expect(mockTx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'confirmed' },
    });
  });

  it('كيبدل order.status لـ"cancelled" ملي الرد rejected', async () => {
    const mockTx = buildMockTx({ id: 'customer-1', trustScore: 0.5 });
    const mockPrisma = {
      orderConfirmation: { findFirst: jest.fn().mockResolvedValue(baseConfirmation) },
      $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    } as any;
    const mockOrders = { findOne: jest.fn() } as any;

    const service = new OrderConfirmationService(mockPrisma, mockOrders);
    await service.recordResponse('tenant-1', 'confirmation-1', 'rejected');

    expect(mockTx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'cancelled' },
    });
  });
});
