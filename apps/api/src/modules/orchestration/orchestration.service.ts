import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class OrchestrationService {
  private readonly logger = new Logger(OrchestrationService.name);
}
