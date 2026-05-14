import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { MemoryEntryType } from "@prisma/client";
import { IsSafeText } from "../../../common/validators";

export class StoreMemoryDto {
  @IsEnum(MemoryEntryType)
  type!: MemoryEntryType;

  @IsSafeText({ maxLength: 50000 })
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourceType?: string;

  @IsOptional()
  @IsUUID("4")
  sourceId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  importance?: number;
}
