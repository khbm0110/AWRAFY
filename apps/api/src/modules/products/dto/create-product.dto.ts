import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VariantInput {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;
}

export class CreateProductDto {
  @IsObject() // {"ar": "...", "fr": "...", "en": "..."} — إجباري، انظر docs/06-i18n-guidelines.md
  title!: Record<string, string>;

  @IsOptional()
  @IsObject()
  description?: Record<string, string>;

  @IsString()
  slug!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string; // افتراضي MAD فالـservice

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(['draft', 'active'])
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInput)
  variants?: VariantInput[];
}
