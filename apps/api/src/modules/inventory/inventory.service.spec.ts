import { BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';

describe('InventoryService.decrementForOrder', () => {
  it('كينقص المخزون إذا كافي', async () => {
    const mockPrisma = {} as any;
    const service = new InventoryService(mockPrisma);

    const mockTx = {
      productVariant: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as any;

    await expect(
      service.decrementForOrder(mockTx, 'variant-1', 2),
    ).resolves.toBeUndefined();

    expect(mockTx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'variant-1', stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
  });

  it('كيرمي BadRequestException إذا المخزون ناقص', async () => {
    const mockPrisma = {} as any;
    const service = new InventoryService(mockPrisma);

    const mockTx = {
      productVariant: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }), // بلا صف تبدل = مخزون ناقص
      },
    } as any;

    await expect(
      service.decrementForOrder(mockTx, 'variant-1', 100),
    ).rejects.toThrow(BadRequestException);
  });
});
