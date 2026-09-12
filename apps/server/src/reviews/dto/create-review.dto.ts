import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class PersonReviewInputDto {
  @IsString()
  revieweeId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  meetAgain?: boolean;

  @IsOptional()
  @IsBoolean()
  flagged?: boolean;
}

export class CreateReviewDto {
  @IsObject()
  setupScores!: Record<string, number>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  setupTags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonReviewInputDto)
  personReviews!: PersonReviewInputDto[];
}
