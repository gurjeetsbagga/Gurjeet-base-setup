import { Module } from "@nestjs/common";
import { OrchestrationService } from "./orchestration.service";
import { OrchestrationController } from "./orchestration.controller";

@Module({
  controllers: [OrchestrationController],
  providers: [OrchestrationService],
  exports: [OrchestrationService],
})
export class OrchestrationModule {}
