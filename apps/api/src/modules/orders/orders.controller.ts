import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(tenantId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ListOrdersDto,
  ) {
    return this.ordersService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.findOne(tenantId, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(tenantId, id, dto.status);
  }
}
