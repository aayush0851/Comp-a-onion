import { Equals, IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsBoolean()
  genderVisible?: boolean;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  proximityKm?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vibeTags?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  // Only ever flipped on — the app sends it once the user reaches the board.
  @IsOptional()
  @Equals(true)
  isOnboarded?: boolean;
}
