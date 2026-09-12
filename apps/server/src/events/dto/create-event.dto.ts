import { CostMode, EntryMode, GenderRestriction } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsEnum(EntryMode)
  entryMode?: EntryMode;

  @IsInt()
  @Min(1)
  seatsTotal!: number;

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
