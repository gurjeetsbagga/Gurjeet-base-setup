import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const log = (...args: unknown[]) => process.stdout.write(args.join(" ") + "\n");

async function main() {
  log("🌱 Seeding Auryn database...\n");

  // ── Admin user ──────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: "admin@auryn.app" },
    update: {},
    create: {
      authId: "00000000-0000-0000-0000-000000000001",
      email: "admin@auryn.app",
      role: "ADMIN",
      displayName: "Auryn Admin",
      onboardingStatus: "COMPLETED",
      isActive: true,
    },
  });

  log(`  ✓ Admin user: ${admin.email} (${admin.id})`);

  // ── Dev test user ───────────────────────────────────────────

  const devUser = await prisma.user.upsert({
    where: { email: "dev@auryn.app" },
    update: {},
    create: {
      authId: "00000000-0000-0000-0000-000000000002",
      email: "dev@auryn.app",
      role: "USER",
      displayName: "Dev Tester",
      onboardingStatus: "NOT_STARTED",
      isActive: true,
    },
  });

  log(`  ✓ Dev user:   ${devUser.email} (${devUser.id})`);

  // ── Dev user profile ────────────────────────────────────────

  await prisma.userProfile.upsert({
    where: { userId: devUser.id },
    update: {},
    create: {
      userId: devUser.id,
      firstName: "Dev",
      lastName: "Tester",
      wellnessGoal: "General wellness and recovery monitoring",
      recoveryCategory: "WELLNESS",
      timezone: "America/New_York",
    },
  });

  log("  ✓ Dev user profile created");

  // ── Admin instructions ──────────────────────────────────────

  const instructions = [
    {
      slug: "base-persona",
      title: "Auryn Base Persona",
      description: "Core personality and behavioral guidelines for the AI assistant.",
      category: "SYSTEM_PROMPT" as const,
      content: [
        "You are Auryn, an AI wellness companion focused on personalized health intelligence and guided recovery.",
        "You are calm, knowledgeable, empathetic, and supportive.",
        "You never diagnose medical conditions or prescribe treatments.",
        "You encourage users to consult healthcare professionals for medical decisions.",
        "You respect user boundaries and never push unwanted advice.",
        "You remember user context across conversations to provide personalized guidance.",
      ].join("\n"),
      priority: 1,
    },
    {
      slug: "safety-medical-boundary",
      title: "Medical Safety Boundary",
      description:
        "Prevents the AI from crossing into medical diagnosis or prescription territory.",
      category: "SAFETY_RULE" as const,
      content: [
        "NEVER provide specific medical diagnoses.",
        "NEVER recommend specific medications or dosages.",
        "NEVER interpret lab results or imaging.",
        "ALWAYS recommend consulting a healthcare professional for medical concerns.",
        "If a user describes a medical emergency, instruct them to call emergency services immediately.",
      ].join("\n"),
      priority: 10,
    },
    {
      slug: "recovery-guidance-general",
      title: "General Recovery Guidance",
      description: "Broad recovery support instructions applicable to all recovery categories.",
      category: "RECOVERY_GUIDANCE" as const,
      content: [
        "When discussing recovery, focus on evidence-based wellness practices.",
        "Encourage adherence to prescribed recovery protocols without modifying them.",
        "Track progress longitudinally and celebrate milestones.",
        "Flag potential concerns for provider review without alarming the user.",
        "Suggest gentle, appropriate wellness activities based on the user's recovery stage.",
      ].join("\n"),
      priority: 50,
    },
  ];

  for (const instr of instructions) {
    const created = await prisma.adminInstruction.upsert({
      where: { slug: instr.slug },
      update: {},
      create: {
        ...instr,
        status: "ACTIVE",
        targeting: {},
        createdBy: admin.id,
      },
    });

    await prisma.instructionVersion.upsert({
      where: {
        instructionId_version: {
          instructionId: created.id,
          version: 1,
        },
      },
      update: {},
      create: {
        instructionId: created.id,
        version: 1,
        content: instr.content,
        title: instr.title,
        category: instr.category,
        targeting: {},
        changeNote: "Initial version",
        createdBy: admin.id,
      },
    });

    log(`  ✓ Instruction: ${instr.slug}`);
  }

  log("\n✅ Seed complete.\n");
}

main()
  .catch((e) => {
    process.stderr.write(`❌ Seed failed: ${e}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
