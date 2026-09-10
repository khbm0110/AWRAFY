import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [JwtModule.register({})], // secrets كيتقراو من ConfigService داخل الـservice
  controllers: [AuthController],
  providers: [AuthService, TenantGuard],
  exports: [AuthService],
})
export class AuthModule {}
