import { IsString } from 'class-validator';

export class CreateCodPaymentDto {
  @IsString()
  orderId!: string;
}
