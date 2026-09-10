import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Injectable()
export class ShippingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  // --- Carriers (إعداد التاجر لشركات الشحن ديالو) — ShippingCarrier معزولة (forTenant) ---

  async createCarrier(tenantId: string, dto: CreateCarrierDto) {
    return this.prisma.forTenant(tenantId).shippingCarrier.create({ data: dto });
  }

  async findAllCarriers(tenantId: string) {
    return this.prisma.forTenant(tenantId).shippingCarrier.findMany({
      where: { active: true },
    });
  }

  // --- Shipments (بلا tenantId مباشر — عزل عبر العلاقة مع Order) ---

  async createShipment(tenantId: string, dto: CreateShipmentDto) {
    await this.ordersService.findOne(tenantId, dto.orderId); // تأكيد ملكية الطلب

    if (dto.carrierId) {
      const carrier = await this.prisma.forTenant(tenantId).shippingCarrier.findFirst({
        where: { id: dto.carrierId },
      });
      if (!carrier) throw new NotFoundException('Carrier not found');
    }

    return this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        carrierId: dto.carrierId,
        statusHistory: [{ status: 'pending', at: new Date().toISOString() }],
      },
    });
  }

  /**
   * تحديث حالة الشحنة — كيتزاد فـstatus_history بدل ما يتبدل غير status.
   * ⚠️ TODO Phase 1: هاد الـmethod غادي يتنادى من webhook/polling ديال شركة الشحن
   * (مؤتمت بالكامل بحال ماهو موثق فـtasks/phase-1-core.md § Shipping)، ماشي يدوي فقط.
   */
  async updateShipmentStatus(
    tenantId: string,
    shipmentId: string,
    status: string,
    trackingNumber?: string,
  ) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, order: { tenantId } }, // tenant isolation عبر العلاقة
      include: { order: true },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');

    const history = Array.isArray(shipment.statusHistory)
      ? shipment.statusHistory
      : [];

    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        trackingNumber: trackingNumber ?? shipment.trackingNumber,
        statusHistory: [
          ...history,
          { status, at: new Date().toISOString() },
        ],
      },
    });
  }

  async findByOrder(tenantId: string, orderId: string) {
    await this.ordersService.findOne(tenantId, orderId);
    return this.prisma.shipment.findMany({ where: { orderId } });
  }
}
