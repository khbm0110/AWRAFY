import { NotFoundException } from '@nestjs/common';
import { StoresService } from './stores.service';

describe('StoresService', () => {
  it('كيرمي NotFoundException إذا المتجر مامتوفرش', async () => {
    const db = { store: { findFirst: jest.fn().mockResolvedValue(null) } };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new StoresService(mockPrisma);

    await expect(service.findByTenant('tenant-ghayr-mawjoud')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update() كيتأكد الملكية قبل التعديل (findByTenant أولا)', async () => {
    const db = {
      store: {
        findFirst: jest.fn().mockResolvedValue({ id: 'store-1' }),
        update: jest.fn().mockResolvedValue({ id: 'store-1', name: 'اسم جديد' }),
      },
    };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new StoresService(mockPrisma);

    await service.update('tenant-1', { name: 'اسم جديد' } as any);

    expect(db.store.findFirst).toHaveBeenCalled(); // تحقق الملكية قبل
    expect(db.store.update).toHaveBeenCalledWith({
      where: { id: 'store-1' },
      data: { name: 'اسم جديد' },
    });
  });
});
