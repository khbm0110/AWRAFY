import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CustomersController],
  providers: [CustomersService, TenantGuard],
  exports: [CustomersService], // Public API — orders/loyalty كيستعملوها من هنا فقط
})
export class CustomersModule {}
