import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global — Prisma متاحة فكل module بلا import متكرر، هي infrastructure ماشي business logic
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
