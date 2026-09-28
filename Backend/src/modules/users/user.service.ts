import { userRepository, type UserRepository, type UserWithProfile } from "./user.repository.js";
import type { CreateUserInput } from "./user.schema.js";
import { ConflictError, NotFoundError } from "../../lib/errors/AppError.js";
import { UserStatus } from "@prisma/client";

export interface SanitizedUser {
  id: string;
  email: string;
  username: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    homeCountry: string | null;
  } | null;
}

export function sanitizeUser(user: UserWithProfile): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile
      ? {
          id: user.profile.id,
          displayName: user.profile.displayName,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
          homeCountry: user.profile.homeCountry,
        }
      : null,
  };
}

export class UserService {
  constructor(private repo: UserRepository = userRepository) {}

  async getUserById(id: string): Promise<SanitizedUser> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    return sanitizeUser(user);
  }

  async createUser(input: CreateUserInput): Promise<SanitizedUser> {
    const existingEmail = await this.repo.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError("A user with this email address already exists.");
    }

    const existingUsername = await this.repo.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError("A user with this username already exists.");
    }

    const created = await this.repo.createUserWithProfile(
      {
        email: input.email,
        username: input.username,
        passwordHash: "uninitialized_foundation_hash",
        status: UserStatus.ACTIVE,
      },
      {
        displayName: input.displayName,
        bio: input.bio,
        homeCountry: input.homeCountry,
        avatarUrl: input.avatarUrl,
      },
    );

    return sanitizeUser(created);
  }

  async listUsers(limit: number = 20, offset: number = 0): Promise<SanitizedUser[]> {
    const users = await this.repo.listUsers(limit, offset);
    return users.map(sanitizeUser);
  }
}

export const userService = new UserService();
