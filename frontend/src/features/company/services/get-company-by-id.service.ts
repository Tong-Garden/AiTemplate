import { companyRepo } from '../repo/company.repo';
import type { CompanyDto } from '../dtos';

/**
 * Fetches a single company.
 *
 * @param id - Company id.
 * @returns The company.
 */
export const getCompanyByIdService = async (id: string): Promise<CompanyDto> => {
  return companyRepo.getById(id);
};
