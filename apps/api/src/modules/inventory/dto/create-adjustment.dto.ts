import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAdjustmentDto {
  @IsString()
  variantId!: string;

  @IsInt() // موجب أو سالب — restock مثلا +10، damaged مثلا -2
  quantityChange!: number;

  @IsIn(['offline_sale', 'damaged', 'manual_correction', 'restock'])
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
