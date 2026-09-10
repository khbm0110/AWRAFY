import { IsArray, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['ar', 'fr', 'en']) // انظر docs/06-i18n-guidelines.md
  defaultLocale?: string;

  @IsOptional()
  @IsArray()
  supportedLocales?: string[];

  @IsOptional()
  @IsObject()
  theme?: Record<string, unknown>;
}
