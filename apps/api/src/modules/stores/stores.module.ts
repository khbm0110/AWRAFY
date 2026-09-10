import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [StoresController],
  providers: [StoresService, TenantGuard],
  exports: [StoresService],
})
export class StoresModule {}
