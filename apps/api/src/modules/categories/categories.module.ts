import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CategoriesController],
  providers: [CategoriesService, TenantGuard],
  exports: [CategoriesService],
})
export class CategoriesModule {}
