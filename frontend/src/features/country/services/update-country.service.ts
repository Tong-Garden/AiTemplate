import { updateCountryMapper } from '../mappers';
import { countryRepo } from '../repo/country.repo';
import { updateCountrySchema } from '../schemas';
import type { CountryDto } from '../dtos';
import type { UpdateCountryFormData } from '../schemas';

/**
 * Validates form values, maps them to a DTO and updates the country.
 *
 * @param id - Country id.
 * @param formData - Fields to change.
 * @returns The updated country.
 * @throws ZodError when the values are invalid.
 */
export const updateCountryService = async (
  id: string,
  formData: UpdateCountryFormData,
): Promise<CountryDto> => {
  const validated = updateCountrySchema.parse(formData);
  return countryRepo.update(id, updateCountryMapper.toDto(validated));
};
