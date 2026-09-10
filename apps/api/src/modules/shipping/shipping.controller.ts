import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ShippingService } from './shipping.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Controller()
@UseGuards(TenantGuard, RolesGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('shipping-carriers')
  @Roles('owner') // قرار عمل (شركة الشحن) — ماشي عملية تشغيلية يومية
  async createCarrier(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateCarrierDto,
  ) {
    return this.shippingService.createCarrier(tenantId, dto);
  }

  @Get('shipping-carriers')
  async findAllCarriers(@CurrentTenant() tenantId: string) {
    return this.shippingService.findAllCarriers(tenantId);
  }

  // إنشاء/تحديث شحنة فردية — عملية تشغيلية يومية، staff يقدر يديرها بلا قيد
  @Post('shipments')
  async createShipment(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.shippingService.createShipment(tenantId, dto);
  }

  @Patch('shipments/:id/status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shippingService.updateShipmentStatus(
      tenantId,
      id,
      dto.status,
      dto.trackingNumber,
    );
  }

  @Get('orders/:orderId/shipments')
  async findByOrder(
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.shippingService.findByOrder(tenantId, orderId);
  }
}
