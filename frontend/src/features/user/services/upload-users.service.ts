import { userApi } from '../repo/user.api';

export const uploadUsersService = async (
  file: File,
): Promise<{ count: number; message: string }> => {
  if (!file) {
    throw new Error('File is required');
  }

  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    throw new Error('File must be an Excel file (.xlsx or .xls)');
  }

  return userApi.uploadUsers(file);
};
