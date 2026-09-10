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
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { OrderConfirmationService } from './order-confirmation.service';
import { SendConfirmationDto } from './dto/send-confirmation.dto';
import { RecordResponseDto } from './dto/record-response.dto';

@Controller('order-confirmations')
@UseGuards(TenantGuard)
export class OrderConfirmationController {
  constructor(
    private readonly confirmationService: OrderConfirmationService,
  ) {}

  @Post()
  async send(
    @CurrentTenant() tenantId: string,
    @Body() dto: SendConfirmationDto,
  ) {
    return this.confirmationService.send(tenantId, dto);
  }

  @Patch(':id/response')
  async recordResponse(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: RecordResponseDto,
  ) {
    return this.confirmationService.recordResponse(
      tenantId,
      id,
      dto.status as 'confirmed' | 'no_response' | 'rejected',
    );
  }

  @Get('order/:orderId')
  async findByOrder(
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.confirmationService.findByOrder(tenantId, orderId);
  }
}
