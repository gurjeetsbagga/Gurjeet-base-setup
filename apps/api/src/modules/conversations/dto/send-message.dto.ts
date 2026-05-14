import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import { IsSafeText } from "../../../common/validators";

export class SendMessageDto {
  @IsSafeText({ maxLength: 10000 })
  message!: string;

  /** Hint passed to the AI for context (e.g. "user is on the recovery dashboard") */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;

  /**
   * If true, the response will be streamed via SSE.
   * The controller returns a text/event-stream response
   * instead of a JSON body.
   */
  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}
