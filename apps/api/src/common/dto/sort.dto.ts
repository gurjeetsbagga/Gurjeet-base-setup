import { IsIn, IsOptional, IsString } from "class-validator";

/**
 * Base sort query parameter.
 *
 * Usage:
 *   class ListUsersDto extends PaginationDto {
 *     @IsOptional()
 *     @IsIn(["createdAt", "name", "email"])
 *     sortBy?: string = "createdAt";
 *
 *     @IsOptional()
 *     @IsIn(["asc", "desc"])
 *     sortOrder?: SortOrder = "desc";
 *   }
 */
export type SortOrder = "asc" | "desc";

export class SortDto {
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder: SortOrder = "desc";
}
