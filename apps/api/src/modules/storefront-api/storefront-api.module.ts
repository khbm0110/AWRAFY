import { Module } from '@nestjs/common';
import { StorefrontApiController } from './storefront-api.controller';
import { StorefrontApiService } from './storefront-api.service';
import { PublicTenantGuard } from '../../common/guards/public-tenant.guard';
import { ProductsModule } from '../products';
import { CategoriesModule } from '../categories';
import { OrdersModule } from '../orders';

@Module({
  imports: [ProductsModule, CategoriesModule, OrdersModule], // كلهم عبر index.ts
  controllers: [StorefrontApiController],
  providers: [StorefrontApiService, PublicTenantGuard],
})
export class StorefrontApiModule {}
