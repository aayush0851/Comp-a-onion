import { CostMode, EntryMode, GenderRestriction } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsEnum(EntryMode)
  entryMode?: EntryMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  seatsTotal?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(GenderRestriction)
  genderRestriction?: GenderRestriction;

  @IsOptional()
  @IsEnum(CostMode)
  costMode?: CostMode;
}
