import type { PaginatedResult } from '@/core/data/remote/api-types';
import { countryRepo } from '../repo/country.repo';
import { listCountriesSchema } from '../schemas';
import type { CountryDto } from '../dtos';

/**
 * Fetches one page of countries after validating the paging parameters.
 *
 * @param page - 1-based page number.
 * @param limit - Page size, 1 to 100.
 * @returns The page of countries and its pagination meta.
 */
export const getCountriesService = async (
  page: number,
  limit: number,
): Promise<PaginatedResult<CountryDto[]>> => {
  const params = listCountriesSchema.parse({ page, limit });
  return countryRepo.getAll(params.page, params.limit);
};
