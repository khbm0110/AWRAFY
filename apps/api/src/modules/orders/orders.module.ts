import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CustomersModule } from '../customers';
import { InventoryModule } from '../inventory';

@Module({
  imports: [JwtModule.register({}), CustomersModule, InventoryModule], // استيراد عبر index.ts فقط
  controllers: [OrdersController],
  providers: [OrdersService, TenantGuard],
  exports: [OrdersService], // payments/shipping غادي يحتاجوها لاحقا
})
export class OrdersModule {}
