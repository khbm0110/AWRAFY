import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [BillingController],
  providers: [BillingService, TenantGuard],
  exports: [BillingService],
})
export class BillingModule {}
