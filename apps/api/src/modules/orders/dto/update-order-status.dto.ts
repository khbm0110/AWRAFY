import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status!: string;
}
