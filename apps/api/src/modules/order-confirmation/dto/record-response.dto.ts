import { IsIn } from 'class-validator';

export class RecordResponseDto {
  @IsIn(['confirmed', 'no_response', 'rejected'])
  status!: string;
}
