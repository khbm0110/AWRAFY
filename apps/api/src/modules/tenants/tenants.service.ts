import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.tenant.create({ data: { name } });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }
}
