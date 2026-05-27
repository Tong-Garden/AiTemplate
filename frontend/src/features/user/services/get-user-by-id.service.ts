import { userApi } from '../repo/user.api';
import type { UserDto } from '../dtos';

export const getUserByIdService = async (id: string): Promise<UserDto> => {
  if (!id) {
    throw new Error('User ID is required');
  }
  return userApi.getById(id);
};
