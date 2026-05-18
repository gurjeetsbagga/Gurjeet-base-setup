-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'PROVIDER');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'STREAMING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MemoryEntryType" AS ENUM ('CONVERSATION_SUMMARY', 'TOPIC_EXTRACTION', 'USER_PREFERENCE', 'HEALTH_INSIGHT', 'RECOVERY_NOTE', 'PROVIDER_NOTE', 'RECOMMENDATION', 'ACTION_OUTCOME', 'ONBOARDING_DATA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InstructionCategory" AS ENUM ('SYSTEM_PROMPT', 'RECOVERY_GUIDANCE', 'SAFETY_RULE', 'PERSONA_DIRECTIVE', 'TOPIC_BOUNDARY', 'ORCHESTRATION_CONTROL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InstructionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ModerationFlagType" AS ENUM ('PROMPT_INJECTION', 'MEDICAL_DIAGNOSIS', 'SAFETY_CONCERN', 'CONTENT_POLICY', 'USER_REPORT');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "RecoveryCategory" AS ENUM ('SURGICAL', 'INJURY', 'CHRONIC', 'MENTAL_HEALTH', 'WELLNESS', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "display_name" TEXT,
    "avatar_url" TEXT,
    "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "date_of_birth" DATE,
    "timezone" TEXT,
    "physician_practice" TEXT,
    "wellness_goal" TEXT,
    "recovery_category" "RecoveryCategory",
    "active_protocol" TEXT,
    "restrictions_allergies" TEXT,
    "product_preferences" TEXT,
    "important_notes" TEXT,
    "conversation_summary" TEXT,
    "extended_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "model" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "summary" TEXT,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" UUID,
    "role" "MessageRole" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'COMPLETED',
    "content" TEXT NOT NULL,
    "token_count" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "instruction_version_id" UUID,
    "feedback_rating" TEXT,
    "feedback_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_instructions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "InstructionCategory" NOT NULL,
    "status" "InstructionStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "targeting" JSONB NOT NULL DEFAULT '{}',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruction_versions" (
    "id" UUID NOT NULL,
    "instruction_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "InstructionCategory" NOT NULL,
    "targeting" JSONB NOT NULL DEFAULT '{}',
    "change_note" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instruction_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "MemoryEntryType" NOT NULL,
    "content" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "category" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "last_accessed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_embeddings" (
    "id" UUID NOT NULL,
    "memory_entry_id" UUID NOT NULL,
    "vector" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_label" TEXT,
    "target_type" TEXT,
    "target_id" TEXT,
    "target_label" TEXT,
    "outcome" TEXT NOT NULL DEFAULT 'success',
    "details" JSONB NOT NULL DEFAULT '{}',
    "request_id" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagged_interactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "flag_type" "ModerationFlagType" NOT NULL,
    "reason" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flagged_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "conversations_user_id_status_idx" ON "conversations"("user_id", "status");

-- CreateIndex
CREATE INDEX "conversations_user_id_updated_at_idx" ON "conversations"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_user_id_created_at_idx" ON "messages"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_instruction_version_id_idx" ON "messages"("instruction_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_instructions_slug_key" ON "admin_instructions"("slug");

-- CreateIndex
CREATE INDEX "admin_instructions_category_status_idx" ON "admin_instructions"("category", "status");

-- CreateIndex
CREATE INDEX "admin_instructions_status_priority_idx" ON "admin_instructions"("status", "priority");

-- CreateIndex
CREATE INDEX "instruction_versions_instruction_id_created_at_idx" ON "instruction_versions"("instruction_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "instruction_versions_instruction_id_version_key" ON "instruction_versions"("instruction_id", "version");

-- CreateIndex
CREATE INDEX "memory_entries_user_id_type_idx" ON "memory_entries"("user_id", "type");

-- CreateIndex
CREATE INDEX "memory_entries_user_id_is_active_importance_idx" ON "memory_entries"("user_id", "is_active", "importance");

-- CreateIndex
CREATE INDEX "memory_entries_user_id_category_idx" ON "memory_entries"("user_id", "category");

-- CreateIndex
CREATE INDEX "memory_entries_user_id_source_type_source_id_idx" ON "memory_entries"("user_id", "source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_embeddings_memory_entry_id_key" ON "memory_embeddings"("memory_entry_id");

-- CreateIndex
CREATE INDEX "audit_logs_category_created_at_idx" ON "audit_logs"("category", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_request_id_idx" ON "audit_logs"("request_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "flagged_interactions_status_created_at_idx" ON "flagged_interactions"("status", "created_at");

-- CreateIndex
CREATE INDEX "flagged_interactions_user_id_idx" ON "flagged_interactions"("user_id");

-- CreateIndex
CREATE INDEX "flagged_interactions_flag_type_status_idx" ON "flagged_interactions"("flag_type", "status");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruction_versions" ADD CONSTRAINT "instruction_versions_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "admin_instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_instruction_version_id_fkey" FOREIGN KEY ("instruction_version_id") REFERENCES "instruction_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_entries" ADD CONSTRAINT "memory_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_embeddings" ADD CONSTRAINT "memory_embeddings_memory_entry_id_fkey" FOREIGN KEY ("memory_entry_id") REFERENCES "memory_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
