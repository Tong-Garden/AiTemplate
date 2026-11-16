import type { PaginatedResult } from '@/core/data/remote/api-types';
import { companyRepo } from '../repo/company.repo';
import { listCompaniesSchema } from '../schemas';
import type { CompanyDto } from '../dtos';

/**
 * Fetches one page of companies after validating the paging parameters.
 *
 * @param page - 1-based page number.
 * @param limit - Page size, 1 to 100.
 * @returns The page of companies and its pagination meta.
 */
export const getCompaniesService = async (
  page: number,
  limit: number,
): Promise<PaginatedResult<CompanyDto[]>> => {
  const params = listCompaniesSchema.parse({ page, limit });
  return companyRepo.getAll(params.page, params.limit);
};
