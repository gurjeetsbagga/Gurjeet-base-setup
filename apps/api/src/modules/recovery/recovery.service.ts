import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);
}
