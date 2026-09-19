import { POST_DESCRIPTION_MAX, POST_TITLE_MAX, VENUE_PATTERN, VENUE_TEXT_MAX } from '@companion/common';
import { CostMode, EntryMode, GenderRestriction } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Matches, Min } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(POST_TITLE_MAX)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(POST_DESCRIPTION_MAX)
  description?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time must be in HH:MM 24-hour format' })
  time?: string;

  @IsOptional()
  @IsString()
  @Matches(VENUE_PATTERN, { message: `venue must be a link or at most ${VENUE_TEXT_MAX} characters` })
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
