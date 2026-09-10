import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { InventoryService } from './inventory.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';

@Controller('inventory')
@UseGuards(TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjustments')
  async createAdjustment(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAdjustmentDto,
    @Req() req: any,
  ) {
    return this.inventoryService.createAdjustment(tenantId, dto, req.user?.id);
  }

  @Get('adjustments')
  async listAdjustments(
    @CurrentTenant() tenantId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.inventoryService.listAdjustments(tenantId, variantId);
  }
}
