import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
}
