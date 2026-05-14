import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateAiConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(32000)
  maxTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  guardrailsEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedPatterns?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  systemPromptOverride?: string | null;
}
