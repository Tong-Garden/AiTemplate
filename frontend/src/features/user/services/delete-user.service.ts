import { userRepo } from '../repo/user.repo';

/**
 * Deletes a user.
 *
 * @param id - User id.
 */
export const deleteUserService = async (id: string): Promise<void> => userRepo.delete(id);
