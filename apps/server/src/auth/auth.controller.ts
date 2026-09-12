import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { AppleLoginDto } from './dto/apple-login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from './current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('google')
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.accessToken);
  }

  @Post('apple')
  loginWithApple(@Body() dto: AppleLoginDto) {
    return this.authService.loginWithApple(dto.identityToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: user.userId } });
  }
}
