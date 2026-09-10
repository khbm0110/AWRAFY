import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

function mockDb() {
  return {
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('ProductsService.create', () => {
  it('كيرمي ConflictException إذا الـslug مستعمل ديجا فنفس التاجر', async () => {
    const db = mockDb();
    db.product.findUnique.mockResolvedValue({ id: 'existing', slug: 'qamis' });

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new ProductsService(mockPrisma);

    await expect(
      service.create('tenant-1', {
        title: { ar: 'قميص' },
        slug: 'qamis',
        price: 100,
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('كيدير fallback لـMAD إذا currency ماتزادش', async () => {
    const db = mockDb();
    db.product.findUnique.mockResolvedValue(null);
    db.product.create.mockResolvedValue({ id: 'p1' });

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new ProductsService(mockPrisma);

    await service.create('tenant-1', {
      title: { ar: 'قميص' },
      slug: 'qamis-2',
      price: 100,
    } as any);

    expect(db.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currency: 'MAD', status: 'draft' }),
      }),
    );
  });
});

describe('ProductsService.findOne', () => {
  it('كيرمي NotFoundException إذا المنتج مامتوفرش', async () => {
    const db = mockDb();
    db.product.findFirst.mockResolvedValue(null);

    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new ProductsService(mockPrisma);

    await expect(service.findOne('tenant-1', 'ghayr-mawjoud')).rejects.toThrow(
      NotFoundException,
    );
  });
});
