import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(TenantGuard) // إجباري — انظر docs/02-architecture.md
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async getCurrentTenant(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }
}
