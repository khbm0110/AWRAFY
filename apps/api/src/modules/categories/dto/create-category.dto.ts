import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsObject() // {"ar": "...", "fr": "...", "en": "..."} — انظر docs/06-i18n-guidelines.md
  name!: Record<string, string>;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
