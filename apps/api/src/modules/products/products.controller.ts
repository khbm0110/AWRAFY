import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Controller('products')
@UseGuards(TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(tenantId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ListProductsDto,
  ) {
    return this.productsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.productsService.findOne(tenantId, id);
  }

  @Patch(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.productsService.remove(tenantId, id);
  }
}
