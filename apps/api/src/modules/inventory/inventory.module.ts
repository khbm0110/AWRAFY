import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [InventoryController],
  providers: [InventoryService, TenantGuard],
  exports: [InventoryService], // orders غادي يستعملها لـdecrementForOrder
})
export class InventoryModule {}
