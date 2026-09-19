import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { verifyGoogleAccessToken } from './verifiers/google-verifier.js';
import { verifyAppleIdentityToken } from './verifiers/apple-verifier.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async loginWithGoogle(accessToken: string) {
    const { email } = await this.tryVerify(() => verifyGoogleAccessToken(accessToken));
    return this.issueSession(email, 'GOOGLE');
  }

  async loginWithApple(identityToken: string) {
    const { email } = await this.tryVerify(() => verifyAppleIdentityToken(identityToken));
    return this.issueSession(email, 'APPLE');
  }

  private async tryVerify<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch {
      throw new UnauthorizedException('Could not verify identity token');
    }
  }

  private async issueSession(email: string, provider: AuthProvider) {
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, authProvider: provider },
    });
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { accessToken, user };
  }
}
