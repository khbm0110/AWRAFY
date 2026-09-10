import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCarrierDto {
  @IsString()
  name!: string; // Ozonexpress, Ilamex, Aramex, DHD, Crono...

  @IsOptional()
  @IsObject()
  apiConfig?: Record<string, unknown>; // ⚠️ TODO: تشفير at-rest قبل production

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
