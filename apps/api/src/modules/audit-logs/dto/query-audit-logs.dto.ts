import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { PaginationDto } from "../../../common/dto/pagination.dto";
import type { AuditCategory, AuditOutcome } from "../interfaces";

/**
 * DTO for querying audit logs.
 * Available to admins via the admin audit endpoint.
 */
export class QueryAuditLogsDto extends PaginationDto {
  @IsOptional()
  @IsIn(["auth", "user", "conversation", "ai", "action", "memory", "admin", "moderation", "system"])
  category?: AuditCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  actorId?: string;

  @IsOptional()
  @IsIn(["user", "admin", "system", "ai"])
  actorType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  targetType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetId?: string;

  @IsOptional()
  @IsIn(["success", "failure", "denied", "error"])
  outcome?: AuditOutcome;

  @IsOptional()
  @IsUUID()
  requestId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
