import { NotFoundException } from '@nestjs/common';
import { ShippingService } from './shipping.service';

describe('ShippingService.createShipment', () => {
  it('كيرمي NotFoundException إذا carrierId متبعث بصح مامتوفرش فهاد التاجر', async () => {
    const db = { shippingCarrier: { findFirst: jest.fn().mockResolvedValue(null) } };
    const mockPrisma = { forTenant: jest.fn().mockReturnValue(db), shipment: {} } as any;
    const mockOrders = { findOne: jest.fn().mockResolvedValue({ id: 'order-1' }) } as any;

    const service = new ShippingService(mockPrisma, mockOrders);

    await expect(
      service.createShipment('tenant-1', {
        orderId: 'order-1',
        carrierId: 'carrier-ghayr-mawjoud',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('كيتأكد ملكية الطلب قبل إنشاء الشحنة (ordersService.findOne)', async () => {
    const db = { shippingCarrier: { findFirst: jest.fn() } };
    const mockPrisma = {
      forTenant: jest.fn().mockReturnValue(db),
      shipment: { create: jest.fn().mockResolvedValue({ id: 'shipment-1' }) },
    } as any;
    const mockOrders = { findOne: jest.fn().mockResolvedValue({ id: 'order-1' }) } as any;

    const service = new ShippingService(mockPrisma, mockOrders);

    await service.createShipment('tenant-1', { orderId: 'order-1' });

    expect(mockOrders.findOne).toHaveBeenCalledWith('tenant-1', 'order-1');
  });
});
