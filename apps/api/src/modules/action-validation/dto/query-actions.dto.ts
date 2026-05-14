import { IsIn, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "../../../common/dto/pagination.dto";
import type { ActionStatus, ActionType } from "../interfaces";

export class QueryActionsDto extends PaginationDto {
  @IsOptional()
  @IsIn([
    "schedule_appointment",
    "log_symptom",
    "read_article",
    "start_exercise",
    "medication_reminder",
    "journal_prompt",
    "contact_provider",
    "update_recovery_plan",
    "store_memory",
    "update_preferences",
  ])
  type?: ActionType;

  @IsOptional()
  @IsIn([
    "pending_validation",
    "validated",
    "pending_approval",
    "approved",
    "rejected",
    "executing",
    "completed",
    "failed",
    "expired",
  ])
  status?: ActionStatus;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
