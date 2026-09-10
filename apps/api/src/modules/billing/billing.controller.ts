import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { BillingService } from './billing.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('billing')
@UseGuards(TenantGuard, RolesGuard) // الترتيب مهم: TenantGuard أولا (كيحط request.user)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('subscribe')
  @Roles('owner') // قرار مالي — staff ما يقدرش يبدل خطة الاشتراك
  async subscribe(
    @CurrentTenant() tenantId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.billingService.subscribe(tenantId, dto.planKey);
  }

  @Get('subscription')
  async getSubscription(@CurrentTenant() tenantId: string) {
    return this.billingService.getCurrentSubscription(tenantId);
  }

  @Get('usage')
  async getUsage(@CurrentTenant() tenantId: string) {
    return this.billingService.checkUsageLimits(tenantId);
  }

  @Get('invoices')
  @Roles('owner') // فواتير = معلومة مالية حساسة
  async listInvoices(@CurrentTenant() tenantId: string) {
    return this.billingService.listInvoices(tenantId);
  }
}
