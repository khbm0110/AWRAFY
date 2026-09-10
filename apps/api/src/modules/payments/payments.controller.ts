import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaymentsService } from './payments.service';
import { CreateCodPaymentDto } from './dto/create-cod-payment.dto';

@Controller('payments')
@UseGuards(TenantGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('cod')
  async createCod(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateCodPaymentDto,
  ) {
    return this.paymentsService.createCodPayment(tenantId, dto.orderId);
  }

  @Get('order/:orderId')
  async findByOrder(
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.findByOrder(tenantId, orderId);
  }
}
