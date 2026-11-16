import { z } from 'zod';

/** Default page size for list requests. */
export const DEFAULT_LIMIT = 20;

/** Validation for list query parameters; mirrors the backend's page and limit bounds. */
export const listUsersSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

/** Validated list query parameters. */
export type ListUsersParams = z.infer<typeof listUsersSchema>;
