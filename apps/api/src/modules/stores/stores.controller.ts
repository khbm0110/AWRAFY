import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { StoresService } from './stores.service';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
@UseGuards(TenantGuard, RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('me')
  async getMyStore(@CurrentTenant() tenantId: string) {
    return this.storesService.findByTenant(tenantId);
  }

  @Patch('me')
  @Roles('owner') // إعدادات المتجر (دومين، لغة افتراضية...) — staff ما يبدلهاش
  async updateMyStore(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(tenantId, dto);
  }
}
