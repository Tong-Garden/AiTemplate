import { countryRepo } from '../repo/country.repo';
import type { CountryDto } from '../dtos';

/**
 * Fetches a single country.
 *
 * @param id - Country id.
 * @returns The country.
 */
export const getCountryByIdService = async (id: string): Promise<CountryDto> => {
  return countryRepo.getById(id);
};
