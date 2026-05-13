import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class PhysicianosService {
  private readonly logger = new Logger(PhysicianosService.name);
}
