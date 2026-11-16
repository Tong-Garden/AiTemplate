import { userRepo } from '../repo/user.repo';
import type { UploadUsersResultDto } from '../dtos';

const EXCEL_EXTENSIONS = ['.xlsx', '.xls'];

/**
 * Checks the file is an Excel workbook and uploads it.
 *
 * @param file - The workbook chosen by the user.
 * @returns How many users were imported.
 * @throws Error when the file is not an Excel workbook.
 */
export const uploadUsersService = async (file: File): Promise<UploadUsersResultDto> => {
  if (!EXCEL_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension))) {
    throw new Error('File must be an Excel file (.xlsx or .xls)');
  }
  return userRepo.uploadUsers(file);
};
