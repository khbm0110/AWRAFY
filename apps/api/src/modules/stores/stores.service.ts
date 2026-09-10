import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    const store = await this.prisma.forTenant(tenantId).store.findFirst({});
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async update(tenantId: string, dto: UpdateStoreDto) {
    const store = await this.findByTenant(tenantId); // كيتأكد الملكية قبل التعديل
    return this.prisma.forTenant(tenantId).store.update({
      where: { id: store.id },
      data: dto,
    });
  }
}
