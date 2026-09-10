import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PublicTenantGuard } from '../../common/guards/public-tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { StorefrontApiService } from './storefront-api.service';
import { ListProductsDto } from '../products';
import { CreateOrderDto } from '../orders';

// @UseGuards(PublicTenantGuard) — ماشي TenantGuard: بلا JWT، الزبون بلا حساب
@Controller('storefront')
@UseGuards(PublicTenantGuard)
export class StorefrontApiController {
  constructor(private readonly storefrontApiService: StorefrontApiService) {}

  @Get('products')
  async listProducts(
    @CurrentTenant() tenantId: string,
    @Query() query: ListProductsDto,
  ) {
    return this.storefrontApiService.listProducts(tenantId, query);
  }

  @Get('products/:slug')
  async getProduct(
    @CurrentTenant() tenantId: string,
    @Param('slug') slug: string,
  ) {
    return this.storefrontApiService.getProductBySlug(tenantId, slug);
  }

  @Get('categories')
  async listCategories(@CurrentTenant() tenantId: string) {
    return this.storefrontApiService.listCategories(tenantId);
  }

  @Post('orders')
  async createOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.storefrontApiService.createOrder(tenantId, dto);
  }
}
