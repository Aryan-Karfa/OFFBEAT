import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log("🌱 Starting OFFBEAT database seed...");

  // Deterministic demo user
  const demoEmail = "traveler@offbeat.internal";
  const demoUsername = "offbeat_traveler";

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      username: demoUsername,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: demoEmail,
      username: demoUsername,
      passwordHash: "$2b$10$epB3Q7kU8kS7qY9fC5vL.e0vV8wR2xW9zB8qA7tY6uI5oP4mN3lK2", // placeholder Argon2/Bcrypt hash
      status: UserStatus.ACTIVE,
    },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      displayName: "Offbeat Traveler",
      bio: "Curator of hidden trails, living root bridges, and high-altitude Himalayan monasteries.",
      homeCountry: "India",
    },
    create: {
      userId: user.id,
      displayName: "Offbeat Traveler",
      bio: "Curator of hidden trails, living root bridges, and high-altitude Himalayan monasteries.",
      homeCountry: "India",
    },
  });

  console.log(`✅ Seeded baseline user: ${user.username} (${user.id})`);
  console.log(`✅ Seeded baseline profile: ${profile.displayName} for user ${profile.userId}`);
  return { user, profile };
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main();
}
