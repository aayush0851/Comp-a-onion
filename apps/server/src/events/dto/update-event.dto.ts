import { CostMode, EntryMode, GenderRestriction } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsMatches, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMatches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time must be in HH:MM 24-hour format' })
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
