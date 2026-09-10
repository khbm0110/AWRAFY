import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('2fa/verify')
  async verify2fa(@Body() dto: Verify2faDto) {
    return this.authService.verify2fa(dto.tempToken, dto.code);
  }

  // بعد هاد النقطة، المستخدم عندو access token صحيح إجباري (session عادية)
  @Post('2fa/generate')
  @UseGuards(TenantGuard)
  async generate2fa(@Req() req: any) {
    return this.authService.generate2faSecret(req.user.id);
  }

  @Post('2fa/confirm')
  @UseGuards(TenantGuard)
  async confirm2fa(@Req() req: any, @Body('code') code: string) {
    return this.authService.confirm2fa(req.user.id, code);
  }
}
