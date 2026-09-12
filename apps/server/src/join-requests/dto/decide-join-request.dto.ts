import { IsIn } from 'class-validator';

export class DecideJoinRequestDto {
  @IsIn(['APPROVED', 'DECLINED'])
  decision!: 'APPROVED' | 'DECLINED';
}
