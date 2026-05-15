import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { MemoryModule } from "../memory/memory.module";
import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { PromptContextBuilder } from "./prompt-context.builder";

@Module({
  imports: [AiModule, MemoryModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, PromptContextBuilder],
  exports: [ConversationsService],
})
export class ConversationsModule {}
