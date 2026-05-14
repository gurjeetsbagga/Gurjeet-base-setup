import { IsEnum, IsOptional, IsString } from "class-validator";
import { ConversationStatus } from "@prisma/client";
import { PaginationDto } from "../../../common/dto";

export class QueryConversationsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;
}
