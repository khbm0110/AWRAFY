import { CustomersService } from './customers.service';

describe('CustomersService.findOrCreate', () => {
  it('كيرجع العميل الموجود بالتيليفون، بلا خلق واحد جديد', async () => {
    const existingCustomer = { id: 'cust-1', phone: '+212600000000' };
    const db = {
      customer: {
        findFirst: jest.fn().mockResolvedValue(existingCustomer),
        create: jest.fn(),
      },
    };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new CustomersService(mockPrisma);

    const result = await service.findOrCreate('tenant-1', { phone: '+212600000000' });

    expect(result).toBe(existingCustomer);
    expect(db.customer.create).not.toHaveBeenCalled(); // بلا تكرار
  });

  it('كيخلق عميل جديد إذا التيليفون مامسجلش قبل', async () => {
    const newCustomer = { id: 'cust-new', phone: '+212611111111' };
    const db = {
      customer: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(newCustomer),
      },
    };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db) } as any;
    const service = new CustomersService(mockPrisma);

    const result = await service.findOrCreate('tenant-1', {
      phone: '+212611111111',
      name: 'زبون جديد',
    });

    expect(result).toBe(newCustomer);
    expect(db.customer.create).toHaveBeenCalledWith({
      data: { phone: '+212611111111', name: 'زبون جديد' },
    });
  });
});

describe('CustomersService.findAll', () => {
  it('كيرجع pagination صحيحة', async () => {
    const db = {
      customer: {
        findMany: jest.fn().mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]),
        count: jest.fn().mockResolvedValue(2),
      },
    };
    const mockPrisma = {
      forTenant: jest.fn().mockReturnValue(db),
      $transaction: jest.fn((queries: any[]) => Promise.all(queries)),
    } as any;
    const service = new CustomersService(mockPrisma);

    const result = await service.findAll('tenant-1', 1, 20);

    expect(result.items).toHaveLength(2);
    expect(result.pagination).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
  });
});
