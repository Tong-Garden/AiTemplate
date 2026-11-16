import { userRepo } from '../repo/user.repo';
import type { UserDto } from '../dtos';

/**
 * Fetches one user.
 *
 * @param id - User id.
 * @returns The user.
 */
export const getUserByIdService = async (id: string): Promise<UserDto> => userRepo.getById(id);
