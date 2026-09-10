import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Signup — كيدير tenant + store + owner user فـtransaction وحدة.
   * انظر docs/03-database-schema.md § tenants, users, stores
   */
  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.storeName },
      });

      const store = await tx.store.create({
        data: { tenantId: tenant.id, name: dto.storeName },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          role: 'owner',
        },
      });

      return { tenant, store, user };
    });

    return this.issueTokens(result.user.id, result.tenant.id, 'owner');
  }

  /**
   * Login — إذا 2FA مفعّلة، كنرجعو tempToken بدل التوكنات النهائية
   * (انظر docs/07-security-checklist.md § Merchant Account Security).
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.totpEnabled) {
      const tempToken = this.jwt.sign(
        { sub: user.id, purpose: '2fa_pending' },
        { secret: this.config.get('JWT_SECRET'), expiresIn: '5m' },
      );
      return { requires2FA: true, tempToken };
    }

    return this.issueTokens(user.id, user.tenantId, user.role);
  }

  async verify2fa(tempToken: string, code: string) {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwt.verify(tempToken, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired temp token');
    }

    if (payload.purpose !== '2fa_pending') {
      throw new UnauthorizedException('Invalid token purpose');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.totpSecret) throw new UnauthorizedException('2FA not configured');

    const valid = authenticator.verify({ token: code, secret: user.totpSecret });
    if (!valid) throw new UnauthorizedException('Invalid 2FA code');

    return this.issueTokens(user.id, user.tenantId, user.role);
  }

  /** خطوة 1: توليد secret + recovery codes، بلا تفعيل بعد */
  async generate2faSecret(userId: string) {
    const secret = authenticator.generateSecret();
    const recoveryCodes = Array.from({ length: 10 }, () =>
      randomBytes(5).toString('hex'),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret, // ⚠️ TODO: تشفير at-rest قبل production — انظر 07-security-checklist.md
        totpRecoveryCodes: recoveryCodes, // ⚠️ TODO: hash بدل plain قبل production
        totpEnabled: false, // ماكيتفعلش حتى يتأكد أول كود
      },
    });

    const otpauthUrl = authenticator.keyuri(userId, 'awrafy', secret);
    return { secret, otpauthUrl, recoveryCodes };
  }

  /** خطوة 2: تأكيد أول كود TOTP باش يتفعل 2FA فعليا */
  async confirm2fa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) throw new UnauthorizedException('Generate a secret first');

    const valid = authenticator.verify({ token: code, secret: user.totpSecret });
    if (!valid) throw new UnauthorizedException('Invalid code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });

    return { enabled: true };
  }

  private issueTokens(userId: string, tenantId: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, tenantId, role },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId, tenantId, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );
    return { accessToken, refreshToken };
  }
}
