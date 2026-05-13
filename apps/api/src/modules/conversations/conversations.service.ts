import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);
}
