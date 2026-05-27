import { userApi } from '../repo/user.api';
import type { UserDto } from '../dtos';

export const getUsersService = async (): Promise<UserDto[]> => {
  return userApi.getAll();
};
