import { createCountryMapper } from '../mappers';
import { countryRepo } from '../repo/country.repo';
import { createCountrySchema } from '../schemas';
import type { CountryDto } from '../dtos';
import type { CreateCountryFormData } from '../schemas';

/**
 * Validates form values, maps them to a DTO and creates the country.
 *
 * @param formData - Raw form values.
 * @returns The created country.
 * @throws ZodError when the values are invalid.
 */
export const createCountryService = async (
  formData: CreateCountryFormData,
): Promise<CountryDto> => {
  const validated = createCountrySchema.parse(formData);
  return countryRepo.create(createCountryMapper.toDto(validated));
};
