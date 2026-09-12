import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class BoardQueryDto {
  // 0 = Tonight, 1 = Tomorrow, 2 = This week — matches mobile's FILTER_LABELS.
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1, 2])
  filter?: 0 | 1 | 2;
}
