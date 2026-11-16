import { companyRepo } from '../repo/company.repo';

/**
 * Deletes a company.
 *
 * @param id - Company id.
 */
export const deleteCompanyService = async (id: string): Promise<void> => {
  return companyRepo.delete(id);
};
