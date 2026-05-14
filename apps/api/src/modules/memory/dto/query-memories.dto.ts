import { IsEnum, IsOptional, IsString } from "class-validator";
import { MemoryEntryType } from "@prisma/client";
import { PaginationDto } from "../../../common/dto";

export class QueryMemoriesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(MemoryEntryType)
  type?: MemoryEntryType;

  @IsOptional()
  @IsString()
  sourceType?: string;
}
