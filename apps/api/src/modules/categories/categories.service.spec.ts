import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  it('create() كيمرر tenantId عبر forTenant، بلا حاجة يكتبو يدويا فـdata', async () => {
    const db = { category: { create: jest.fn().mockResolvedValue({ id: 'cat-1' }) } };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new CategoriesService(mockPrisma);

    await service.create('tenant-1', { name: { ar: 'ملابس' }, slug: 'malabis' } as any);

    expect(mockPrisma.forTenant).toHaveBeenCalledWith('tenant-1');
    expect(db.category.create).toHaveBeenCalledWith({
      data: { name: { ar: 'ملابس' }, slug: 'malabis' },
    });
  });

  it('findAll() كيستعمل forTenant بلا where إضافي', async () => {
    const db = { category: { findMany: jest.fn().mockResolvedValue([]) } };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new CategoriesService(mockPrisma);

    await service.findAll('tenant-1');

    expect(mockPrisma.forTenant).toHaveBeenCalledWith('tenant-1');
  });
});
