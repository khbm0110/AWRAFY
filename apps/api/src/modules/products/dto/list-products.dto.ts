import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// Pagination إجبارية على كل endpoint list — انظر docs/08-code-quality-performance.md
export class ListProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // حد أقصى — بلا "رجع كل النتائج"
  limit?: number = 20;

  @IsOptional()
  @IsIn(['draft', 'active', 'archived'])
  status?: string;
}
