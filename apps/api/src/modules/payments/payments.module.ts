import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { OrdersModule } from '../orders';

@Module({
  imports: [JwtModule.register({}), OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, TenantGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
