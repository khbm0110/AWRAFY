import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderConfirmationController } from './order-confirmation.controller';
import { OrderConfirmationService } from './order-confirmation.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { OrdersModule } from '../orders';

@Module({
  imports: [JwtModule.register({}), OrdersModule],
  controllers: [OrderConfirmationController],
  providers: [OrderConfirmationService, TenantGuard],
  exports: [OrderConfirmationService],
})
export class OrderConfirmationModule {}
