import { Controller } from "@nestjs/common";
import { OrchestrationService } from "./orchestration.service";

@Controller("orchestration")
export class OrchestrationController {
  constructor(private readonly orchestrationService: OrchestrationService) {}
}
