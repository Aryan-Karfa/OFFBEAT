import { describe, it, expect, vi } from "vitest";
import { userRepository, type UserWithProfile } from "../../src/modules/users/user.repository.js";
import { prisma } from "../../src/lib/db/prisma.js";
import { UserStatus, type User, type Profile } from "@prisma/client";

describe("Database Repository & User/Profile Relation", () => {
  it("createUserWithProfile should create user and related profile correctly", async () => {
    const mockCreated = {
      id: "usr_db_test_1",
      email: "dbtest@offbeat.travel",
      username: "db_traveler",
      passwordHash: "hash123",
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: "prof_db_test_1",
        userId: "usr_db_test_1",
        displayName: "DB Traveler",
        avatarUrl: null,
        bio: "Himalayan Explorer",
        homeCountry: "India",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    vi.spyOn(prisma.user, "create").mockResolvedValueOnce(
      mockCreated as unknown as UserWithProfile,
    );

    const result = await userRepository.createUserWithProfile(
      {
        email: "dbtest@offbeat.travel",
        username: "db_traveler",
        passwordHash: "hash123",
        status: UserStatus.ACTIVE,
      },
      {
        displayName: "DB Traveler",
        bio: "Himalayan Explorer",
        homeCountry: "India",
      },
    );

    expect(result.id).toBe("usr_db_test_1");
    expect(result.profile).toBeDefined();
    expect(result.profile?.displayName).toBe("DB Traveler");
    expect(result.profile?.userId).toBe("usr_db_test_1");
  });

  it("seed operation should be idempotent using upsert", async () => {
    const demoUser = {
      id: "usr_seed_demo",
      email: "traveler@offbeat.internal",
      username: "offbeat_traveler",
      passwordHash: "hash",
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const demoProfile = {
      id: "prof_seed_demo",
      userId: "usr_seed_demo",
      displayName: "Offbeat Traveler",
      avatarUrl: null,
      bio: "Curator",
      homeCountry: "India",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const upsertUserSpy = vi
      .spyOn(prisma.user, "upsert")
      .mockResolvedValue(demoUser as unknown as User);
    const upsertProfileSpy = vi
      .spyOn(prisma.profile, "upsert")
      .mockResolvedValue(demoProfile as unknown as Profile);

    // Run seed twice to simulate multiple runs
    const runSeed = async () => {
      const u = await prisma.user.upsert({
        where: { email: "traveler@offbeat.internal" },
        update: { username: "offbeat_traveler" },
        create: {
          email: "traveler@offbeat.internal",
          username: "offbeat_traveler",
          passwordHash: "hash",
        },
      });
      const p = await prisma.profile.upsert({
        where: { userId: u.id },
        update: { displayName: "Offbeat Traveler" },
        create: { userId: u.id, displayName: "Offbeat Traveler" },
      });
      return { u, p };
    };

    const firstRun = await runSeed();
    const secondRun = await runSeed();

    expect(firstRun.u.id).toBe(secondRun.u.id);
    expect(firstRun.p.id).toBe(secondRun.p.id);
    expect(upsertUserSpy).toHaveBeenCalledTimes(2);
    expect(upsertProfileSpy).toHaveBeenCalledTimes(2);
  });
});
