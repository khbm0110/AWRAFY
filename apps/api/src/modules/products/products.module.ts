import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ProductsController],
  providers: [ProductsService, TenantGuard],
  exports: [ProductsService], // orders/checkout غادي يحتاجوها لاحقا عبر هاد الـexport فقط
})
export class ProductsModule {}
