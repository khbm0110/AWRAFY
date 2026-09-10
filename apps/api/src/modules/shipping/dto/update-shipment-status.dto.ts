import { IsOptional, IsString } from 'class-validator';

export class UpdateShipmentStatusDto {
  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}
