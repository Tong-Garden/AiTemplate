import { countryRepo } from '../repo/country.repo';

/**
 * Deletes a country.
 *
 * @param id - Country id.
 */
export const deleteCountryService = async (id: string): Promise<void> => {
  return countryRepo.delete(id);
};
