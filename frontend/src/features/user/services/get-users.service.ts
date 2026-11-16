import type { PaginatedResult } from '@/core/data/remote/api-types';
import { userRepo } from '../repo/user.repo';
import { listUsersSchema } from '../schemas';
import type { UserDto } from '../dtos';

/**
 * Fetches one page of users after validating the paging parameters.
 *
 * @param page - 1-based page number.
 * @param limit - Page size, 1 to 100.
 * @returns The page of users and its pagination meta.
 * @throws ZodError when page or limit is out of range.
 */
export const getUsersService = async (
  page: number,
  limit: number,
): Promise<PaginatedResult<UserDto[]>> => {
  const params = listUsersSchema.parse({ page, limit });
  return userRepo.getAll(params.page, params.limit);
};
