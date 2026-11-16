import type { CreateCountryDto } from '../dtos';
import type { createCountrySchema } from '../schemas';
import type { z } from 'zod';

type ValidatedCreateCountry = z.output<typeof createCountrySchema>;

/** Maps validated create-country values to the request DTO. */
export const createCountryMapper = {
  toDto: (data: ValidatedCreateCountry): CreateCountryDto => ({
    name: data.name,
    iso_code: data.iso_code,
    phone_code: data.phone_code,
  }),
};
