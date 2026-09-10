import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { OrdersModule } from '../orders';

@Module({
  imports: [JwtModule.register({}), OrdersModule],
  controllers: [ShippingController],
  providers: [ShippingService, TenantGuard],
  exports: [ShippingService],
})
export class ShippingModule {}
