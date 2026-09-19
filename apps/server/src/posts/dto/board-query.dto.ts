import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class BoardQueryDto {
  // 0 = Tonight, 1 = Tomorrow, 2 = This week — matches mobile's FILTER_LABELS.
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1, 2])
  filter?: 0 | 1 | 2;

  // Archived posts are left out unless this is explicitly 'true'.
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  archiveLookup?: boolean;

  // 0 = Duo, 1 = Group, 2 = any size.
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1, 2])
  groupSize?: 0 | 1 | 2;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  womenOnly?: boolean;

  // Comma-separated plan types, e.g. "Coffee,Movie".
  @IsOptional()
  @IsString()
  types?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  // Search radius in km, taken from the app's filters.
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  proximityKm?: number;
}
