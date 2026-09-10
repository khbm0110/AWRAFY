import { NotFoundException } from '@nestjs/common';
import { StorefrontApiService } from './storefront-api.service';

describe('StorefrontApiService — بلا تسريب معلومة (security)', () => {
  it('كيرمي NotFoundException لمنتج draft — بلا فرق فالرسالة عن "ماكاينش"', async () => {
    const mockProducts = {
      findBySlug: jest.fn().mockResolvedValue({ id: 'p1', status: 'draft', slug: 'secret' }),
    } as any;
    const mockCategories = {} as any;
    const mockOrders = {} as any;

    const service = new StorefrontApiService(mockProducts, mockCategories, mockOrders);

    // ⚠️ نقطة أمنية: الزبون الخارجي ما خصوش يعرف واش المنتج "draft" أو "مكاينش أصلا"
    await expect(service.getProductBySlug('tenant-1', 'secret')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('كيرجع المنتج إذا status = active', async () => {
    const activeProduct = { id: 'p1', status: 'active', slug: 'qamis' };
    const mockProducts = { findBySlug: jest.fn().mockResolvedValue(activeProduct) } as any;
    const mockCategories = {} as any;
    const mockOrders = {} as any;

    const service = new StorefrontApiService(mockProducts, mockCategories, mockOrders);

    await expect(service.getProductBySlug('tenant-1', 'qamis')).resolves.toBe(activeProduct);
  });

  it('listProducts كيفرض status=active دايما، بلا اعتماد على query.status جاي من الـclient', async () => {
    const mockProducts = { findAll: jest.fn().mockResolvedValue({ items: [], pagination: {} }) } as any;
    const mockCategories = {} as any;
    const mockOrders = {} as any;

    const service = new StorefrontApiService(mockProducts, mockCategories, mockOrders);

    // ⚠️ الزبون حاول يبعث status=draft فالـquery — خصو يتجاهل
    await service.listProducts('tenant-1', { status: 'draft', page: 1, limit: 20 } as any);

    expect(mockProducts.findAll).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ status: 'active' }), // مفروضة، ماشي 'draft'
    );
  });
});
