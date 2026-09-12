import { Platform } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class RegisterTokenDto {
  @IsEnum(Platform)
  platform!: Platform;

  @IsString()
  pushToken!: string;
}
