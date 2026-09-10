import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})], // secret كيتقرا من ConfigService فـauth.module — هنا غير verify
  controllers: [TenantsController],
  providers: [TenantsService, TenantGuard],
  exports: [TenantsService], // Public API — أي module آخر خصو يستورد من هنا فقط
})
export class TenantsModule {}
