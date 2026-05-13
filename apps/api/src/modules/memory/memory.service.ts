import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
}
