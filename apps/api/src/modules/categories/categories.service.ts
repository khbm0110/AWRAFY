import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    // forTenant() كيزيد tenantId أوتوماتيك فـdata.create — انظر prisma.service.ts
    return this.prisma.forTenant(tenantId).category.create({ data: { ...dto, tenantId } });
  }

  async findAll(tenantId: string) {
    return this.prisma.forTenant(tenantId).category.findMany({});
  }
}
