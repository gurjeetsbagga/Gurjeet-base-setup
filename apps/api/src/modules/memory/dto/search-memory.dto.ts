import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { MemoryEntryType } from "@prisma/client";
import { IsSafeText } from "../../../common/validators";

export class SearchMemoryDto {
  @IsSafeText({ maxLength: 2000 })
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsEnum(MemoryEntryType)
  type?: MemoryEntryType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  minImportance?: number;
}
