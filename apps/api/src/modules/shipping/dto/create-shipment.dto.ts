import { IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  carrierId?: string;
}
