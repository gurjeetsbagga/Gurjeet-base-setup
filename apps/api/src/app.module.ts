import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { SupabaseModule } from "./integrations/supabase";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),

    PrismaModule,
    SupabaseModule,

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
  ],
  controllers: [AppController],
})
export class AppModule {}
