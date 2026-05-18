import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { SupabaseModule } from "./integrations/supabase";
import { MailModule } from "./integrations/mail/mail.module";
import { AurynLoggerModule, CorrelationMiddleware } from "./common/logger";
import { RequestIdMiddleware } from "./common/middleware";
import { AurynThrottlerGuard } from "./common/throttle";
import { THROTTLE_GLOBAL, THROTTLE_AI, THROTTLE_AUTH, THROTTLE_STRICT } from "./common/throttle";
import {
  appConfig,
  databaseConfig,
  authConfig,
  openaiConfig,
  supabaseConfig,
  rateLimitConfig,
  loggingConfig,
} from "./config";
import type { RateLimitConfig } from "./config";
import { HealthModule } from "./modules/health/health.module";
import { AiModule } from "./modules/ai/ai.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { MemoryModule } from "./modules/memory/memory.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { RecoveryModule } from "./modules/recovery/recovery.module";
import { RecommendationsModule } from "./modules/recommendations/recommendations.module";
import { PhysicianosModule } from "./modules/physicianos/physicianos.module";
import { OrchestrationModule } from "./modules/orchestration/orchestration.module";
import { AdminModule } from "./modules/admin/admin.module";
import { ActionValidationModule } from "./modules/action-validation/action-validation.module";
import { AuditLogModule } from "./modules/audit-logs/audit-logs.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        openaiConfig,
        supabaseConfig,
        rateLimitConfig,
        loggingConfig,
      ],
    }),

    PrismaModule,

    AurynLoggerModule,

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const cfg = configService.get<RateLimitConfig>("rateLimit")!;
        return {
          throttlers: [
            { name: THROTTLE_GLOBAL, ttl: cfg.globalTtl * 1000, limit: cfg.globalLimit },
            { name: THROTTLE_AI, ttl: cfg.aiTtl * 1000, limit: cfg.aiLimit },
            { name: THROTTLE_AUTH, ttl: cfg.authTtl * 1000, limit: cfg.authLimit },
            { name: THROTTLE_STRICT, ttl: cfg.strictTtl * 1000, limit: cfg.strictLimit },
          ],
        };
      },
    }),

    SupabaseModule,
    MailModule,

    AuditLogModule,

    HealthModule,
    AiModule,
    AuthModule,
    UsersModule,
    MemoryModule,
    ConversationsModule,
    RecoveryModule,
    RecommendationsModule,
    PhysicianosModule,
    OrchestrationModule,
    AdminModule,
    ActionValidationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AurynThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, CorrelationMiddleware).forRoutes("*");
  }
}
