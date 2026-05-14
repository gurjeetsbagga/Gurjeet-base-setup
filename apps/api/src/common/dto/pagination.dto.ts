import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

/**
 * Base pagination query parameters.
 *
 * Usage:
 *   @Get()
 *   list(@Query() query: PaginationDto) { ... }
 *
 * Validated, transformed, and clamped automatically:
 *   - page defaults to 1, min 1
 *   - pageSize defaults to 20, min 1, max 100
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}
