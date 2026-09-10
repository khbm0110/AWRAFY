import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth';
import { TenantsModule } from './modules/tenants';
import { StoresModule } from './modules/stores';
import { CategoriesModule } from './modules/categories';
import { ProductsModule } from './modules/products';
import { CustomersModule } from './modules/customers';
import { InventoryModule } from './modules/inventory';
import { OrdersModule } from './modules/orders';
import { PaymentsModule } from './modules/payments';
import { ShippingModule } from './modules/shipping';
import { OrderConfirmationModule } from './modules/order-confirmation';
import { StorefrontApiModule } from './modules/storefront-api';
import { BillingModule } from './modules/billing';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    StoresModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    ShippingModule,
    OrderConfirmationModule,
    StorefrontApiModule,
    BillingModule,
    // Modules جدد كيتزادو هنا فقط، كل واحد عبر index.ts ديالو
    // انظر docs/02-architecture.md قبل زيادة أي module جديد
  ],
})
export class AppModule {}
