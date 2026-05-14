import { IsUUID } from "class-validator";

/**
 * Route parameter validation for UUID-based resource IDs.
 *
 * Usage:
 *   @Get(":id")
 *   findOne(@Param() { id }: IdParamDto) { ... }
 */
export class IdParamDto {
  @IsUUID("4")
  id!: string;
}
