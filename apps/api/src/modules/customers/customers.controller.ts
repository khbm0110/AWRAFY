import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(TenantGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.findAll(
      tenantId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }
}
