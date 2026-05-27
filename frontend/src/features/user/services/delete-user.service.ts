import { userApi } from '../repo/user.api';

export const deleteUserService = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('User ID is required');
  }
  return userApi.delete(id);
};
