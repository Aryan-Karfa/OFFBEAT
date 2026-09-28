import { prisma } from "../../lib/db/prisma.js";
import type { Prisma, User, Profile } from "@prisma/client";

export type UserWithProfile = User & { profile: Profile | null };

export class UserRepository {
  async findById(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findByUsername(username: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { username },
      include: { profile: true },
    });
  }

  async createUserWithProfile(
    userData: Prisma.UserCreateInput,
    profileData: Omit<Prisma.ProfileCreateWithoutUserInput, "user">,
  ): Promise<UserWithProfile> {
    return prisma.user.create({
      data: {
        ...userData,
        profile: {
          create: profileData,
        },
      },
      include: { profile: true },
    });
  }

  async listUsers(limit: number = 20, offset: number = 0): Promise<UserWithProfile[]> {
    return prisma.user.findMany({
      take: limit,
      skip: offset,
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const userRepository = new UserRepository();
