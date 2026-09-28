import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Valid email address is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and dashes",
    ),
  displayName: z.string().min(1, "Display name is required").max(60),
  bio: z.string().max(250).optional(),
  homeCountry: z.string().max(60).optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const getUserParamsSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(250).optional(),
  homeCountry: z.string().max(60).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
