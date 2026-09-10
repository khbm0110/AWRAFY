import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
@UseGuards(TenantGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(tenantId, dto);
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.categoriesService.findAll(tenantId);
  }
}
